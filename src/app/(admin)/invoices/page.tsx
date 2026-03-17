"use client";

import { useState } from "react";
import { InvoicesTable } from "@/components/admin/invoices/invoices-table";
import { InvoiceStats } from "@/components/admin/invoices/invoice-stats";
import { HelpButton } from "@/components/shared/help-modal";
import { Button } from "@/components/ui/button";
import { mockInvoices } from "@/lib/mock-data";
import type { InvoiceStatus } from "@/types";

const filters: { label: string; value: InvoiceStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState<InvoiceStatus | "ALL">("ALL");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Invoices</h1>
          <p className="mt-1 text-muted-foreground">
            Billing and payment tracking.
          </p>
        </div>
        <HelpButton sectionKey="invoices" />
      </div>

      <InvoiceStats invoices={mockInvoices} />

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

      <InvoicesTable invoices={mockInvoices} filter={filter} />
    </div>
  );
}
