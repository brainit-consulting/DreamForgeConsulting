"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockClients, mockProjects } from "@/lib/mock-data";
import type { Invoice, InvoiceStatus } from "@/types";

const statusVariant: Record<InvoiceStatus, "default" | "info" | "success" | "destructive" | "warning"> = {
  DRAFT: "default",
  SENT: "info",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "warning",
};

interface InvoicesTableProps {
  invoices: Invoice[];
  filter?: InvoiceStatus | "ALL";
}

export function InvoicesTable({ invoices, filter = "ALL" }: InvoicesTableProps) {
  const filtered =
    filter === "ALL" ? invoices : invoices.filter((i) => i.status === filter);

  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((invoice) => {
            const client = mockClients.find((c) => c.id === invoice.clientId);
            const project = invoice.projectId
              ? mockProjects.find((p) => p.id === invoice.projectId)
              : null;
            return (
              <TableRow key={invoice.id} className="hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium text-sm">
                    {invoice.description ?? `Invoice ${invoice.id}`}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client?.company ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={invoice.status}
                    variant={statusVariant[invoice.status]}
                    dot
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${invoice.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.dueDate
                    ? format(invoice.dueDate, "MMM d, yyyy")
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
