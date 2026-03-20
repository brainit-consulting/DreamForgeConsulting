import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  source: z.string().optional(),
  sector: z.string().optional(),
  pitchAngle: z.string().optional(),
  notes: z.string().optional(),
  value: z.number().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        outreachEmails: {
          select: { status: true, sentAt: true },
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = createLeadSchema.parse(body);
    const lead = await db.lead.create({ data });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}
