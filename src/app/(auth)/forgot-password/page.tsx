"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Flame, ArrowLeft, CheckCircle } from "lucide-react";

type ResetStep = "email" | "pin" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 429) {
        setError("Too many requests. Please try again later.");
        return;
      }
      setStep("pin");
    } catch {
      setError("Unable to send PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    setError("");
    if (!/^\d{6}$/.test(pin)) {
      setError("PIN must be exactly 6 digits.");
      return;
    }
    if (!newPassword) {
      setError("New password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed. Check your PIN and try again.");
        return;
      }
      setStep("success");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl">
              {step === "success" ? "Password Reset!" : "Reset Password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === "email" && "Enter your email and we'll send a 6-digit PIN."}
              {step === "pin" && "Check your email for a 6-digit PIN. It expires in 15 minutes."}
              {step === "success" && "Your password has been reset."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
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
                  autoFocus
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <button
                type="button"
                disabled={loading || !email}
                onClick={handleEmailSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                {loading && <Flame className="h-4 w-4 animate-pulse" />}
                {loading ? "Sending PIN..." : "Send Reset PIN"}
              </button>
              <p className="text-center">
                <a href="/login" className="text-xs text-muted-foreground hover:text-foreground">
                  Back to login
                </a>
              </p>
            </div>
          )}

          {/* Step 2: PIN + New Password */}
          {step === "pin" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium">
                  6-Digit PIN
                </label>
                <input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoFocus
                  placeholder="000000"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-center font-mono text-xl tracking-widest outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handleResetSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                {loading && <Flame className="h-4 w-4 animate-pulse" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setPin(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Resend PIN
                </button>
                <a href="/login" className="text-xs text-muted-foreground hover:text-foreground">
                  Back to login
                </a>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Sign in now
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
