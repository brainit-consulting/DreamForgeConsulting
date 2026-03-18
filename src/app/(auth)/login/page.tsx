"use client";

import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Flame } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Invalid credentials");
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[Login] Sign-in failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl">Welcome Back</h1>
            <p className="mt-1 font-sans text-[15px] text-muted-foreground">
              Sign in to your DreamForge account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="font-sans text-[15px] font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 font-sans text-[15px] outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="font-sans text-[15px] font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 font-sans text-[15px] outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <button
              type="button"
              disabled={loading || !email || !password}
              onClick={handleSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && <Flame className="h-4 w-4 animate-pulse" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Access is by invitation only.
            </p>
            <p className="text-center">
              <a href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot your password?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
