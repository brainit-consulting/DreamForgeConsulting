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
import type { Lead, LeadStatus } from "@/types";

const statusVariant: Record<LeadStatus, "info" | "default" | "ember" | "warning" | "success" | "destructive"> = {
  NEW: "info",
  CONTACTED: "default",
  QUALIFIED: "ember",
  PROPOSAL: "warning",
  CONVERTED: "success",
  LOST: "destructive",
};

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                </div>
              </TableCell>
              <TableCell>{lead.company ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge
                  label={lead.status.replace("_", " ")}
                  variant={statusVariant[lead.status]}
                  dot
                />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.source ?? "—"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {lead.value ? `$${lead.value.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(lead.createdAt, "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
