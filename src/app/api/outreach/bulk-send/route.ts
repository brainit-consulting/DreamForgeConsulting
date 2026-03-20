import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/email-send";
import { outreachEmail } from "@/lib/email-templates";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getFromAddress } from "@/lib/email-config";

const bulkSendSchema = z.object({
  templateId: z.string().min(1),
  leadIds: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { templateId, leadIds } = bulkSendSchema.parse(body);

    // Fetch the template
    const template = await db.outreachEmail.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (template.leadId !== null) {
      return NextResponse.json({ error: "Not a template — must be an unassigned draft" }, { status: 400 });
    }

    // Fetch leads with email
    const leads = await db.lead.findMany({
      where: { id: { in: leadIds }, email: { not: null } },
    });

    let sent = 0;
    let failed = 0;
    const skipped = leadIds.length - leads.length;
    const fromAddress = getFromAddress();

    for (const lead of leads) {
      try {
        // Create outreach record for this lead
        const record = await db.outreachEmail.create({
          data: {
            leadId: lead.id,
            subject: template.subject,
            body: template.body,
          },
        });

        // Render and send
        const html = await outreachEmail({
          leadName: lead.name,
          company: lead.company ?? "",
          body: template.body,
        });

        await sendEmail({
          from: fromAddress,
          to: lead.email!,
          subject: template.subject,
          html,
        });

        await db.outreachEmail.update({
          where: { id: record.id },
          data: { status: "SENT", sentAt: new Date() },
        });

        await db.activity.create({
          data: {
            type: "email_outreach_sent",
            description: `Bulk outreach sent to ${lead.name} (${lead.email})`,
            entityType: "outreach",
            entityId: record.id,
          },
        });

        // Auto-update lead status to CONTACTED if still NEW
        if (lead.status === "NEW") {
          await db.lead.update({
            where: { id: lead.id },
            data: { status: "CONTACTED" },
          });
        }

        sent++;

        // Rate limit: 200ms between sends to stay under Resend 5 req/sec
        if (leads.indexOf(lead) < leads.length - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      } catch (err) {
        console.error(`[Bulk Outreach] Failed for ${lead.name}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, skipped });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}
