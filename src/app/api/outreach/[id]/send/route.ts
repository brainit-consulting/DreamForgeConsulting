import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";
import { outreachEmail } from "@/lib/email-templates";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getFromAddress } from "@/lib/email-config";

export async function POST(
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

    if (email.status === "SENT") {
      return NextResponse.json({ error: "Already sent" }, { status: 400 });
    }

    if (!email.lead) {
      return NextResponse.json({ error: "No recipient assigned — assign a lead first" }, { status: 400 });
    }

    if (!email.lead.email) {
      return NextResponse.json({ error: "Lead has no email address" }, { status: 400 });
    }

    const html = outreachEmail({
      leadName: email.lead.name,
      company: email.lead.company ?? "",
      body: email.body,
    });

    try {
      await resend.emails.send({
        from: getFromAddress(),
        to: email.lead.email,
        subject: email.subject,
        html,
      });

      const updated = await db.outreachEmail.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date() },
        include: { lead: true },
      });

      return NextResponse.json(updated);
    } catch (sendError) {
      console.error("[Outreach] Email send failed:", sendError);

      await db.outreachEmail.update({
        where: { id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }
  } catch (error) {
    return handleAuthError(error);
  }
}
