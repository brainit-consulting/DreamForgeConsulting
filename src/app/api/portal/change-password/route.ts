import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, handleAuthError } from "@/lib/auth-helpers";
import { hashPassword, verifyPassword } from "better-auth/crypto";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Get the user's credential account
    const account = await db.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
    });

    if (!account?.password) {
      return NextResponse.json(
        { error: "No password credential found" },
        { status: 400 }
      );
    }

    // Verify current password
    const valid = await verifyPassword({
      password: currentPassword,
      hash: account.password,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 403 }
      );
    }

    // Hash and save new password
    const hashed = await hashPassword(newPassword);
    await db.account.update({
      where: { id: account.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error) {
    return handleAuthError(error);
  }
}
