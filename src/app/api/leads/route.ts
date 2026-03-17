import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  value: z.number().optional(),
});

export async function GET() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createLeadSchema.parse(body);
    const lead = await db.lead.create({ data });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
