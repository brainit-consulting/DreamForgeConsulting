import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const adapter = new PrismaNeon({ connectionString: url });
  const db = new PrismaClient({ adapter });

  const email = "dutoit.emile@gmail.com";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD not set in .env");

  // Check if admin already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Ensure role is ADMIN
    if (existing.role !== "ADMIN") {
      await db.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`Updated ${email} role to ADMIN`);
    } else {
      console.log(`Admin ${email} already exists`);
    }
    await db.$disconnect();
    return;
  }

  // Use better-auth's sign-up API to create the user with proper password hash
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({ email, password, name: "Emile du Toit" }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sign-up failed (${res.status}): ${body}`);
  }

  // Update role to ADMIN
  await db.user.update({
    where: { email },
    data: { role: "ADMIN", emailVerified: true },
  });

  console.log(`Admin account created: ${email}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
