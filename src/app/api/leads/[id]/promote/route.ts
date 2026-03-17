import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { clientInviteEmail } from "@/lib/email-templates";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get lead
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.status === "CONVERTED") {
    return NextResponse.json({ error: "Lead already converted" }, { status: 400 });
  }

  // Check if user with this email exists
  const existingUser = await db.user.findUnique({ where: { email: lead.email } });
  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  // Generate temp password
  const tempPassword =
    crypto.randomBytes(4).toString("hex") +
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    "!";

  // Create user via better-auth
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const signUpRes = await fetch(`${origin}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: headersList.get("cookie") ?? "",
    },
    body: JSON.stringify({
      email: lead.email,
      password: tempPassword,
      name: lead.name,
    }),
  });

  if (!signUpRes.ok) {
    const body = await signUpRes.text();
    return NextResponse.json({ error: `Failed to create user: ${body}` }, { status: 500 });
  }

  // Set role and create client record
  const user = await db.user.update({
    where: { email: lead.email },
    data: { role: "CLIENT", emailVerified: true },
  });

  const client = await db.client.create({
    data: {
      userId: user.id,
      company: lead.company ?? lead.name,
      email: lead.email,
      phone: lead.phone,
    },
  });

  // Mark lead as converted
  await db.lead.update({
    where: { id },
    data: { status: "CONVERTED" },
  });

  // Send invite email
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app"}/login`;
  const emailContent = clientInviteEmail({
    clientName: lead.name,
    company: lead.company ?? lead.name,
    email: lead.email,
    tempPassword,
    portalUrl,
  });

  try {
    await resend.emails.send({
      from: "DreamForge Consulting <noreply@dreamforgeworld.com>",
      to: lead.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error("[Promote] Email send failed:", emailError);
  }

  return NextResponse.json({
    success: true,
    client,
    tempPassword,
    message: `${lead.name} promoted to client. Invite sent to ${lead.email}.`,
  });
}
