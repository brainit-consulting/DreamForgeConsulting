import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { streamText, type LanguageModel, type ModelMessage } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Free OpenRouter models (round-robin)
const FREE_MODELS = [
  "google/gemma-3-1b-it:free",
  "meta-llama/llama-4-scout:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "microsoft/phi-4-reasoning:free",
  "qwen/qwen3-8b:free",
] as const;

let currentIndex = 0;

function getNextFreeModel(): LanguageModel {
  const modelId = FREE_MODELS[currentIndex % FREE_MODELS.length];
  currentIndex++;
  console.log(`[Athena] Using free model: ${modelId}`);
  return openrouter(modelId);
}

function getOpenAIFallback(): LanguageModel {
  console.log("[Athena] Falling back to OpenAI GPT-4o-mini");
  return openai("gpt-4o-mini");
}

/**
 * Try streaming with free OpenRouter models, cycling through them.
 * If all fail, fall back to OpenAI.
 */
export async function streamWithFallback(options: {
  system: string;
  messages: ModelMessage[];
}) {
  const startIndex = currentIndex;

  // Try each free model once
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = getNextFreeModel();
    try {
      return streamText({
        model,
        system: options.system,
        messages: options.messages,
      });
    } catch (error) {
      const modelId = FREE_MODELS[(startIndex + i) % FREE_MODELS.length];
      console.warn(`[Athena] Model ${modelId} failed:`, error);
    }
  }

  // All free models failed — use OpenAI
  return streamText({
    model: getOpenAIFallback(),
    system: options.system,
    messages: options.messages,
  });
}
