import { NextRequest, NextResponse } from "next/server";
import { randomInt, createHash } from "crypto";
import { db } from "@/lib/db";
import { checkLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email-send";
import { getEmailConfig, getAbsoluteLogoUrl, isSafeUrl } from "@/lib/email-config";

const GENERIC_OK = { message: "If that email is registered, a reset PIN has been sent." };

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || "DreamForge Consulting <noreply@dreamforgeworld.com>";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, resetIn } = checkLimit(`forgot-pin:${ip}`, 3, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many password reset requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254) {
      return NextResponse.json(GENERIC_OK);
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      createHash("sha256").update("timing-dummy").digest("hex");
      return NextResponse.json(GENERIC_OK);
    }

    const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const pinHash = createHash("sha256").update(pin).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate prior unused PIN tokens for this user
    await db.verification.deleteMany({
      where: { identifier: `pin-reset:${email}` },
    });

    // Store new PIN token
    await db.verification.create({
      data: {
        identifier: `pin-reset:${email}`,
        value: pinHash,
        expiresAt,
      },
    });

    // Send email (fire-and-forget)
    (async () => {
      const config = await getEmailConfig();
      const logoUrl = await getAbsoluteLogoUrl();
      const safeLogo = isSafeUrl(logoUrl) ? logoUrl : "";
      const parts = config.companyName.split(" ");
      const mainName = parts.slice(0, -1).join(" ") || config.companyName;
      const subtitle = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
      const recipientName = user.name?.trim() || "";

      await sendEmail({
        from: getFromAddress(),
        to: email,
        subject: `Password Reset PIN — ${config.companyName}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      ${safeLogo ? `<img src="${safeLogo}" alt="${escapeHtml(config.companyName)}" width="${config.logoSize}" style="display:block;max-height:${config.logoSize}px;max-width:${config.logoSize * 2}px;margin:0 auto 12px;" />` : ""}
      <h1 style="color:#F59E0B;font-size:28px;margin:0;">${escapeHtml(mainName)}</h1>
      ${subtitle ? `<p style="color:#888;font-size:12px;letter-spacing:3px;margin:4px 0 0;">${escapeHtml(subtitle)}</p>` : ""}
    </div>
    <div style="background:#16161E;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
      <h2 style="color:#E8E4DF;font-size:20px;margin:0 0 16px;">Password Reset</h2>
      <p style="color:#AAA;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hi${recipientName ? ` ${escapeHtml(recipientName)}` : ""}, you requested a password reset for your account.
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        <span style="display:inline-block;background:#0A0A0F;border:2px solid #F59E0B;border-radius:12px;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:8px;color:#F59E0B;font-family:monospace;">
          ${pin}
        </span>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        <tr><td style="padding:4px 0;color:#888;">Expires</td><td style="padding:4px 0;color:#CCC;">15 minutes from now</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Use</td><td style="padding:4px 0;color:#CCC;">Single use only</td></tr>
      </table>
      <p style="color:#666;font-size:12px;margin:0;">
        If you didn't request this, you can safely ignore this email. Your password has not been changed.
      </p>
    </div>
    <p style="color:#555;font-size:11px;text-align:center;margin:24px 0 0;">
      ${escapeHtml(config.companyName)}${config.tagline ? ` &mdash; ${escapeHtml(config.tagline)}` : ""}
    </p>
  </div>
</body>
</html>`,
      });
    })().catch((err) => console.error("[forgot-password-pin] Email send failed:", err));

    return NextResponse.json(GENERIC_OK);
  } catch (error) {
    console.error("Forgot-password-pin error:", error);
    return NextResponse.json(GENERIC_OK);
  }
}
