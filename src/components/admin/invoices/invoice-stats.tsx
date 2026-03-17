"use client";

import { DollarSign, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice } from "@/types";

interface InvoiceStatsProps {
  invoices: Invoice[];
}

export function InvoiceStats({ invoices }: InvoiceStatsProps) {
  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "SENT")
    .reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices
    .filter((i) => i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.amount, 0);
  const draftCount = invoices.filter((i) => i.status === "DRAFT").length;

  const stats = [
    {
      label: "Collected",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: CheckCircle,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: `$${pendingAmount.toLocaleString()}`,
      icon: Send,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Overdue",
      value: `$${overdueAmount.toLocaleString()}`,
      icon: AlertTriangle,
      color: "text-red-500 bg-red-500/10",
    },
    {
      label: "Drafts",
      value: String(draftCount),
      icon: DollarSign,
      color: "text-muted-foreground bg-muted",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className={`rounded-md p-2 ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
