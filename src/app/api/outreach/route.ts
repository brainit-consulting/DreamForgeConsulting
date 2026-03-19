import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

const createOutreachSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  leadIds: z.array(z.string().min(1)).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const templatesOnly = searchParams.get("templates") === "true";

    const emails = await db.outreachEmail.findMany({
      where: templatesOnly ? { leadId: null } : undefined,
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
    const reqBody = await req.json();
    const data = createOutreachSchema.parse(reqBody);

    const leadIds = data.leadIds ?? [];

    if (leadIds.length === 0) {
      // Save as a template draft with no recipient
      const draft = await db.outreachEmail.create({
        data: { subject: data.subject, body: data.body },
      });
      return NextResponse.json({ count: 1, id: draft.id }, { status: 201 });
    }

    // Create one draft per selected lead
    const created = await db.outreachEmail.createMany({
      data: leadIds.map((leadId) => ({
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
