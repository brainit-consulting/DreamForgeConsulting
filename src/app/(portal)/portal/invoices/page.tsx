"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";
import type { InvoiceStatus } from "@/types";

const statusVariant: Record<InvoiceStatus, "default" | "info" | "success" | "destructive" | "warning"> = {
  DRAFT: "default", SENT: "info", PAID: "success", OVERDUE: "destructive", CANCELLED: "warning", REFUNDED: "warning",
};

interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
  dueDate?: string;
  project?: { name: string };
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState(false);

  function fetchInvoices() {
    setError(false);
    fetch("/api/portal/data")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setInvoices(data.invoices ?? []))
      .catch(() => setError(true));
  }

  useEffect(() => { fetchInvoices(); }, []);

  async function handlePay(invoiceId: string) {
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Failed to start payment");
      }
    } catch {
      toast.error("Payment failed — please try again");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Invoices</h1>
        <p className="mt-1 text-muted-foreground">View and pay your invoices.</p>
      </div>

      {error && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground">Failed to load invoices.</p>
          <button type="button" onClick={fetchInvoices} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retry</button>
        </div>
      )}

      {!error && invoices.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No invoices yet.</p>
      )}

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="font-medium">{invoice.description ?? "Invoice"}</p>
                <p className="text-xs text-muted-foreground">
                  {invoice.project?.name ?? ""}{" "}
                  {invoice.dueDate ? `· Due ${format(new Date(invoice.dueDate), "MMM d, yyyy")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-xl">${invoice.amount.toLocaleString()}</span>
                <StatusBadge label={invoice.status} variant={statusVariant[invoice.status]} dot />
                {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
                  <Button size="sm" onClick={() => handlePay(invoice.id)}>
                    Pay Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
