import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const VALID_STAGES = ["DISCOVERY", "DESIGN", "PROPOSAL", "APPROVAL", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCHED", "SUPPORT"] as const;
type ValidStage = typeof VALID_STAGES[number];

const createTaskSchema = z.object({
  stage: z.enum(VALID_STAGES),
  title: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const stage = req.nextUrl.searchParams.get("stage");
    if (stage && !VALID_STAGES.includes(stage as ValidStage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const tasks = await db.stageTask.findMany({
      where: { projectId: id, ...(stage ? { stage: stage as ValidStage } : {}) },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = createTaskSchema.parse(body);
    const count = await db.stageTask.count({
      where: { projectId: id, stage: data.stage as any },
    });
    const task = await db.stageTask.create({
      data: {
        projectId: id,
        stage: data.stage as any,
        title: data.title,
        sortOrder: count,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}
