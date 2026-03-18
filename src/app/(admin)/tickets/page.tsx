"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import {
  TicketCheck, AlertTriangle, Clock, CheckCircle, Trash2, Archive,
} from "lucide-react";
import { toast } from "sonner";
import type { TicketStatus, TicketPriority } from "@/types";

const statusVariant: Record<TicketStatus, "info" | "ember" | "success" | "default"> = {
  OPEN: "info", IN_PROGRESS: "ember", RESOLVED: "success", CLOSED: "default",
};
const priorityVariant: Record<TicketPriority, "default" | "info" | "warning" | "destructive"> = {
  LOW: "default", MEDIUM: "info", HIGH: "warning", URGENT: "destructive",
};

const statusFilters: { label: string; value: TicketStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

interface TicketRow {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  client?: { company: string; email: string };
  project?: { name: string };
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const confirmAction = useConfirm();

  const fetchTickets = useCallback(async () => {
    const res = await fetch("/api/admin/tickets");
    if (res.ok) {
      const data = await res.json();
      setTickets(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
  const urgentCount = tickets.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length;

  async function updateTicket(id: string, data: { status?: TicketStatus; priority?: TicketPriority }) {
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success(`Ticket updated`);
      fetchTickets();
    } else {
      toast.error("Failed to update ticket");
    }
  }

  async function deleteTicket(id: string) {
    const ok = await confirmAction({
      title: "Delete Ticket",
      description: "This ticket will be permanently removed.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/admin/tickets/${id}`, { method: "DELETE" });
    toast.success("Ticket deleted");
    fetchTickets();
  }

  const stats = [
    { label: "Open", value: openCount, icon: TicketCheck, color: "text-blue-500 bg-blue-500/10" },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
    { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "High/Urgent", value: urgentCount, icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Support Tickets</h1>
        <p className="mt-1 text-muted-foreground">{tickets.length} tickets total</p>
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
        {statusFilters.map((f) => (
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
              <TableHead>Subject</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tickets found.</TableCell></TableRow>
            )}
            {filtered.map((ticket) => (
              <React.Fragment key={ticket.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                >
                  <TableCell>
                    <p className="font-medium text-sm">{ticket.subject}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {ticket.client?.company ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {ticket.project?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.priority}
                      onValueChange={(v) => updateTicket(ticket.id, { priority: v as TicketPriority })}
                    >
                      <SelectTrigger className="h-7 w-[100px] text-xs" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge label={ticket.priority} variant={priorityVariant[ticket.priority]} />
                      </SelectTrigger>
                      <SelectContent>
                        {(["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(v) => updateTicket(ticket.id, { status: v as TicketStatus })}
                    >
                      <SelectTrigger className="h-7 w-[130px] text-xs" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge label={ticket.status.replace("_", " ")} variant={statusVariant[ticket.status]} dot />
                      </SelectTrigger>
                      <SelectContent>
                        {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {ticket.status !== "CLOSED" && (
                        <ActionTooltip label="Close ticket">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                            onClick={() => updateTicket(ticket.id, { status: "CLOSED" })}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      <ActionTooltip label="Delete ticket">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => deleteTicket(ticket.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </TableCell>
                </TableRow>
                {expanded === ticket.id && (
                  <TableRow key={`${ticket.id}-detail`}>
                    <TableCell colSpan={7} className="bg-muted/30 px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          From {ticket.client?.company} ({ticket.client?.email})
                          {" · "}Submitted {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
