import { z } from "zod";
import { db } from "./db";

const SETTINGS_KEY = "support";

export const supportConfigSchema = z.object({
  defaultMonthlyRate: z.number().min(0),
  defaultIncludedHours: z.number().min(0),
  defaultOverageRate: z.number().min(0),
  annualFreeMonths: z.number().min(0).max(6),
});

export type SupportConfig = z.infer<typeof supportConfigSchema>;

export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  defaultMonthlyRate: 250,
  defaultIncludedHours: 5,
  defaultOverageRate: 50,
  annualFreeMonths: 2,
};

let currentConfig: SupportConfig = { ...DEFAULT_SUPPORT_CONFIG };
let loadedFromDb = false;

async function loadFromDb(): Promise<void> {
  if (loadedFromDb) return;
  try {
    const row = await db.appSettings.findUnique({ where: { key: SETTINGS_KEY } });
    if (row) {
      const stored = JSON.parse(row.value);
      currentConfig = supportConfigSchema.parse({ ...DEFAULT_SUPPORT_CONFIG, ...stored });
    }
  } catch {
    // DB not available — use defaults
  }
  loadedFromDb = true;
}

export async function getSupportConfig(): Promise<SupportConfig> {
  await loadFromDb();
  return currentConfig;
}

export async function updateSupportConfig(partial: Partial<SupportConfig>): Promise<SupportConfig> {
  await loadFromDb();
  const merged = { ...currentConfig, ...partial };
  const validated = supportConfigSchema.parse(merged);
  currentConfig = validated;
  try {
    await db.appSettings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(currentConfig) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(currentConfig) },
    });
  } catch {
    // Log but don't fail
  }
  return currentConfig;
}

export async function resetSupportConfig(): Promise<SupportConfig> {
  currentConfig = { ...DEFAULT_SUPPORT_CONFIG };
  loadedFromDb = true;
  try {
    await db.appSettings.delete({ where: { key: SETTINGS_KEY } }).catch(() => {});
  } catch {
    // Ignore
  }
  return currentConfig;
}
