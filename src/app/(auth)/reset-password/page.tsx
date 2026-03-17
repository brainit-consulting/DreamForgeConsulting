"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { resetPassword } from "@/lib/auth-client";
import { Flame, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ newPassword: password, token });
      setSuccess(true);
    } catch {
      setError("Reset failed. The link may have expired — request a new one.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <Logo />
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
            <p className="text-sm text-muted-foreground">
              Invalid or missing reset token.{" "}
              <a href="/forgot-password" className="text-primary hover:underline">
                Request a new link
              </a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl">
              {success ? "Password Reset" : "Choose New Password"}
            </h1>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="text-sm text-emerald-400">
                  Your password has been reset successfully.
                </p>
              </div>
              <a
                href="/login"
                className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Sign In
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>

              <button
                type="button"
                disabled={loading || !password || !confirm}
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                {loading && <Flame className="h-4 w-4 animate-pulse" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
