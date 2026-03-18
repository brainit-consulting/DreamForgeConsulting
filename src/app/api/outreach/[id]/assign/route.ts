import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const assignSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const draft = await db.outreachEmail.findUnique({ where: { id } });
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = assignSchema.parse(body);

    // Create a copy of the draft for each selected lead
    const created = await db.outreachEmail.createMany({
      data: data.leadIds.map((leadId) => ({
        leadId,
        subject: draft.subject,
        body: draft.body,
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
