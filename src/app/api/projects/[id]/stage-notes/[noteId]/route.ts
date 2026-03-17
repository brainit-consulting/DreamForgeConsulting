import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { noteId } = await params;
  const { content } = await req.json();
  const note = await db.stageNote.update({
    where: { id: noteId },
    data: { content },
  });
  return NextResponse.json(note);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { noteId } = await params;
  await db.stageNote.delete({ where: { id: noteId } });
  return NextResponse.json({ success: true });
}
