import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { checkLimit } from "@/lib/rate-limit";
import { hashPassword } from "better-auth/crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, resetIn } = checkLimit(`reset-pin:${ip}`, 5, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many reset attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const pin = typeof body.pin === "string" ? body.pin : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!email || !pin || !newPassword) {
      return NextResponse.json({ error: "Email, PIN, and new password are required." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be exactly 6 digits." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const verification = await db.verification.findFirst({
      where: {
        identifier: `pin-reset:${email}`,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired PIN." }, { status: 400 });
    }

    // Timing-safe PIN comparison
    const pinHash = createHash("sha256").update(pin).digest("hex");
    const storedHash = verification.value;
    try {
      const a = Buffer.from(pinHash, "hex");
      const b = Buffer.from(storedHash, "hex");
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return NextResponse.json({ error: "Invalid or expired PIN." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid or expired PIN." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired PIN." }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);

    await db.account.updateMany({
      where: { userId: user.id, providerId: "credential" },
      data: { password: newHash },
    });

    await db.verification.delete({ where: { id: verification.id } });

    await db.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ message: "Password reset successfully. You can now sign in with your new password." });
  } catch (error) {
    console.error("Reset-password-pin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
