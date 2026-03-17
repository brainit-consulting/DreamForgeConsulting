import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";
import { clientInviteEmail } from "@/lib/email-templates";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  // Verify admin session
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, company, phone, address } = await req.json();

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: "Name, email, and company are required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  // Generate temporary password
  const tempPassword =
    crypto.randomBytes(4).toString("hex") +
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    "!";

  // Create user via better-auth sign-up API (ensures proper password hashing)
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const signUpRes = await fetch(`${origin}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: headersList.get("cookie") ?? "",
    },
    body: JSON.stringify({ email, password: tempPassword, name }),
  });

  if (!signUpRes.ok) {
    const body = await signUpRes.text();
    return NextResponse.json(
      { error: `Failed to create user: ${body}` },
      { status: 500 }
    );
  }

  // Set role to CLIENT and create Client record
  const user = await db.user.update({
    where: { email },
    data: { role: "CLIENT", emailVerified: true },
  });

  await db.client.create({
    data: {
      userId: user.id,
      company,
      email,
      phone: phone ?? null,
      address: address ?? null,
    },
  });

  // Send invite email via Resend
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app"}/login`;
  const emailContent = clientInviteEmail({
    clientName: name,
    company,
    email,
    tempPassword,
    portalUrl,
  });

  try {
    await resend.emails.send({
      from: "DreamForge Consulting <noreply@dreamforgeworld.com>",
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error("[Invite] Email send failed:", emailError);
    // Don't fail the invite — user is created, they just need manual credential sharing
  }

  return NextResponse.json({
    success: true,
    message: `Client ${name} (${company}) invited. Email sent to ${email}.`,
    tempPassword, // Returned so admin can share manually if email fails
  });
}
