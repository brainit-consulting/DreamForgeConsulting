import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const createClientSchema = z.object({
  company: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
});

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

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = createClientSchema.parse(body);
    const client = await db.client.create({ data });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}
