import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getAthenaConfig } from "@/lib/athena-config";

export const maxDuration = 30;

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
  const config = getAthenaConfig();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Try each free model, then fall back to OpenAI
  for (let i = 0; i < config.freeModels.length; i++) {
    const id = config.freeModels[(modelIndex + i) % config.freeModels.length];
    try {
      console.log(`[Athena] Trying ${id}`);
      const result = streamText({
        model: openrouter(id),
        system: config.systemPrompt,
        messages: normalized,
        maxOutputTokens: config.maxOutputTokens,
        temperature: config.temperature,
      });

      const reader = result.textStream[Symbol.asyncIterator]();
      const first = await reader.next();
      if (first.done) continue;

      modelIndex = (modelIndex + i + 1) % config.freeModels.length;
      console.log(`[Athena] Streaming from ${id}`);

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
  if (config.enableOpenAIFallback) {
    try {
      console.log(`[Athena] Fallback → OpenAI ${config.openAIFallbackModel}`);
      const result = streamText({
        model: openai(config.openAIFallbackModel),
        system: config.systemPrompt,
        messages: normalized,
        maxOutputTokens: config.maxOutputTokens,
        temperature: config.temperature,
      });

      const reader = result.textStream[Symbol.asyncIterator]();
      const first = await reader.next();
      if (!first.done) {
        console.log("[Athena] OpenAI streaming OK");
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(new TextEncoder().encode(first.value));
            try {
              for await (const chunk of { [Symbol.asyncIterator]: () => reader }) {
                controller.enqueue(new TextEncoder().encode(chunk));
              }
            } catch { /* close gracefully */ }
            controller.close();
          },
        });
        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    } catch (error) {
      console.error("[Athena] OpenAI fallback failed:", error instanceof Error ? error.message : error);
    }
  }

  return new Response("I'm temporarily unavailable — all AI models are busy. Please try again in a moment!", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
