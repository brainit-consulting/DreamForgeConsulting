import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getSupportConfig } from "@/lib/support-config";

const updatePlanSchema = z.object({
  planType: z.enum(["MONTHLY", "ANNUAL", "NONE"]).optional(),
  monthlyRate: z.number().min(0).optional(),
  includedHours: z.number().min(0).optional(),
  overageRate: z.number().min(0).optional(),
  active: z.boolean().optional(),
  hoursUsed: z.number().min(0).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const plan = await db.supportPlan.findUnique({ where: { projectId: id } });
    return NextResponse.json(plan);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await db.supportPlan.findUnique({ where: { projectId: id } });
    if (existing) {
      return NextResponse.json({ error: "Support plan already exists" }, { status: 409 });
    }

    const config = await getSupportConfig();
    const plan = await db.supportPlan.create({
      data: {
        projectId: id,
        monthlyRate: config.defaultMonthlyRate,
        includedHours: config.defaultIncludedHours,
        overageRate: config.defaultOverageRate,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = updatePlanSchema.parse(body);

    const plan = await db.supportPlan.update({
      where: { projectId: id },
      data,
    });

    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleAuthError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.supportPlan.delete({ where: { projectId: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
