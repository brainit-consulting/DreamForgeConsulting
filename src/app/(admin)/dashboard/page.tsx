"use client";

import { useState, useEffect } from "react";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";
import { EmailActivityChart } from "@/components/admin/dashboard/email-activity-chart";
import { ProjectOverview } from "@/components/admin/dashboard/project-overview";

interface Stats {
  totalRevenue: number;
  revenueChange: string;
  activeProjects: number;
  newLeads: number;
  activeClients: number;
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
