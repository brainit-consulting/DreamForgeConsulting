import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all email-related activities from last 30 days
    const activities = await db.activity.findMany({
      where: {
        type: { in: ["email_outreach_sent", "email_invoice_sent", "email_invite_sent"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { type: true, createdAt: true },
    });

    // Build daily counts for last 30 days
    const days: Record<string, { outreach: number; invoice: number; invite: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { outreach: 0, invoice: 0, invite: 0 };
    }

    for (const a of activities) {
      const key = a.createdAt.toISOString().slice(0, 10);
      if (!(key in days)) continue;
      if (a.type === "email_outreach_sent") days[key].outreach++;
      else if (a.type === "email_invoice_sent") days[key].invoice++;
      else if (a.type === "email_invite_sent") days[key].invite++;
    }

    const data = Object.entries(days).map(([date, counts]) => ({
      date,
      label: new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...counts,
      total: counts.outreach + counts.invoice + counts.invite,
    }));

    const totals = {
      outreach: activities.filter((a) => a.type === "email_outreach_sent").length,
      invoice: activities.filter((a) => a.type === "email_invoice_sent").length,
      invite: activities.filter((a) => a.type === "email_invite_sent").length,
      total: activities.length,
    };

    return NextResponse.json({ data, totals });
  } catch (error) {
    return handleAuthError(error);
  }
}
