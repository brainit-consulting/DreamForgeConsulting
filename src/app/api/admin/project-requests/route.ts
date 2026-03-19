import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const requests = await db.projectRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { company: true, email: true } } },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const { id, status } = await req.json();

    if (!id || !["PENDING", "REVIEWED", "CONVERTED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    const updated = await db.projectRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}
