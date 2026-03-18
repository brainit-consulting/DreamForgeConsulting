import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { resend } from "@/lib/resend";
import { approvalRequestEmail } from "@/lib/email-templates";
import { getFromAddress, getEmailConfig } from "@/lib/email-config";
import {
  STAGE_PROGRESS,
  WORKFLOW_STAGES,
  canTransitionTo,
  type ProjectStatus,
} from "@/types";

const VALID_STATUSES = WORKFLOW_STAGES.map((s) => s.key);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  await requireAdmin();
  const { id } = await params;
  const { status: newStatus } = await req.json();

  if (!VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const project = await db.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const current = project.status as ProjectStatus;
  if (current === newStatus) {
    return NextResponse.json(project); // no-op
  }

  if (!canTransitionTo(current, newStatus)) {
    const currentLabel = WORKFLOW_STAGES.find((s) => s.key === current)?.label;
    const targetLabel = WORKFLOW_STAGES.find((s) => s.key === newStatus)?.label;
    return NextResponse.json(
      {
        error: `Cannot skip from "${currentLabel}" to "${targetLabel}". Move one stage at a time.`,
      },
      { status: 400 }
    );
  }

  // Update project status + auto-calculate progress
  const updated = await db.project.update({
    where: { id },
    data: {
      status: newStatus,
      progress: STAGE_PROGRESS[newStatus as ProjectStatus],
    },
    include: { client: true, invoices: true, tickets: true },
  });

  // Log activity
  const fromLabel = WORKFLOW_STAGES.find((s) => s.key === current)?.label;
  const toLabel = WORKFLOW_STAGES.find((s) => s.key === newStatus)?.label;
  await db.activity.create({
    data: {
      type: "stage_transition",
      description: `${updated.name} moved from ${fromLabel} to ${toLabel}`,
      entityType: "project",
      entityId: id,
    },
  });

  // Send approval request email when moving to APPROVAL (if enabled)
  const emailCfg = await getEmailConfig();
  if (newStatus === "APPROVAL" && updated.client?.email && emailCfg.autoApprovalEmail) {
    try {
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app"}/portal/projects`;
      const emailContent = await approvalRequestEmail({
        projectName: updated.name,
        clientName: updated.client.company,
        portalUrl,
      });
      await resend.emails.send({
        from: getFromAddress(),
        to: updated.client.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("[Transition] Approval email failed:", emailError);
    }
  }

  return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}
