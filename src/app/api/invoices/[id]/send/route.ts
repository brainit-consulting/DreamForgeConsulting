import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { client: true, project: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status !== "DRAFT") {
    return NextResponse.json({ error: "Only draft invoices can be sent" }, { status: 400 });
  }

  // Send email
  try {
    await resend.emails.send({
      from: "DreamForge Consulting <noreply@dreamforgeworld.com>",
      to: invoice.client.email,
      subject: `Invoice from DreamForge Consulting — $${invoice.amount.toLocaleString()}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <h1 style="color:#F59E0B;font-size:24px;margin:0 0 8px;">DreamForge Consulting</h1>
    <p style="color:#888;font-size:12px;letter-spacing:2px;margin:0 0 32px;">INVOICE</p>
    <div style="background:#16161E;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;">
      <p style="color:#E8E4DF;font-size:16px;margin:0 0 16px;">Hi ${invoice.client.company},</p>
      <p style="color:#AAA;font-size:14px;margin:0 0 24px;">
        You have a new invoice for <strong style="color:#E8E4DF;">${invoice.description ?? "services rendered"}</strong>.
      </p>
      <div style="background:#0A0A0F;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="color:#F59E0B;font-size:28px;font-weight:bold;margin:0;">$${invoice.amount.toLocaleString()}</p>
        ${invoice.dueDate ? `<p style="color:#888;font-size:13px;margin:8px 0 0;">Due: ${invoice.dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>` : ""}
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app"}/login" style="display:inline-block;background:#F59E0B;color:#0A0A0F;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">
        View & Pay Invoice
      </a>
    </div>
  </div>
</body>
</html>`,
    });
  } catch (emailError) {
    console.error("[Invoice] Email send failed:", emailError);
  }

  // Update status to SENT
  const updated = await db.invoice.update({
    where: { id },
    data: { status: "SENT" },
    include: { client: true, project: true },
  });

  return NextResponse.json(updated);
}
