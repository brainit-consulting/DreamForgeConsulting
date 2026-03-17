import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";

/** Error class with HTTP status for clean API responses. */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) throw new AuthError("Unauthorized", 401);
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") throw new AuthError("Forbidden", 403);
  return session;
}

export async function getClientFromSession() {
  const session = await requireAuth();
  const client = await db.client.findUnique({
    where: { userId: session.user.id },
  });
  if (!client) throw new AuthError("No client record found", 403);
  return client;
}

/** Convert AuthError to JSON response. Re-throws non-auth errors. */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  throw error;
}
