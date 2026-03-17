"use client";

import {
  DollarSign,
  FolderKanban,
  UserPlus,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
}

function KpiCard({ title, value, change, trend, icon: Icon }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={cn(
              "font-medium",
              trend === "up" ? "text-emerald-500" : "text-red-500"
            )}
          >
            {change}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const kpis: KpiCardProps[] = [
    {
      title: "Total Revenue",
      value: "$194,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Active Projects",
      value: "4",
      change: "+1",
      trend: "up",
      icon: FolderKanban,
    },
    {
      title: "New Leads",
      value: "6",
      change: "+3",
      trend: "up",
      icon: UserPlus,
    },
    {
      title: "Active Clients",
      value: "4",
      change: "+1",
      trend: "up",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
