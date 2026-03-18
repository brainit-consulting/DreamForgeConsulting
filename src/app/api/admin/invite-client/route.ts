import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email-send";
import { clientInviteEmail } from "@/lib/email-templates";
import { headers } from "next/headers";
import crypto from "crypto";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { getFromAddress, getAppUrl } from "@/lib/email-config";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { clientId, resend } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    // Look up existing client
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Handle resend — generate new password for existing user
    if (resend && client.userId) {
      if (!client.email) {
        return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
      }

      const tempPassword =
        crypto.randomBytes(4).toString("hex") +
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        "!";

      // Update password via better-auth sign-up won't work for existing users
      // Instead, use the DB directly to update the hashed password
      // For simplicity, we'll use the better-auth admin API or just send the credentials
      // Actually, better-auth doesn't expose a "set password" API easily
      // So we'll delete the old user and recreate — this preserves the client record since userId is SetNull
      const headersList = await headers();
      const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      // Delete old user (cascades sessions/accounts, SetNull on client)
      await db.user.delete({ where: { id: client.userId } });

      // Create new user with new password
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
        return NextResponse.json({ error: "Failed to reset credentials" }, { status: 500 });
      }

      const newUser = await db.user.update({
        where: { email: client.email },
        data: { role: "CLIENT", emailVerified: true },
      });

      await db.client.update({
        where: { id: clientId },
        data: { userId: newUser.id },
      });

      // Send invite email
      const portalUrl = `${getAppUrl()}/login`;
      const emailContent = await clientInviteEmail({
        clientName: client.company,
        company: client.company,
        email: client.email,
        tempPassword,
        portalUrl,
      });

      try {
        await sendEmail({
          from: getFromAddress(),
          to: client.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error("[Resend Invite] Email send failed:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: `New credentials sent to ${client.email}`,
        tempPassword,
      });
    }

    if (client.userId) {
      return NextResponse.json({ error: "Client already has portal access — use resend instead" }, { status: 409 });
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
    const emailContent = await clientInviteEmail({
      clientName: client.company,
      company: client.company,
      email: client.email,
      tempPassword,
      portalUrl,
    });

    try {
      await sendEmail({
        from: getFromAddress(),
        to: client.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("[Invite] Email send failed:", emailError);
    }

    await db.activity.create({
      data: {
        type: "email_invite_sent",
        description: `Portal invite sent to ${client.company} (${client.email})`,
        entityType: "client",
        entityId: clientId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Portal invite sent to ${client.email}`,
      tempPassword,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
