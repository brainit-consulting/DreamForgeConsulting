import { headers } from "next/headers";
import { auth } from "./auth";

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
