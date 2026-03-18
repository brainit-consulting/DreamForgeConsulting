import { z } from "zod";
import { db } from "./db";

const SETTINGS_KEY = "email";

export const emailConfigSchema = z.object({
  companyName: z.string().min(1),
  logoUrl: z.string(),
  logoSize: z.number().min(30).max(300),
  signOff: z.string().min(1),
  tagline: z.string(),
  greetingUseName: z.boolean(),
  greetingUseCompany: z.boolean(),
  autoApprovalEmail: z.boolean(),
});

export type EmailConfig = z.infer<typeof emailConfigSchema>;

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  companyName: "DreamForge Consulting",
  logoUrl: "/DreamForgeConsultingLogo-email.png",
  logoSize: 120,
  signOff: "Best regards,\nDreamForge Consulting",
  tagline: "Crafting your digital future.",
  greetingUseName: true,
  greetingUseCompany: true,
  autoApprovalEmail: true,
};

let currentConfig: EmailConfig = { ...DEFAULT_EMAIL_CONFIG };
let loadedFromDb = false;

async function loadFromDb(): Promise<void> {
  if (loadedFromDb) return;
  try {
    const row = await db.appSettings.findUnique({ where: { key: SETTINGS_KEY } });
    if (row) {
      const stored = JSON.parse(row.value);
      currentConfig = emailConfigSchema.parse({ ...DEFAULT_EMAIL_CONFIG, ...stored });
    }
  } catch {
    // DB not available or invalid data — use defaults
  }
  loadedFromDb = true;
}

export async function getEmailConfig(): Promise<EmailConfig> {
  await loadFromDb();
  return currentConfig;
}

export async function updateEmailConfig(partial: Partial<EmailConfig>): Promise<EmailConfig> {
  await loadFromDb();
  const merged = { ...currentConfig, ...partial };
  const validated = emailConfigSchema.parse(merged);
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

export async function resetEmailConfig(): Promise<EmailConfig> {
  currentConfig = { ...DEFAULT_EMAIL_CONFIG };
  loadedFromDb = true;
  try {
    await db.appSettings.delete({ where: { key: SETTINGS_KEY } }).catch(() => {});
  } catch {
    // Ignore
  }
  return currentConfig;
}

/** Get the app's public URL, always returning production URL (never localhost) */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app";
  if (url.includes("localhost")) return "https://dreamforgeconsulting.vercel.app";
  return url;
}

/** Get absolute logo URL for use in emails */
export async function getAbsoluteLogoUrl(): Promise<string> {
  await loadFromDb();
  // Always use production URL for email assets — localhost is unreachable from email clients
  const base = process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")
    ? "https://dreamforgeconsulting.vercel.app"
    : (process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app");
  const logo = currentConfig.logoUrl;
  if (logo.startsWith("http")) return logo;
  return `${base}${logo.startsWith("/") ? "" : "/"}${logo}`;
}

/** Get the formatted "from" address for Resend */
export function getFromAddress(): string {
  return `${currentConfig.companyName} <noreply@dreamforgeworld.com>`;
}
