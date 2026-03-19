import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientFromSession, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const client = await getClientFromSession();
    const requests = await db.projectRequest.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    const client = await getClientFromSession();
    const { name, description, budgetRange, timeline, additionalInfo } = await req.json();

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
    }

    const request = await db.projectRequest.create({
      data: {
        clientId: client.id,
        name: name.trim(),
        description: description.trim(),
        budgetRange: budgetRange || null,
        timeline: timeline || null,
        additionalInfo: additionalInfo?.trim() || null,
      },
    });

    await db.activity.create({
      data: {
        type: "project_request",
        description: `${client.company} submitted a project request: "${name.trim()}"`,
        entityType: "client",
        entityId: client.id,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
