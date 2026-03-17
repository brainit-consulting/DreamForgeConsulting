import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createNoteSchema = z.object({
  stage: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stage = req.nextUrl.searchParams.get("stage");

  const notes = await db.stageNote.findMany({
    where: { projectId: id, ...(stage ? { stage: stage as any } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = createNoteSchema.parse(body);
    const note = await db.stageNote.create({
      data: {
        projectId: id,
        stage: data.stage as any,
        content: data.content,
      },
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
