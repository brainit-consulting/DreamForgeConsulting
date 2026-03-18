import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (lead.status === "CONVERTED") {
      return NextResponse.json({ error: "Lead already converted" }, { status: 400 });
    }

    // Check if a client with this email already exists (only if email is set)
    if (lead.email) {
      const existingClient = await db.client.findFirst({ where: { email: lead.email } });
      if (existingClient) {
        return NextResponse.json({ error: "A client with this email already exists" }, { status: 409 });
      }
    }

    // Create client record only — no portal account, no email
    const client = await db.client.create({
      data: {
        company: lead.company ?? lead.name,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        address: lead.address,
      },
    });

    // Mark lead as converted
    await db.lead.update({
      where: { id },
      data: { status: "CONVERTED" },
    });

    return NextResponse.json({
      success: true,
      client,
      message: `${lead.name} promoted to client. Send a portal invite from the Clients page when ready.`,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
