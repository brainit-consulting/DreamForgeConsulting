import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Athena, DreamForge Consulting's AI assistant. Be warm, concise, and direct.

Rules:
- Reply in 2-3 sentences max. Never write long lists or paragraphs.
- Use markdown: **bold** for emphasis, bullet points only when listing 3+ items.
- You know: dashboard KPIs, leads→clients pipeline, project workflow (Discovery→Design→Development→Testing→Deployment→Support), invoicing via Stripe, and support tickets.
- If unsure, say so briefly and suggest where to look in the app.`;

// Models verified to support system prompts and work reliably
const FREE_MODELS = [
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3-4b:free",
];

let modelIndex = 0;

function normalizeMessages(
  messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>
) {
  return messages.map((msg) => {
    if (msg.content) {
      return { role: msg.role as "user" | "assistant", content: msg.content };
    }
    const text = msg.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";
    return { role: msg.role as "user" | "assistant", content: text };
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const normalized = normalizeMessages(messages);

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Try each free model, then fall back to OpenAI
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const id = FREE_MODELS[(modelIndex + i) % FREE_MODELS.length];
    try {
      console.log(`[Athena] Trying ${id}`);
      const result = streamText({
        model: openrouter(id),
        system: SYSTEM_PROMPT,
        messages: normalized,
        maxOutputTokens: 350,
      });
      // Wait for the first text chunk to confirm model works
      const reader = result.textStream[Symbol.asyncIterator]();
      const first = await reader.next();

      if (first.done) continue; // empty response, try next

      // Model works! Advance round-robin and return a stream
      modelIndex = (modelIndex + i + 1) % FREE_MODELS.length;
      console.log(`[Athena] Streaming from ${id}`);

      // Build a new ReadableStream that yields the first chunk + rest
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(new TextEncoder().encode(first.value));
          try {
            for await (const chunk of { [Symbol.asyncIterator]: () => reader }) {
              controller.enqueue(new TextEncoder().encode(chunk));
            }
          } catch {
            // stream error mid-way, close gracefully
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (error) {
      console.warn(`[Athena] ${id} failed:`, error instanceof Error ? error.message : error);
    }
  }

  // All free models failed — OpenAI fallback
  console.log("[Athena] All free models down → OpenAI GPT-4o-mini");
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: normalized,
    maxOutputTokens: 200,
  });

  return result.toTextStreamResponse();
}
