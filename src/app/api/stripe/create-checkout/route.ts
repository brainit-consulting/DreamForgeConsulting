import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { requireAuth, handleAuthError } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { invoiceId } = await req.json();

    // Look up invoice from DB — never trust client-provided amount
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, project: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // C1: Clients may only pay their own invoices
    if (session.user.role === "CLIENT") {
      const clientRecord = await db.client.findUnique({ where: { userId: session.user.id } });
      if (!clientRecord || invoice.clientId !== clientRecord.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "This invoice has already been paid" },
        { status: 400 }
      );
    }

    if (invoice.status !== "SENT" && invoice.status !== "OVERDUE") {
      return NextResponse.json(
        { error: "Only sent or overdue invoices can be paid" },
        { status: 400 }
      );
    }

    if (!invoice.client?.email) {
      return NextResponse.json(
        { error: "Client has no email address" },
        { status: 400 }
      );
    }

    // Check for existing unpaid Stripe session to prevent double-charge
    const stripe = getStripe();
    const existingSessions = await stripe.checkout.sessions.list({
      limit: 100,
    });
    const activeSession = existingSessions.data.find(
      (s) =>
        s.metadata?.invoiceId === invoiceId &&
        s.status === "open" &&
        s.payment_status === "unpaid"
    );
    if (activeSession?.url) {
      // Redirect to existing session instead of creating a new one
      return NextResponse.json({ url: activeSession.url });
    }

    const description =
      invoice.description || `Invoice for ${invoice.project?.name ?? "services"}`;

    const checkoutSession = await stripe.checkout.sessions.create({
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

    return NextResponse.json({ url: checkoutSession.url });
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
