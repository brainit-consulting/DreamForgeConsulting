import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [leadCount, clientCount, projectCount, paidInvoices, allInvoices] =
    await Promise.all([
      db.lead.count(),
      db.client.count(),
      db.project.count({ where: { status: { not: "LAUNCHED" } } }),
      db.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      db.invoice.findMany({
        where: { status: "PAID", paidAt: { not: null } },
        select: { amount: true, paidAt: true },
      }),
    ]);

  // Calculate month-over-month revenue change
  const now = new Date();
  const thisMonth = allInvoices
    .filter((i) => i.paidAt && i.paidAt.getMonth() === now.getMonth() && i.paidAt.getFullYear() === now.getFullYear())
    .reduce((sum, i) => sum + i.amount, 0);
  const lastMonth = allInvoices
    .filter((i) => {
      if (!i.paidAt) return false;
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return i.paidAt.getMonth() === d.getMonth() && i.paidAt.getFullYear() === d.getFullYear();
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const revenueChange = lastMonth > 0
    ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)
    : thisMonth > 0 ? "+100" : "0";

  return NextResponse.json({
    totalRevenue: paidInvoices._sum.amount ?? 0,
    revenueChange: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
    activeProjects: projectCount,
    newLeads: leadCount,
    activeClients: clientCount,
  });
}
