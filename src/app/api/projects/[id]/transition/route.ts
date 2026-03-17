import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

  return NextResponse.json(updated);
}
