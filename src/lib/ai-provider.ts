import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import {
  generateText,
  streamText,
  type LanguageModel,
  type ModelMessage,
} from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Verified free models from OpenRouter API (2026-03-17)
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "qwen/qwen3-coder:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
] as const;

// Rate limit tracking per model
const WINDOW_MS = 60_000;
const MAX_RPM = 18; // 90% of ~20 RPM free tier limit
const COOLDOWN_MS = 30_000; // 30s cooldown after 429/error

interface ModelState {
  timestamps: number[];
  cooldownUntil: number;
}

const state = new Map<string, ModelState>();

function getState(id: string): ModelState {
  if (!state.has(id)) state.set(id, { timestamps: [], cooldownUntil: 0 });
  return state.get(id)!;
}

function isAvailable(id: string): boolean {
  const now = Date.now();
  const s = getState(id);
  if (s.cooldownUntil > now) return false;
  s.timestamps = s.timestamps.filter((t) => now - t < WINDOW_MS);
  return s.timestamps.length < MAX_RPM;
}

function recordUse(id: string) {
  getState(id).timestamps.push(Date.now());
}

function cooldown(id: string) {
  getState(id).cooldownUntil = Date.now() + COOLDOWN_MS;
  console.warn(`[Athena] ${id} → cooldown 30s`);
}

let robin = 0;

/**
 * Find a working free model by doing a 1-token preflight check.
 * This prevents broken streams from reaching the client.
 */
async function findWorkingModel(): Promise<{
  model: LanguageModel;
  id: string;
} | null> {
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const id = FREE_MODELS[(robin + i) % FREE_MODELS.length];
    if (!isAvailable(id)) continue;

    const model = openrouter(id);
    recordUse(id);

    try {
      await generateText({ model, prompt: "ok", maxOutputTokens: 1 });
      robin = ((robin + i) % FREE_MODELS.length + 1) % FREE_MODELS.length;
      console.log(`[Athena] Preflight OK → ${id}`);
      return { model, id };
    } catch {
      console.warn(`[Athena] Preflight FAIL → ${id}`);
      cooldown(id);
    }
  }
  return null;
}

/**
 * Stream a response using a verified free model, or OpenAI as last resort.
 */
export async function streamWithFallback(options: {
  system: string;
  messages: ModelMessage[];
}) {
  const picked = await findWorkingModel();

  if (picked) {
    recordUse(picked.id);
    console.log(`[Athena] Streaming with ${picked.id}`);
    return streamText({
      model: picked.model,
      system: options.system,
      messages: options.messages,
    });
  }

  // All free models unavailable — OpenAI fallback
  console.log("[Athena] All free models down → OpenAI GPT-4o-mini");
  return streamText({
    model: openai("gpt-4o-mini"),
    system: options.system,
    messages: options.messages,
  });
}
