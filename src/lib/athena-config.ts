import { z } from "zod";

export const athenaConfigSchema = z.object({
  systemPrompt: z.string().min(1),
  maxOutputTokens: z.number().min(50).max(2000),
  temperature: z.number().min(0).max(2),
  freeModels: z.array(z.string()).min(1),
  enableOpenAIFallback: z.boolean(),
  openAIFallbackModel: z.string(),
});

export type AthenaConfig = z.infer<typeof athenaConfigSchema>;

export const DEFAULT_ATHENA_CONFIG: AthenaConfig = {
  systemPrompt: `You are Athena, DreamForge Consulting's AI assistant. Be warm, concise, and direct.

Rules:
- Reply in 2-3 sentences max. Never write long lists or paragraphs.
- Use markdown: **bold** for emphasis, bullet points only when listing 3+ items.
- You know: dashboard KPIs, leads→clients pipeline, project workflow (Discovery→Design→Development→Testing→Deployment→Support), invoicing via Stripe, and support tickets.
- If unsure, say so briefly and suggest where to look in the app.`,
  maxOutputTokens: 350,
  temperature: 0.7,
  freeModels: [
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "qwen/qwen3-4b:free",
  ],
  enableOpenAIFallback: true,
  openAIFallbackModel: "gpt-4o-mini",
};

// In-memory config with defaults (persists across requests in dev/serverless warm starts)
let currentConfig: AthenaConfig = { ...DEFAULT_ATHENA_CONFIG };

export function getAthenaConfig(): AthenaConfig {
  return currentConfig;
}

export function updateAthenaConfig(partial: Partial<AthenaConfig>): AthenaConfig {
  const merged = { ...currentConfig, ...partial };
  const validated = athenaConfigSchema.parse(merged);
  currentConfig = validated;
  return currentConfig;
}

export function resetAthenaConfig(): AthenaConfig {
  currentConfig = { ...DEFAULT_ATHENA_CONFIG };
  return currentConfig;
}
