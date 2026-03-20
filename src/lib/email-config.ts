import { z } from "zod";
import { db } from "./db";

const SETTINGS_KEY = "email";

const logoEntrySchema = z.object({
  url: z.string(),
  name: z.string(),
  active: z.boolean(),
});

export type LogoEntry = z.infer<typeof logoEntrySchema>;

const bookingUrlEntrySchema = z.object({
  url: z.string(),
  label: z.string(),
  active: z.boolean(),
});

export type BookingUrlEntry = z.infer<typeof bookingUrlEntrySchema>;

export const emailConfigSchema = z.object({
  companyName: z.string().min(1),
  logoUrl: z.string(),
  logoSize: z.number().min(30).max(300),
  logos: z.array(logoEntrySchema).optional().default([]),
  signOff: z.string().min(1),
  tagline: z.string(),
  greetingUseName: z.boolean(),
  greetingUseCompany: z.boolean(),
  autoApprovalEmail: z.boolean(),
  bookingUrl: z.string(),
  bookingUrls: z.array(bookingUrlEntrySchema).optional().default([]),
  includePitchAngle: z.boolean().optional().default(false),
  pitchAngleWrapper: z.string().optional().default("{pitch}"),
});

export type EmailConfig = z.infer<typeof emailConfigSchema>;

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  companyName: "DreamForge Consulting",
  logoUrl: "https://1airdrc8bpsbs6t9.public.blob.vercel-storage.com/logos/DreamForgeConsultingLogo-email.png",
  logoSize: 120,
  logos: [],
  signOff: "Best regards,\nDreamForge Consulting",
  tagline: "Crafting your digital future.",
  greetingUseName: true,
  greetingUseCompany: true,
  autoApprovalEmail: false,
  bookingUrl: "https://dreamforgeconsulting.vercel.app",
  bookingUrls: [],
  includePitchAngle: false,
  pitchAngleWrapper: "{pitch}",
};

let currentConfig: EmailConfig = { ...DEFAULT_EMAIL_CONFIG };
let loadedFromDb = false;
let lastLoadTime = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds — picks up admin settings changes without restart

async function loadFromDb(): Promise<void> {
  const now = Date.now();
  if (loadedFromDb && now - lastLoadTime < CACHE_TTL_MS) return;
  try {
    const row = await db.appSettings.findUnique({ where: { key: SETTINGS_KEY } });
    if (row) {
      const stored = JSON.parse(row.value);
      currentConfig = emailConfigSchema.parse({ ...DEFAULT_EMAIL_CONFIG, ...stored });
    }
    loadedFromDb = true;
    lastLoadTime = now;
  } catch {
    // DB not available — do NOT cache, retry on next call
  }
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

const PROD_URL = "https://dreamforgeconsulting.vercel.app";

/** Validate a URL is safe for injection into email HTML — must be http/https */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/** Get the app's public URL, always returning production URL (never localhost) */
export function getAppUrl(): string {
  const url = (process.env.NEXT_PUBLIC_APP_URL ?? PROD_URL).trim();
  if (url.includes("localhost")) return PROD_URL;
  return url;
}

/** Get absolute logo URL for use in emails */
export async function getAbsoluteLogoUrl(): Promise<string> {
  await loadFromDb();
  // Always use production URL for email assets — localhost is unreachable from email clients
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? PROD_URL).trim().includes("localhost")
    ? PROD_URL
    : (process.env.NEXT_PUBLIC_APP_URL ?? PROD_URL).trim();
  const logo = currentConfig.logoUrl;
  if (logo.startsWith("http")) return logo;
  return `${base}${logo.startsWith("/") ? "" : "/"}${logo}`;
}

/** Get the formatted "from" address for Resend */
export function getFromAddress(): string {
  return `${currentConfig.companyName} <noreply@dreamforgeworld.com>`;
}
