"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";
import type { TicketPriority, TicketStatus } from "@/types";

const priorityVariant: Record<TicketPriority, "default" | "info" | "warning" | "destructive"> = {
  LOW: "default", MEDIUM: "info", HIGH: "warning", URGENT: "destructive",
};
const statusVariant: Record<TicketStatus, "default" | "info" | "success" | "ember"> = {
  OPEN: "info", IN_PROGRESS: "ember", RESOLVED: "success", CLOSED: "default",
};

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  project?: { name: string };
}

interface Project {
  id: string;
  name: string;
}

export default function PortalTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [projectId, setProjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/data");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTickets(data.tickets ?? []);
      setProjects(data.projects ?? []);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/portal/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject, description, priority,
        projectId: projectId || undefined,
      }),
    });
    if (res.ok) {
      toast.success("Ticket submitted — we'll get back to you soon");
      setShowForm(false);
      setSubject(""); setDescription(""); setPriority("MEDIUM"); setProjectId("");
      fetchData();
    } else {
      toast.error("Failed to submit ticket");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Support Tickets</h1>
          <p className="mt-1 text-muted-foreground">Submit and track support requests.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Ticket"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="font-display text-xl">Submit a Ticket</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description" className="font-notes text-base" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description..." rows={4} className="font-notes !text-base" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={(v) => setProjectId(v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority((v ?? "MEDIUM") as TicketPriority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {error && (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">Failed to load tickets.</p>
            <button type="button" onClick={fetchData} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retry</button>
          </div>
        )}
        {!error && tickets.length === 0 && !showForm && (
          <p className="py-8 text-center text-muted-foreground">No tickets submitted yet.</p>
        )}
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.project?.name ? `${ticket.project.name} · ` : ""}
                    Submitted {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={ticket.priority} variant={priorityVariant[ticket.priority]} />
                  <StatusBadge label={ticket.status.replace("_", " ")} variant={statusVariant[ticket.status]} dot />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
