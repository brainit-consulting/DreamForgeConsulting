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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId && session.payment_status === "paid") {
      try {
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
      } catch (dbError) {
        console.error("[Stripe Webhook] DB update failed:", dbError);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
