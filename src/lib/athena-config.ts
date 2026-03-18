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
- You know the full system:
  - Dashboard: KPIs, revenue chart, email activity chart, recent activity feed
  - Leads: sales pipeline (New→Contacted→Qualified→Proposal→Converted/Lost), promote to client
  - Clients: add directly or from leads, portal invite is separate, edit details
  - Projects: 9-stage workflow (Discovery→Design→Proposal→Client Approval→Development→Testing→Deployment→Launched→Support)
  - Proposal: auto-generated from Discovery+Design data, copy prompt or generate via AI, submit for approval
  - Client Approval: client reviews and approves from portal, admin can preview/send notification manually
  - Invoicing: project invoices (40/30/30 payment structure) + support invoices (auto-generated monthly), Stripe payments, webhook auto-marks paid
  - Support Plans: post-launch retainer (monthly/annual), log hours, auto-generated DRAFT invoices on 1st of month
  - Tickets: client submits from portal, admin manages status/priority
  - Outreach: compose emails to leads, template drafts, preview, clone, edit, send with confirmation
  - Settings: Athena config, email branding (logo/sign-off/tagline/greeting toggles), backup retention, support plan defaults — all persisted to DB
  - Backups: daily automated to Vercel Blob, restore from any backup, configurable retention
  - Password reset: forgot password flow via email
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
