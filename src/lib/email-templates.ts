import { getEmailConfig, getAbsoluteLogoUrl } from "./email-config";

async function emailHeader(): Promise<string> {
  const config = await getEmailConfig();
  const logoUrl = await getAbsoluteLogoUrl();
  const parts = config.companyName.split(" ");
  const mainName = parts.slice(0, -1).join(" ") || config.companyName;
  const subtitle = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";

  return `
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${logoUrl}" alt="${config.companyName}" width="${config.logoSize}" style="display:block;max-height:${config.logoSize}px;max-width:${config.logoSize * 2}px;margin:0 auto 12px;" />
      <h1 style="color:#F59E0B;font-size:28px;margin:0;">${mainName}</h1>
      ${subtitle ? `<p style="color:#888;font-size:12px;letter-spacing:3px;margin:4px 0 0;">${subtitle}</p>` : ""}
    </div>`;
}

async function emailFooter(): Promise<string> {
  const config = await getEmailConfig();
  return `<p style="color:#555;font-size:11px;text-align:center;margin:24px 0 0;">
      ${config.companyName}${config.tagline ? ` &mdash; ${config.tagline}` : ""}
    </p>`;
}

export async function passwordResetEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  const config = await getEmailConfig();
  const header = await emailHeader();
  const footer = await emailFooter();
  return {
    subject: `Reset Your Password — ${config.companyName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    ${header}
    <div style="background:#16161E;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
      <h2 style="color:#E8E4DF;font-size:20px;margin:0 0 16px;">Password Reset</h2>
      <p style="color:#AAA;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hi${name ? ` ${name}` : ""}, we received a request to reset your password.
        Click the button below to choose a new one.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#F59E0B;color:#0A0A0F;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Reset Password
      </a>
      <p style="color:#666;font-size:12px;margin:24px 0 0;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    ${footer}
  </div>
</body>
</html>`,
  };
}

export async function outreachEmail({
  leadName,
  company,
  body,
}: {
  leadName: string;
  company: string;
  body: string;
}): Promise<string> {
  const greeting = company
    ? `Hi ${leadName} at ${company}`
    : `Hi ${leadName}`;
  const paragraphs = body
    .split("\n")
    .filter((l) => l.trim())
    .map((p) => `<p style="color:#CCC;font-size:14px;line-height:1.6;margin:0 0 12px;">${p}</p>`)
    .join("");

  const config = await getEmailConfig();
  const header = await emailHeader();
  const footer = await emailFooter();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    ${header}
    <div style="background:#16161E;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
      <h2 style="color:#E8E4DF;font-size:18px;margin:0 0 16px;">${greeting},</h2>
      ${paragraphs}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
        ${config.signOff.split("\n").map((line, i) =>
          i === 0
            ? `<p style="color:#888;font-size:13px;margin:0;">${line}</p>`
            : `<p style="color:#E8E4DF;font-size:14px;font-weight:600;margin:4px 0 0;">${line}</p>`
        ).join("")}
      </div>
    </div>
    ${footer}
  </div>
</body>
</html>`;
}

export async function approvalRequestEmail({
  projectName,
  clientName,
  portalUrl,
}: {
  projectName: string;
  clientName: string;
  portalUrl: string;
}): Promise<{ subject: string; html: string }> {
  const config = await getEmailConfig();
  const header = await emailHeader();
  const footer = await emailFooter();
  return {
    subject: `Your approval is needed — ${projectName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    ${header}
    <div style="background:#16161E;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
      <h2 style="color:#E8E4DF;font-size:20px;margin:0 0 16px;">Ready for Your Approval</h2>
      <p style="color:#AAA;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${clientName}, the discovery and design phases for <strong style="color:#E8E4DF;">${projectName}</strong> are complete.
      </p>
      <p style="color:#AAA;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Please review the project scope and approve to begin development.
      </p>
      <a href="${portalUrl}" style="display:inline-block;background:#F59E0B;color:#0A0A0F;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Review & Approve
      </a>
    </div>
    ${footer}
  </div>
</body>
</html>`,
  };
}

export async function clientInviteEmail({
  clientName,
  company,
  email,
  tempPassword,
  portalUrl,
}: {
  clientName: string;
  company: string;
  email: string;
  tempPassword: string;
  portalUrl: string;
}) {
  const config = await getEmailConfig();
  const header = await emailHeader();
  const footer = await emailFooter();
  return {
    subject: `Welcome to ${config.companyName} — Your Portal Access`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    ${header}
    <div style="background:#16161E;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
      <h2 style="color:#E8E4DF;font-size:20px;margin:0 0 16px;">Welcome, ${clientName}!</h2>
      <p style="color:#AAA;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your client portal for <strong style="color:#E8E4DF;">${company}</strong> is ready.
        Track your project progress, view invoices, and submit support tickets — all in one place.
      </p>
      <div style="background:#0A0A0F;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="color:#888;font-size:12px;margin:0 0 8px;">Your login credentials:</p>
        <p style="color:#E8E4DF;font-size:14px;margin:0 0 4px;"><strong>Email:</strong> ${email}</p>
        <p style="color:#E8E4DF;font-size:14px;margin:0;"><strong>Password:</strong> ${tempPassword}</p>
      </div>
      <a href="${portalUrl}" style="display:inline-block;background:#F59E0B;color:#0A0A0F;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Open Your Portal
      </a>
      <p style="color:#666;font-size:12px;margin:24px 0 0;">
        We recommend changing your password after your first login.
      </p>
    </div>
    ${footer}
  </div>
</body>
</html>`,
  };
}
