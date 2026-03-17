import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = updateTicketSchema.parse(body);
    const ticket = await db.ticket.update({
      where: { id },
      data,
      include: { client: true, project: true },
    });
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.ticket.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
