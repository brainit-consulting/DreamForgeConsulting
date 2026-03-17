import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientFromSession } from "@/lib/auth-helpers";
import { z } from "zod";

const createTicketSchema = z.object({
  projectId: z.string().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export async function POST(req: Request) {
  try {
    const client = await getClientFromSession();
    const body = await req.json();
    const data = createTicketSchema.parse(body);

    const ticket = await db.ticket.create({
      data: {
        clientId: client.id,
        projectId: data.projectId || null,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
