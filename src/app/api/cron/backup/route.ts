import { NextResponse } from "next/server";
import { runBackup } from "@/lib/backup";
import { db } from "@/lib/db";
import { getSupportConfig } from "@/lib/support-config";

// Vercel cron automatically sends Authorization: Bearer <CRON_SECRET>
// This endpoint must be a GET for Vercel cron compatibility
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed — if CRON_SECRET is not configured, deny all requests
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backupResult = await runBackup();

  // Monthly support invoice generation — runs on the 1st of each month
  let invoicesCreated = 0;
  const now = new Date();
  if (now.getUTCDate() === 1) {
    try {
      const config = await getSupportConfig();
      const plans = await db.supportPlan.findMany({
        where: { active: true, planType: { not: "NONE" } },
        include: { project: { include: { client: true } } },
      });

      for (const plan of plans) {
        // Annual plan: skip free months
        if (plan.planType === "ANNUAL") {
          const paidMonths = 12 - config.annualFreeMonths;
          if (plan.monthsInvoiced >= paidMonths && plan.monthsInvoiced < 12) {
            // Free month — just increment counter, reset hours
            await db.supportPlan.update({
              where: { id: plan.id },
              data: { hoursUsed: 0, monthsInvoiced: plan.monthsInvoiced + 1 },
            });
            continue;
          }
          if (plan.monthsInvoiced >= 12) {
            // Reset annual cycle
            await db.supportPlan.update({
              where: { id: plan.id },
              data: { monthsInvoiced: 0 },
            });
          }
        }

        // Calculate invoice amount
        const overage = Math.max(0, plan.hoursUsed - plan.includedHours);
        const amount = plan.monthlyRate + overage * plan.overageRate;
        const overageDesc = overage > 0
          ? ` + ${overage.toFixed(1)}hrs overage × $${plan.overageRate}`
          : "";

        // Create DRAFT invoice
        if (plan.project.clientId) {
          await db.invoice.create({
            data: {
              clientId: plan.project.clientId,
              projectId: plan.project.id,
              amount,
              status: "DRAFT",
              description: `${plan.planType === "ANNUAL" ? "Annual" : "Monthly"} support — ${plan.project.name}${overageDesc}`,
              dueDate: new Date(now.getFullYear(), now.getMonth(), 15), // Due 15th
            },
          });
          invoicesCreated++;
        }

        // Reset hours + increment counter
        await db.supportPlan.update({
          where: { id: plan.id },
          data: {
            hoursUsed: 0,
            monthsInvoiced: plan.monthsInvoiced + 1,
          },
        });
      }
    } catch (err) {
      console.error("[Cron] Support invoice generation failed:", err);
    }
  }

  // Mark overdue invoices — runs daily
  let overdueMarked = 0;
  try {
    const overdue = await db.invoice.updateMany({
      where: {
        status: "SENT",
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });
    overdueMarked = overdue.count;
  } catch (err) {
    console.error("[Cron] Overdue invoice check failed:", err);
  }

  return NextResponse.json(
    { ...backupResult, supportInvoicesCreated: invoicesCreated, overdueMarked },
    { status: backupResult.success ? 200 : 500 }
  );
}
