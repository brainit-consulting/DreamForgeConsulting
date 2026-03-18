import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const VALID_STAGES = ["DISCOVERY", "DESIGN", "PROPOSAL", "APPROVAL", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCHED", "SUPPORT"] as const;
type ValidStage = typeof VALID_STAGES[number];

const createNoteSchema = z.object({
  stage: z.enum(VALID_STAGES),
  content: z.string().min(1),
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

    const notes = await db.stageNote.findMany({
      where: { projectId: id, ...(stage ? { stage: stage as ValidStage } : {}) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
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
    const data = createNoteSchema.parse(body);
    const note = await db.stageNote.create({
      data: {
        projectId: id,
        stage: data.stage as ValidStage,
        content: data.content,
      },
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}
