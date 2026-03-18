import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequestEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email-send";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getFromAddress, getAppUrl } from "@/lib/email-config";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.client?.email) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    const portalUrl = `${getAppUrl()}/portal/projects`;

    const emailContent = await approvalRequestEmail({
      projectName: project.name,
      clientName: project.client.company,
      portalUrl,
    });

    try {
      await sendEmail({
        from: getFromAddress(),
        to: project.client.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("[Notify Approval] Email send failed:", emailError);
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    await db.activity.create({
      data: {
        type: "email_approval_sent",
        description: `Approval request sent to ${project.client.company} for "${project.name}"`,
        entityType: "project",
        entityId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Approval request sent to ${project.client.email}`,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
