"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockInvoices } from "@/lib/mock-data";
import type { InvoiceStatus } from "@/types";

const CLIENT_ID = "client-3";

const statusVariant: Record<InvoiceStatus, "default" | "info" | "success" | "destructive" | "warning"> = {
  DRAFT: "default",
  SENT: "info",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "warning",
};

export default function PortalInvoicesPage() {
  const invoices = mockInvoices.filter((i) => i.clientId === CLIENT_ID);

  async function handlePay(invoiceId: string, amount: number, description: string) {
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount, description }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Invoices</h1>
        <p className="mt-1 text-muted-foreground">
          View and pay your invoices.
        </p>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="font-medium">
                  {invoice.description ?? `Invoice ${invoice.id}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.dueDate
                    ? `Due ${format(invoice.dueDate, "MMM d, yyyy")}`
                    : "No due date"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-xl">
                  ${invoice.amount.toLocaleString()}
                </span>
                <StatusBadge
                  label={invoice.status}
                  variant={statusVariant[invoice.status]}
                  dot
                />
                {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handlePay(
                        invoice.id,
                        invoice.amount,
                        invoice.description ?? ""
                      )
                    }
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No invoices yet.
          </p>
        )}
      </div>
    </div>
  );
}
