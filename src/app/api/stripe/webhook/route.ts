import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Payment completed — mark invoice as PAID
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId;

        if (invoiceId && session.payment_status === "paid") {
          const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });

          if (invoice && invoice.status !== "PAID") {
            await db.invoice.update({
              where: { id: invoiceId },
              data: { status: "PAID", paidAt: new Date() },
            });

            await db.activity.create({
              data: {
                type: "invoice_paid",
                description: `Invoice #${invoiceId.slice(-6)} paid — $${invoice.amount.toLocaleString()}`,
                entityType: "invoice",
                entityId: invoiceId,
              },
            });

            console.log(`[Stripe Webhook] Invoice ${invoiceId} marked PAID`);
          }
        }
        break;
      }

      // Refund issued — mark invoice as REFUNDED
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string;

        // Find the checkout session that created this payment
        const stripe = getStripe();
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent,
          limit: 1,
        });

        const invoiceId = sessions.data[0]?.metadata?.invoiceId;
        if (invoiceId) {
          const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
          if (invoice && invoice.status === "PAID") {
            const refundedAmount = (charge.amount_refunded / 100).toLocaleString();

            await db.invoice.update({
              where: { id: invoiceId },
              data: { status: "REFUNDED" },
            });

            await db.activity.create({
              data: {
                type: "invoice_refunded",
                description: `Invoice #${invoiceId.slice(-6)} refunded — $${refundedAmount}`,
                entityType: "invoice",
                entityId: invoiceId,
              },
            });

            console.log(`[Stripe Webhook] Invoice ${invoiceId} marked REFUNDED`);
          }
        }
        break;
      }

      // Dispute opened — log activity as warning
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const disputeCharge = dispute.charge as string;

        const stripe = getStripe();
        const charge = await stripe.charges.retrieve(disputeCharge);
        const paymentIntent = charge.payment_intent as string;

        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent,
          limit: 1,
        });

        const invoiceId = sessions.data[0]?.metadata?.invoiceId;
        if (invoiceId) {
          await db.activity.create({
            data: {
              type: "invoice_disputed",
              description: `⚠ Dispute opened on Invoice #${invoiceId.slice(-6)} — $${(dispute.amount / 100).toLocaleString()} — reason: ${dispute.reason}`,
              entityType: "invoice",
              entityId: invoiceId,
            },
          });

          console.log(`[Stripe Webhook] Dispute on invoice ${invoiceId}`);
        }
        break;
      }
    }
  } catch (dbError) {
    console.error("[Stripe Webhook] Processing failed:", dbError);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
