import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";
import { clientInviteEmail } from "@/lib/email-templates";
import { headers } from "next/headers";
import crypto from "crypto";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getFromAddress } from "@/lib/email-config";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    // Look up existing client
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.userId) {
      return NextResponse.json({ error: "Client already has portal access" }, { status: 409 });
    }

    if (!client.email) {
      return NextResponse.json({ error: "Client has no email address — add one before sending an invite" }, { status: 400 });
    }

    // Check if a user with this email already exists
    const existingUser = await db.user.findUnique({ where: { email: client.email! } });
    if (existingUser) {
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

    // Create user via better-auth sign-up API
    const headersList = await headers();
    const origin =
      headersList.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";

    const signUpRes = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Cookie: headersList.get("cookie") ?? "",
      },
      body: JSON.stringify({
        email: client.email,
        password: tempPassword,
        name: client.company,
      }),
    });

    if (!signUpRes.ok) {
      const body = await signUpRes.text();
      return NextResponse.json(
        { error: `Failed to create user account: ${body}` },
        { status: 500 }
      );
    }

    // Set role to CLIENT and link to client record
    const user = await db.user.update({
      where: { email: client.email },
      data: { role: "CLIENT", emailVerified: true },
    });

    await db.client.update({
      where: { id: clientId },
      data: { userId: user.id },
    });

    // Send invite email
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamforgeconsulting.vercel.app"}/login`;
    const emailContent = clientInviteEmail({
      clientName: client.company,
      company: client.company,
      email: client.email,
      tempPassword,
      portalUrl,
    });

    try {
      await resend.emails.send({
        from: getFromAddress(),
        to: client.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("[Invite] Email send failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: `Portal invite sent to ${client.email}`,
      tempPassword,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
