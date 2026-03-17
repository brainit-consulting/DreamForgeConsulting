import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";

export async function getSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") throw new Error("Admin access required");
  return session;
}

export async function getClientFromSession() {
  const session = await requireAuth();
  const client = await db.client.findUnique({
    where: { userId: session.user.id },
  });
  if (!client) throw new Error("No client record found for this user");
  return client;
}
