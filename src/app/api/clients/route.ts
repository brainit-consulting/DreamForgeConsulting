import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const clients = await db.client.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { projects: true } } },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return handleAuthError(error);
  }
}
