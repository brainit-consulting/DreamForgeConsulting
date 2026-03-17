"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockTickets, mockProjects } from "@/lib/mock-data";
import type { TicketPriority, TicketStatus } from "@/types";

const CLIENT_ID = "client-3";

const priorityVariant: Record<TicketPriority, "default" | "info" | "warning" | "destructive"> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "destructive",
};

const statusVariant: Record<TicketStatus, "default" | "info" | "success" | "ember"> = {
  OPEN: "info",
  IN_PROGRESS: "ember",
  RESOLVED: "success",
  CLOSED: "default",
};

export default function PortalTicketsPage() {
  const tickets = mockTickets.filter((t) => t.clientId === CLIENT_ID);
  const projects = mockProjects.filter((p) => p.clientId === CLIENT_ID);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [projectId, setProjectId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, this would POST to an API
    alert(`Ticket submitted: ${subject}`);
    setShowForm(false);
    setSubject("");
    setDescription("");
    setPriority("MEDIUM");
    setProjectId("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Support Tickets</h1>
          <p className="mt-1 text-muted-foreground">
            Submit and track support requests.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Ticket"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Submit a Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description..."
                  rows={4}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as TicketPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit">Submit Ticket</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {format(ticket.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={ticket.priority}
                    variant={priorityVariant[ticket.priority]}
                  />
                  <StatusBadge
                    label={ticket.status.replace("_", " ")}
                    variant={statusVariant[ticket.status]}
                    dot
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No tickets submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
