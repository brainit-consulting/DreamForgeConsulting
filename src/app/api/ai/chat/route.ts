import { streamWithFallback } from "@/lib/ai-provider";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Athena, the AI assistant for DreamForge Consulting. You help both admin users and clients navigate the platform.

For admin users, you can help with:
- Understanding dashboard metrics and KPIs
- Managing leads, clients, and projects
- Creating and tracking invoices
- Explaining the project workflow stages (Discovery, Design, Development, Testing, Deployment, Post-Launch Support)
- Best practices for client management

For client portal users, you can help with:
- Understanding their project status and progress
- Explaining invoice details and payment process
- How to submit and track support tickets
- General questions about the consulting process

Always be helpful, concise, and professional. Use the DreamForge brand voice - warm, knowledgeable, and craftsman-like.`;

// Convert UI messages (parts format) to model messages (content format)
function normalizeMessages(
  messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>
) {
  return messages.map((msg) => {
    if (msg.content) {
      return { role: msg.role as "user" | "assistant", content: msg.content };
    }
    // Extract text from parts (AI SDK v6 UI format)
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

  const result = await streamWithFallback({
    system: SYSTEM_PROMPT,
    messages: normalized,
  });

  return result.toTextStreamResponse();
}
