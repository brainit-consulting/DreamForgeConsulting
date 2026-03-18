"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayData {
  date: string;
  label: string;
  outreach: number;
  invoice: number;
  invite: number;
  total: number;
}

interface EmailActivityData {
  data: DayData[];
  totals: { outreach: number; invoice: number; invite: number; total: number };
}

export function EmailActivityChart() {
  const [activity, setActivity] = useState<EmailActivityData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/email-activity")
      .then((r) => r.json())
      .then(setActivity)
      .catch(() => {});
  }, []);

  if (!activity) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl">Email Activity</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
            Outreach ({activity.totals.outreach})
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
            Invoice ({activity.totals.invoice})
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Invite ({activity.totals.invite})
          </span>
          <span className="ml-auto font-medium text-foreground">
            {activity.totals.total} sent (30 days)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activity.data}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="outreach" name="Outreach" stackId="emails" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="invoice" name="Invoice" stackId="emails" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="invite" name="Invite" stackId="emails" fill="#10b981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
