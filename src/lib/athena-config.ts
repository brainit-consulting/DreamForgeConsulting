import { z } from "zod";
import { db } from "./db";

const SETTINGS_KEY = "athena";

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

let currentConfig: AthenaConfig = { ...DEFAULT_ATHENA_CONFIG };
let loadedFromDb = false;

async function loadFromDb(): Promise<void> {
  if (loadedFromDb) return;
  try {
    const row = await db.appSettings.findUnique({ where: { key: SETTINGS_KEY } });
    if (row) {
      const stored = JSON.parse(row.value);
      currentConfig = athenaConfigSchema.parse({ ...DEFAULT_ATHENA_CONFIG, ...stored });
    }
  } catch {
    // DB not available or invalid data — use defaults
  }
  loadedFromDb = true;
}

export async function getAthenaConfig(): Promise<AthenaConfig> {
  await loadFromDb();
  return currentConfig;
}

export async function updateAthenaConfig(partial: Partial<AthenaConfig>): Promise<AthenaConfig> {
  await loadFromDb();
  const merged = { ...currentConfig, ...partial };
  const validated = athenaConfigSchema.parse(merged);
  currentConfig = validated;
  try {
    await db.appSettings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(currentConfig) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(currentConfig) },
    });
  } catch {
    // Log but don't fail — in-memory still updated
  }
  return currentConfig;
}

export async function resetAthenaConfig(): Promise<AthenaConfig> {
  currentConfig = { ...DEFAULT_ATHENA_CONFIG };
  loadedFromDb = true;
  try {
    await db.appSettings.delete({ where: { key: SETTINGS_KEY } }).catch(() => {});
  } catch {
    // Ignore if row doesn't exist
  }
  return currentConfig;
}
