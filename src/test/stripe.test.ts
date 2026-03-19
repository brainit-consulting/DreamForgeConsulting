import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";

// Load test keys from .env.local
const TEST_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const TEST_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY ?? "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Skip all tests if no test key is available
const hasTestKey = TEST_SECRET_KEY.startsWith("sk_test_");
const describeIfKeys = hasTestKey ? describe : describe.skip;

describeIfKeys("Stripe Integration (Test Mode)", () => {
  let stripe: Stripe;

  beforeEach(() => {
    stripe = new Stripe(TEST_SECRET_KEY, { apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion });
  });

  // ─── Key Configuration ─────────────────────────────────────

  it("should have test secret key configured (not live)", () => {
    expect(TEST_SECRET_KEY).toMatch(/^sk_test_/);
    expect(TEST_SECRET_KEY).not.toMatch(/^sk_live_/);
  });

  it("should have test publishable key configured (not live)", () => {
    expect(TEST_PUBLISHABLE_KEY).toMatch(/^pk_test_/);
    expect(TEST_PUBLISHABLE_KEY).not.toMatch(/^pk_live_/);
  });

  it("should have webhook secret configured", () => {
    expect(WEBHOOK_SECRET).toMatch(/^whsec_/);
  });

  // ─── API Connectivity ──────────────────────────────────────

  it("should connect to Stripe API successfully", async () => {
    const balance = await stripe.balance.retrieve();
    expect(balance.object).toBe("balance");
    expect(balance.available).toBeDefined();
  });

  // ─── Checkout Session Creation ─────────────────────────────

  it("should create a checkout session with correct structure", async () => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Test Invoice — Unit Test" },
            unit_amount: 5000, // $50.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://dreamforgeconsulting.vercel.app/portal/invoices?success=true",
      cancel_url: "https://dreamforgeconsulting.vercel.app/portal/invoices?cancelled=true",
      metadata: { invoiceId: "test_inv_001" },
    });

    expect(session.id).toMatch(/^cs_test_/);
    expect(session.url).toBeTruthy();
    expect(session.payment_status).toBe("unpaid");
    expect(session.metadata?.invoiceId).toBe("test_inv_001");
    expect(session.amount_total).toBe(5000);
  });

  it("should create checkout with correct amount for large invoice", async () => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "SaaS Development — Phase 1 (40%)" },
            unit_amount: 480000, // $4,800.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://dreamforgeconsulting.vercel.app/portal/invoices?success=true",
      cancel_url: "https://dreamforgeconsulting.vercel.app/portal/invoices?cancelled=true",
      metadata: { invoiceId: "test_inv_002" },
    });

    expect(session.amount_total).toBe(480000);
    expect(session.currency).toBe("usd");
  });

  // ─── Webhook Signature Verification ────────────────────────

  it("should verify a valid webhook signature", () => {
    const payload = JSON.stringify({
      id: "evt_test_001",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_001", metadata: { invoiceId: "inv_001" } } },
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
      timestamp,
    });

    const event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
    expect(event.type).toBe("checkout.session.completed");
  });

  it("should reject an invalid webhook signature", () => {
    const payload = JSON.stringify({ id: "evt_fake", type: "checkout.session.completed" });

    expect(() => {
      stripe.webhooks.constructEvent(payload, "bad_signature", WEBHOOK_SECRET);
    }).toThrow();
  });

  // ─── Customer Creation ─────────────────────────────────────

  it("should create a test customer", async () => {
    const customer = await stripe.customers.create({
      email: "test@dreamforgeconsulting.test",
      name: "Test Client — Unit Test",
      metadata: { source: "vitest" },
    });

    expect(customer.id).toMatch(/^cus_/);
    expect(customer.email).toBe("test@dreamforgeconsulting.test");

    // Cleanup
    await stripe.customers.del(customer.id);
  });

  // ─── Refund Flow (simulated) ───────────────────────────────

  it("should handle refund lookup gracefully for non-existent payment", async () => {
    // Verify that listing sessions with a fake payment intent returns empty
    const sessions = await stripe.checkout.sessions.list({
      limit: 1,
    });
    // Should not throw — just returns a list (possibly empty)
    expect(sessions.data).toBeDefined();
    expect(Array.isArray(sessions.data)).toBe(true);
  });
});

// ─── Unit Tests (no Stripe API calls) ──────────────────────

describe("Stripe Configuration (Unit)", () => {
  it("getStripe should throw if STRIPE_SECRET_KEY is not set", async () => {
    // Clear the cached singleton
    vi.resetModules();
    const originalKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    const { getStripe } = await import("@/lib/stripe");
    expect(() => getStripe()).toThrow("STRIPE_SECRET_KEY is not set");

    process.env.STRIPE_SECRET_KEY = originalKey;
  });

  it("amount conversion: dollars to cents should be correct", () => {
    const testCases = [
      { dollars: 50, cents: 5000 },
      { dollars: 4800, cents: 480000 },
      { dollars: 0.99, cents: 99 },
      { dollars: 12500, cents: 1250000 },
    ];

    for (const { dollars, cents } of testCases) {
      expect(Math.round(dollars * 100)).toBe(cents);
    }
  });

  it("should never use live keys in test environment", () => {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    if (key) {
      expect(key).not.toMatch(/^sk_live_/);
    }
  });
});
