import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const tickets = await db.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, project: true },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    return handleAuthError(error);
  }
}
