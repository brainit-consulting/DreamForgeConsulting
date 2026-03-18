import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status !== "PAID") {
      return NextResponse.json(
        { error: "Only paid invoices can be refunded" },
        { status: 400 }
      );
    }

    // Find the Stripe payment for this invoice
    const stripe = getStripe();
    const sessions = await stripe.checkout.sessions.list({ limit: 20 });
    const session = sessions.data.find(
      (s) => s.metadata?.invoiceId === id && s.payment_status === "paid"
    );

    if (!session?.payment_intent) {
      // No Stripe payment found — mark as refunded manually (offline payment)
      await db.invoice.update({
        where: { id },
        data: { status: "REFUNDED" },
      });

      await db.activity.create({
        data: {
          type: "invoice_refunded",
          description: `Invoice #${id.slice(-6)} manually refunded — $${invoice.amount.toLocaleString()}`,
          entityType: "invoice",
          entityId: id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Invoice marked as refunded (no Stripe payment found — manual refund)",
      });
    }

    // Issue Stripe refund
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // The webhook will handle marking the invoice as REFUNDED,
    // but we also update it here for immediate UI feedback
    await db.invoice.update({
      where: { id },
      data: { status: "REFUNDED" },
    });

    await db.activity.create({
      data: {
        type: "invoice_refunded",
        description: `Invoice #${id.slice(-6)} refunded via Stripe — $${invoice.amount.toLocaleString()}`,
        entityType: "invoice",
        entityId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Refund of $${invoice.amount.toLocaleString()} issued to ${invoice.client?.company ?? "client"}`,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
