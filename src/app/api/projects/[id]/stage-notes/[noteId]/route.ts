import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await requireAdmin();
    const { noteId } = await params;
    const { content } = await req.json();
    const note = await db.stageNote.update({
      where: { id: noteId },
      data: { content },
    });
    return NextResponse.json(note);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await requireAdmin();
    const { noteId } = await params;
    await db.stageNote.delete({ where: { id: noteId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
