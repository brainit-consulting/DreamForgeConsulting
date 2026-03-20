import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
  await requireAdmin();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [leadCount, clientCount, projectCount, totalRevenue, thisMonthRevenue, lastMonthRevenue] =
    await Promise.all([
      db.lead.count(),
      db.client.count({ where: { deletedAt: null } }),
      db.project.count({ where: { status: { not: "LAUNCHED" } } }),
      db.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      db.invoice.aggregate({
        where: { status: "PAID", paidAt: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),
      db.invoice.aggregate({
        where: { status: "PAID", paidAt: { gte: lastMonthStart, lt: thisMonthStart } },
        _sum: { amount: true },
      }),
    ]);

  const thisMonth = thisMonthRevenue._sum.amount ?? 0;
  const lastMonth = lastMonthRevenue._sum.amount ?? 0;
  const revenueChange = lastMonth > 0
    ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)
    : thisMonth > 0 ? "+100" : "0";

  return NextResponse.json({
    totalRevenue: totalRevenue._sum.amount ?? 0,
    revenueChange: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
    activeProjects: projectCount,
    newLeads: leadCount,
    activeClients: clientCount,
  });
  } catch (error) {
    return handleAuthError(error);
  }
}
