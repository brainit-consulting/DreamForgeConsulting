import { z } from "zod";

export const emailConfigSchema = z.object({
  companyName: z.string().min(1),
  logoUrl: z.string(),
  signOff: z.string().min(1),
  tagline: z.string(),
});

export type EmailConfig = z.infer<typeof emailConfigSchema>;

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  companyName: "DreamForge Consulting",
  logoUrl: "/DreamForgeConsultingLogo.png",
  signOff: "Best regards,\nDreamForge Consulting",
  tagline: "Crafting your digital future.",
};

let currentConfig: EmailConfig = { ...DEFAULT_EMAIL_CONFIG };

export function getEmailConfig(): EmailConfig {
  return currentConfig;
}

export function updateEmailConfig(partial: Partial<EmailConfig>): EmailConfig {
  const merged = { ...currentConfig, ...partial };
  const validated = emailConfigSchema.parse(merged);
  currentConfig = validated;
  return currentConfig;
}

export function resetEmailConfig(): EmailConfig {
  currentConfig = { ...DEFAULT_EMAIL_CONFIG };
  return currentConfig;
}

/** Get absolute logo URL for use in emails */
export function getAbsoluteLogoUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app";
  const logo = currentConfig.logoUrl;
  if (logo.startsWith("http")) return logo;
  return `${base}${logo.startsWith("/") ? "" : "/"}${logo}`;
}

/** Get the formatted "from" address for Resend */
export function getFromAddress(): string {
  return `${currentConfig.companyName} <noreply@dreamforgeworld.com>`;
}
