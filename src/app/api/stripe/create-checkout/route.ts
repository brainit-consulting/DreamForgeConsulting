import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { requireAuth, handleAuthError } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { invoiceId } = await req.json();

    // Look up invoice from DB — never trust client-provided amount
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, project: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status !== "SENT") {
      return NextResponse.json(
        { error: "Only sent invoices can be paid" },
        { status: 400 }
      );
    }

    if (!invoice.client?.email) {
      return NextResponse.json(
        { error: "Client has no email address" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const description =
      invoice.description || `Invoice for ${invoice.project?.name ?? "services"}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: description },
            unit_amount: Math.round(invoice.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices?cancelled=true`,
      metadata: { invoiceId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    try {
      return handleAuthError(error);
    } catch {
      console.error("Stripe checkout error:", error);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }
  }
}
