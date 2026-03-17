import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createInvoiceSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function GET() {
  const invoices = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, project: true },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createInvoiceSchema.parse(body);
    const invoice = await db.invoice.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { client: true, project: true },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
