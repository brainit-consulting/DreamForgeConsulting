"use client";

import { useState, useEffect, useCallback } from "react";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";
import { EmailActivityChart } from "@/components/admin/dashboard/email-activity-chart";
import { ProjectOverview } from "@/components/admin/dashboard/project-overview";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FolderPlus, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Stats {
  totalRevenue: number;
  revenueChange: string;
  activeProjects: number;
  newLeads: number;
  activeClients: number;
}

interface ProjectRequest {
  id: string;
  name: string;
  description: string;
  budgetRange?: string;
  timeline?: string;
  additionalInfo?: string;
  status: string;
  createdAt: string;
  client?: { company: string; email: string };
}

function ProjectRequestAlerts() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [selected, setSelected] = useState<ProjectRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/admin/project-requests");
    if (res.ok) {
      const data: ProjectRequest[] = await res.json();
      setRequests(data.filter((r) => r.status === "PENDING"));
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function acknowledge(id: string) {
    const res = await fetch("/api/admin/project-requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "REVIEWED" }),
    });
    if (res.ok) {
      toast.success("Request acknowledged — client status updated to REVIEWED");
      setSelected(null);
      fetchRequests();
    }
  }

  async function decline(id: string) {
    const res = await fetch("/api/admin/project-requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "DECLINED" }),
    });
    if (res.ok) {
      toast.success("Request declined");
      setSelected(null);
      fetchRequests();
    }
  }

  if (requests.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            onClick={() => setSelected(req)}
            className="flex items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 cursor-pointer hover:bg-emerald-500/15 transition-colors"
          >
            <FolderPlus className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-400">
                New Project Request from {req.client?.company ?? "Unknown"}
              </p>
              <p className="text-xs text-emerald-400/70 truncate">
                {req.name} — {req.budgetRange ?? "No budget specified"} · {req.timeline ?? "No timeline"}
              </p>
            </div>
            <span className="text-xs text-emerald-400/50 shrink-0">
              {format(new Date(req.createdAt), "MMM d, h:mm a")}
            </span>
          </div>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Project Request
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{selected.name}</p>
                  <StatusBadge label={selected.status} variant="warning" />
                </div>
                <p className="text-xs text-muted-foreground">
                  From <strong className="text-foreground">{selected.client?.company}</strong> ({selected.client?.email}) · {format(new Date(selected.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <div className="border-t border-border/30 pt-3">
                  <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                </div>
                {(selected.budgetRange || selected.timeline) && (
                  <div className="flex gap-4 text-xs">
                    {selected.budgetRange && (
                      <span className="rounded bg-primary/10 px-2 py-1 text-primary">Budget: {selected.budgetRange}</span>
                    )}
                    {selected.timeline && (
                      <span className="rounded bg-primary/10 px-2 py-1 text-primary">Timeline: {selected.timeline}</span>
                    )}
                  </div>
                )}
                {selected.additionalInfo && (
                  <div className="border-t border-border/30 pt-3">
                    <p className="text-xs text-muted-foreground mb-1">Additional Info:</p>
                    <p className="text-sm whitespace-pre-wrap">{selected.additionalInfo}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" size="sm" onClick={() => decline(selected.id)}>
                  <X className="mr-2 h-3.5 w-3.5" />
                  Decline
                </Button>
                <Button size="sm" onClick={() => acknowledge(selected.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                  Acknowledge & Review
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
    fetch("/api/dashboard/revenue").then((r) => r.json()).then(setRevenue);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your command center for everything DreamForge.
        </p>
      </div>

      <ProjectRequestAlerts />

      <KpiCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenue} />
        <ActivityFeed />
      </div>

      <EmailActivityChart />
      <ProjectOverview />
    </div>
  );
}
