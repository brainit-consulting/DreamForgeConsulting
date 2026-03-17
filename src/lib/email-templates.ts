export function clientInviteEmail({
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
  return {
    subject: `Welcome to DreamForge Consulting — Your Portal Access`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#F59E0B;font-size:28px;margin:0;">DreamForge</h1>
      <p style="color:#888;font-size:12px;letter-spacing:3px;margin:4px 0 0;">CONSULTING</p>
    </div>
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
    <p style="color:#555;font-size:11px;text-align:center;margin:24px 0 0;">
      DreamForge Consulting &mdash; Crafting your digital future.
    </p>
  </div>
</body>
</html>`,
  };
}
