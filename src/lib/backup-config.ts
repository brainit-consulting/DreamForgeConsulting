import { z } from "zod";
import { db } from "./db";

const SETTINGS_KEY = "backup";

export const backupConfigSchema = z.object({
  retainDaily: z.number().min(1).max(30),
  retainWeekly: z.number().min(1).max(12),
  retainMonthly: z.number().min(1).max(24),
});

export type BackupConfig = z.infer<typeof backupConfigSchema>;

export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  retainDaily: 7,
  retainWeekly: 4,
  retainMonthly: 6,
};

let currentConfig: BackupConfig = { ...DEFAULT_BACKUP_CONFIG };
let loadedFromDb = false;

async function loadFromDb(): Promise<void> {
  if (loadedFromDb) return;
  try {
    const row = await db.appSettings.findUnique({ where: { key: SETTINGS_KEY } });
    if (row) {
      const stored = JSON.parse(row.value);
      currentConfig = backupConfigSchema.parse({ ...DEFAULT_BACKUP_CONFIG, ...stored });
    }
  } catch {
    // DB not available or invalid data — use defaults
  }
  loadedFromDb = true;
}

export async function getBackupConfig(): Promise<BackupConfig> {
  await loadFromDb();
  return currentConfig;
}

export async function updateBackupConfig(partial: Partial<BackupConfig>): Promise<BackupConfig> {
  await loadFromDb();
  const merged = { ...currentConfig, ...partial };
  const validated = backupConfigSchema.parse(merged);
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

export async function resetBackupConfig(): Promise<BackupConfig> {
  currentConfig = { ...DEFAULT_BACKUP_CONFIG };
  loadedFromDb = true;
  try {
    await db.appSettings.delete({ where: { key: SETTINGS_KEY } }).catch(() => {});
  } catch {
    // Ignore
  }
  return currentConfig;
}
