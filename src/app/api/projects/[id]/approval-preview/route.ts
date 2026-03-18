import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequestEmail } from "@/lib/email-templates";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getEmailConfig, getAppUrl } from "@/lib/email-config";

export async function GET(
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

    const config = await getEmailConfig();
    const portalUrl = `${getAppUrl()}/portal/projects`;

    const emailContent = await approvalRequestEmail({
      projectName: project.name,
      clientName: project.client?.company ?? "Client",
      portalUrl,
    });

    return NextResponse.json({
      subject: emailContent.subject,
      from: `${config.companyName} <noreply@dreamforgeworld.com>`,
      to: project.client?.email ?? "(no email)",
      html: emailContent.html,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
