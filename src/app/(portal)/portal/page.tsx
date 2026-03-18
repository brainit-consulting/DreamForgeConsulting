"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Receipt, TicketCheck, KeyRound, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { ProjectStatus } from "@/types";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info", DESIGN: "ember", PROPOSAL: "warning", APPROVAL: "warning",
  DEVELOPMENT: "ember", TESTING: "warning", DEPLOYMENT: "warning", LAUNCHED: "success", SUPPORT: "default",
};

interface PortalData {
  client: { company: string; name?: string | null };
  projects: Array<{ id: string; name: string; description?: string; status: ProjectStatus; progress: number }>;
  invoices: Array<{ id: string; status: string }>;
  tickets: Array<{ id: string; status: string }>;
}

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

export default function PortalDashboardPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState(false);

  function fetchData() {
    setError(false);
    fetch("/api/portal/data")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true));
  }

  useEffect(() => { fetchData(); }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Failed to load your data.</p>
        <button type="button" onClick={fetchData} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  const pendingInvoices = data.invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE");
  const openTickets = data.tickets.filter((t) => t.status === "OPEN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Welcome back, {data.client.name?.split(" ")[0] ?? data.client.company}</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your projects and account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="font-display text-3xl">{data.projects.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><p className="font-display text-3xl">{pendingInvoices.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Tickets</CardTitle>
            <TicketCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><p className="font-display text-3xl">{openTickets.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-xl">Your Projects</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
          {data.projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-1">
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={project.progress} className="w-24" />
                <span className="text-xs text-muted-foreground w-8">{project.progress}%</span>
                <StatusBadge label={project.status} variant={statusVariant[project.status]} dot />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}
