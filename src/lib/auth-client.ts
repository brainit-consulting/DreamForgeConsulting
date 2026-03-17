import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function forgetPassword({ email, redirectTo }: { email: string; redirectTo: string }) {
  const res = await fetch(`${baseURL}/api/auth/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo }),
  });
  if (!res.ok) throw new Error("Failed to send reset email");
  return res.json();
}

export async function resetPassword({ newPassword, token }: { newPassword: string; token: string }) {
  const res = await fetch(`${baseURL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword, token }),
  });
  if (!res.ok) throw new Error("Failed to reset password");
  return res.json();
}
