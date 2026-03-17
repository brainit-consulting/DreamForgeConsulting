import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });
  return NextResponse.json(clients);
}
