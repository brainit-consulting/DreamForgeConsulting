import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.outreachEmail.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
