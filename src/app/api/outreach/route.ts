import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const createOutreachSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  leadIds: z.array(z.string().min(1)).min(1),
});

export async function GET() {
  try {
    await requireAdmin();
    const emails = await db.outreachEmail.findMany({
      orderBy: { createdAt: "desc" },
      include: { lead: true },
    });
    return NextResponse.json(emails);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = createOutreachSchema.parse(body);

    const created = await db.outreachEmail.createMany({
      data: data.leadIds.map((leadId) => ({
        leadId,
        subject: data.subject,
        body: data.body,
      })),
    });

    return NextResponse.json({ count: created.count }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}
