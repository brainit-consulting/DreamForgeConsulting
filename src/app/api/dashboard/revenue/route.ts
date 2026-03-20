import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
  await requireAdmin();
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const invoices = await db.invoice.findMany({
    where: { status: "PAID", paidAt: { gte: sixMonthsAgo } },
    select: { amount: true, paidAt: true },
  });

  // Group by month (last 6 months)
  const months: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-US", { month: "short" });
    months[key] = 0;
  }

  for (const inv of invoices) {
    if (!inv.paidAt) continue;
    const key = inv.paidAt.toLocaleString("en-US", { month: "short" });
    if (key in months) {
      months[key] += inv.amount;
    }
  }

  const data = Object.entries(months).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  return NextResponse.json(data);
  } catch (error) {
    return handleAuthError(error);
  }
}
