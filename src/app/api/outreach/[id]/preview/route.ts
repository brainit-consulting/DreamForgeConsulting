import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachEmail } from "@/lib/email-templates";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getEmailConfig } from "@/lib/email-config";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const email = await db.outreachEmail.findUnique({
      where: { id },
      include: { lead: true },
    });

    if (!email) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const config = getEmailConfig();
    const leadName = email.lead?.name ?? "{{Lead Name}}";
    const company = email.lead?.company ?? "{{Company}}";

    const html = outreachEmail({
      leadName,
      company,
      body: email.body,
    });

    return NextResponse.json({
      subject: email.subject,
      from: `${config.companyName} <noreply@dreamforgeworld.com>`,
      to: email.lead?.email ?? "(no recipient)",
      html,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
