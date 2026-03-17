"use client";

import { DollarSign, FolderKanban, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalRevenue: number;
  revenueChange: string;
  activeProjects: number;
  newLeads: number;
  activeClients: number;
}

export function KpiCards({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-20" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
    },
    {
      title: "Active Projects",
      value: String(stats.activeProjects),
      change: "",
      icon: FolderKanban,
    },
    {
      title: "New Leads",
      value: String(stats.newLeads),
      change: "",
      icon: UserPlus,
    },
    {
      title: "Active Clients",
      value: String(stats.activeClients),
      change: "",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className="rounded-md bg-primary/10 p-2">
              <kpi.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{kpi.value}</div>
            {kpi.change && (
              <p className="mt-1 text-xs text-emerald-500">{kpi.change} vs last month</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
