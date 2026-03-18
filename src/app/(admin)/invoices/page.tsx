"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { CreateInvoiceDialog } from "@/components/admin/invoices/create-invoice-dialog";
import {
  DollarSign, Send, CheckCircle, AlertTriangle, Trash2, Mail, CreditCard, Undo2,
} from "lucide-react";
import { toast } from "sonner";
import type { InvoiceStatus } from "@/types";

const statusVariant: Record<InvoiceStatus, "default" | "info" | "success" | "destructive" | "warning"> = {
  DRAFT: "default", SENT: "info", PAID: "success", OVERDUE: "destructive", CANCELLED: "warning", REFUNDED: "warning",
};

const filters: { label: string; value: InvoiceStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
];

interface InvoiceRow {
  id: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  client?: { company: string };
  project?: { name: string };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [filter, setFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  const confirmAction = useConfirm();

  const fetchInvoices = useCallback(async () => {
    const res = await fetch("/api/invoices");
    const data = await res.json();
    setInvoices(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filtered = filter === "ALL" ? invoices : invoices.filter((i) => i.status === filter);

  const collected = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "SENT").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0);
  const drafts = invoices.filter((i) => i.status === "DRAFT").length;

  async function sendInvoice(id: string) {
    const res = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
    if (res.ok) {
      toast.success("Invoice sent to client via email");
      fetchInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    toast.success("Invoice marked as paid");
    fetchInvoices();
  }

  async function refundInvoice(id: string) {
    const ok = await confirmAction({
      title: "Issue Refund",
      description: "This will issue a full refund via Stripe. The client's card will be credited within 2-10 business days. This cannot be undone.",
      confirmLabel: "Issue Refund",
      variant: "danger",
    });
    if (!ok) return;
    const res = await fetch(`/api/invoices/${id}/refund`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchInvoices();
    } else {
      toast.error(data.error ?? "Refund failed");
    }
  }

  async function deleteInvoice(id: string) {
    const ok = await confirmAction({
      title: "Delete Invoice",
      description: "This invoice will be permanently removed.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    toast.success("Invoice deleted");
    fetchInvoices();
  }

  const stats = [
    { label: "Collected", value: `$${collected.toLocaleString()}`, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Pending", value: `$${pending.toLocaleString()}`, icon: Send, color: "text-blue-500 bg-blue-500/10" },
    { label: "Overdue", value: `$${overdue.toLocaleString()}`, icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
    { label: "Drafts", value: String(drafts), icon: DollarSign, color: "text-muted-foreground bg-muted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Invoices</h1>
          <p className="mt-1 text-muted-foreground">{invoices.length} invoices</p>
        </div>
        <CreateInvoiceDialog onCreated={fetchInvoices} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
              <div className={`rounded-md p-2 ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent><p className="font-display text-2xl">{stat.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
            )}
            {filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-sm">{inv.description ?? `Invoice`}</TableCell>
                <TableCell className="text-muted-foreground">{inv.client?.company ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{inv.project?.name ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge label={inv.status} variant={statusVariant[inv.status]} dot />
                </TableCell>
                <TableCell className="text-right font-medium">${inv.amount.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">
                  {inv.dueDate ? format(new Date(inv.dueDate), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {inv.status === "DRAFT" && (
                      <ActionTooltip label="Send to client">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500" onClick={() => sendInvoice(inv.id)}>
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                    )}
                    {(inv.status === "SENT" || inv.status === "OVERDUE") && (
                      <ActionTooltip label="Mark as paid">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" onClick={() => markPaid(inv.id)}>
                          <CreditCard className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                    )}
                    {inv.status === "PAID" && (
                      <ActionTooltip label="Issue refund">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={() => refundInvoice(inv.id)}>
                          <Undo2 className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete invoice">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteInvoice(inv.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
