"use client";

import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { forgetPassword } from "@/lib/auth-client";
import { Flame, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl">Reset Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sent
                ? "Check your email for a reset link."
                : "Enter your email and we'll send a reset link."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {sent ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm text-emerald-400">
                  If an account with <strong>{email}</strong> exists, a reset link has been sent.
                </p>
              </div>
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>

              <button
                type="button"
                disabled={loading || !email}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                {loading && <Flame className="h-4 w-4 animate-pulse" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center">
                <a href="/login" className="text-xs text-muted-foreground hover:text-foreground">
                  Back to login
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
