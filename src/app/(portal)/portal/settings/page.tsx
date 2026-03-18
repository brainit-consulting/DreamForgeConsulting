"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle } from "lucide-react";
import { toast } from "sonner";

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError("");

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/portal/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password updated successfully");
      } else {
        setPwError(data.error ?? "Failed to change password");
      }
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-display text-xl">Change Password</CardTitle>
        <KeyRound className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-400">Password changed successfully. Use your new password next time you sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {pwError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {pwError}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="current-pw">Current Password</Label>
              <Input id="current-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Your current or temp password" className="font-sans text-[15px]" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="new-pw">New Password</Label>
                <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="font-sans text-[15px]" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-pw">Confirm Password</Label>
                <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="font-sans text-[15px]" required />
              </div>
            </div>
            <Button type="submit" disabled={saving || !currentPassword || !newPassword || !confirmPassword} className="w-full sm:w-auto">
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function PortalSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences.</p>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
