"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Receipt, TicketCheck } from "lucide-react";
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
        <h1 className="text-3xl font-display">Welcome back, {(() => {
          const name = data.client.name;
          if (!name) return data.client.company;
          const parts = name.split(" ");
          const titles = ["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "Rev."];
          return titles.includes(parts[0]) && parts.length > 1 ? parts.slice(0, 2).join(" ") : parts[0];
        })()}</h1>
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
    </div>
  );
}
