import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientFromSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const client = await getClientFromSession();

    const [projects, invoices, tickets] = await Promise.all([
      db.project.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
      }),
      db.invoice.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
        include: { project: true },
      }),
      db.ticket.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
        include: { project: true },
      }),
    ]);

    return NextResponse.json({ client, projects, invoices, tickets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
