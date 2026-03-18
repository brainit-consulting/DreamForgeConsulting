import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientFromSession, handleAuthError } from "@/lib/auth-helpers";
import { STAGE_PROGRESS } from "@/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getClientFromSession();
    const { id } = await params;

    const project = await db.project.findUnique({ where: { id } });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.clientId !== client.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (project.status !== "APPROVAL") {
      return NextResponse.json(
        { error: "Project is not awaiting approval" },
        { status: 400 }
      );
    }

    const updated = await db.project.update({
      where: { id },
      data: {
        status: "DEVELOPMENT",
        progress: STAGE_PROGRESS.DEVELOPMENT,
      },
    });

    await db.activity.create({
      data: {
        type: "client_approval",
        description: `${client.company} approved "${project.name}" — development begins`,
        entityType: "project",
        entityId: id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}
