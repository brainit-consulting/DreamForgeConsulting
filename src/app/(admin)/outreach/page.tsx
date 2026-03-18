"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import {
  Mail, Send, Trash2, FileEdit, Search, Plus, CheckCircle, XCircle, Clock, Eye, Copy, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { OutreachStatus, Lead } from "@/types";

const statusVariant: Record<OutreachStatus, "default" | "success" | "destructive"> = {
  DRAFT: "default", SENT: "success", FAILED: "destructive",
};

const statusFilters: { label: string; value: OutreachStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Failed", value: "FAILED" },
];

interface OutreachRow {
  id: string;
  subject: string;
  body: string;
  status: OutreachStatus;
  sentAt?: string;
  createdAt: string;
  lead: Lead | null;
}

export default function OutreachPage() {
  const [emails, setEmails] = useState<OutreachRow[]>([]);
  const [filter, setFilter] = useState<OutreachStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const confirmAction = useConfirm();

  // Compose state
  const [composeOpen, setComposeOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [leadSearch, setLeadSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch("/api/outreach");
      if (!res.ok) throw new Error();
      setEmails(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  async function openCompose(isOpen: boolean) {
    setComposeOpen(isOpen);
    if (isOpen) {
      const res = await fetch("/api/leads");
      if (res.ok) setLeads(await res.json());
      setSelectedLeadIds(new Set());
      setLeadSearch("");
      setSubject("");
      setBody("");
    }
  }

  const leadsWithEmail = leads.filter((l) => l.email);
  const filteredLeads = leadSearch
    ? leadsWithEmail.filter((l) =>
        [l.name, l.company, l.email].some((f) =>
          f?.toLowerCase().includes(leadSearch.toLowerCase())
        )
      )
    : leadsWithEmail;

  function toggleLead(id: string) {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCreateDrafts(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          ...(selectedLeadIds.size > 0 && { leadIds: Array.from(selectedLeadIds) }),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          selectedLeadIds.size > 0
            ? `${data.count} draft(s) created`
            : "Draft saved — assign leads when ready"
        );
        setComposeOpen(false);
        fetchEmails();
      } else {
        toast.error("Failed to create draft");
      }
    } finally {
      setCreating(false);
    }
  }

  // Assign leads dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDraftId, setAssignDraftId] = useState("");
  const [assignLeadIds, setAssignLeadIds] = useState<Set<string>>(new Set());
  const [assignSearch, setAssignSearch] = useState("");
  const [assigning, setAssigning] = useState(false);

  async function openAssign(draftId: string) {
    setAssignDraftId(draftId);
    setAssignLeadIds(new Set());
    setAssignSearch("");
    const res = await fetch("/api/leads");
    if (res.ok) setLeads(await res.json());
    setAssignOpen(true);
  }

  function toggleAssignLead(id: string) {
    setAssignLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (assignLeadIds.size === 0) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/outreach/${assignDraftId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(assignLeadIds) }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count} draft(s) created for leads`);
        setAssignOpen(false);
        fetchEmails();
      } else {
        toast.error("Failed to assign leads");
      }
    } finally {
      setAssigning(false);
    }
  }

  const assignFilteredLeads = assignSearch
    ? leadsWithEmail.filter((l) =>
        [l.name, l.company, l.email].some((f) =>
          f?.toLowerCase().includes(assignSearch.toLowerCase())
        )
      )
    : leadsWithEmail;

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewMeta, setPreviewMeta] = useState({ subject: "", from: "", to: "" });

  async function openPreview(id: string) {
    const res = await fetch(`/api/outreach/${id}/preview`);
    if (res.ok) {
      const data = await res.json();
      setPreviewMeta({ subject: data.subject, from: data.from, to: data.to });
      setPreviewHtml(data.html);
      setPreviewOpen(true);
    } else {
      toast.error("Failed to load preview");
    }
  }

  async function cloneEmail(id: string) {
    const original = emails.find((e) => e.id === id);
    if (!original) return;
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: original.subject, body: original.body }),
    });
    if (res.ok) {
      toast.success("Draft cloned — edit it from the table");
      fetchEmails();
    } else {
      toast.error("Failed to clone");
    }
  }

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  function openEdit(email: OutreachRow) {
    setEditId(email.id);
    setEditSubject(email.subject);
    setEditBody(email.body);
    setEditOpen(true);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    setEditSaving(true);
    try {
      const res = await fetch(`/api/outreach/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      });
      if (res.ok) {
        toast.success("Draft updated");
        setEditOpen(false);
        fetchEmails();
      } else {
        toast.error("Failed to update");
      }
    } finally {
      setEditSaving(false);
    }
  }

  async function sendEmail(id: string, leadName: string, leadEmail: string) {
    const ok = await confirmAction({
      title: "Send Outreach Email",
      description: `Send this email to ${leadName} (${leadEmail})? This action cannot be undone.`,
      confirmLabel: "Send",
      variant: "promote",
    });
    if (!ok) return;
    const res = await fetch(`/api/outreach/${id}/send`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Email sent to ${leadEmail}`);
      fetchEmails();
    } else {
      toast.error(data.error ?? "Send failed");
    }
  }

  async function deleteEmail(id: string) {
    const ok = await confirmAction({
      title: "Delete Draft",
      description: "This outreach draft will be permanently removed.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/outreach/${id}`, { method: "DELETE" });
    toast.success("Draft deleted");
    fetchEmails();
  }

  const filtered = filter === "ALL" ? emails : emails.filter((e) => e.status === filter);
  const draftCount = emails.filter((e) => e.status === "DRAFT").length;
  const sentCount = emails.filter((e) => e.status === "SENT").length;
  const failedCount = emails.filter((e) => e.status === "FAILED").length;

  const stats = [
    { label: "Total", value: emails.length, icon: Mail, color: "text-primary bg-primary/10" },
    { label: "Drafts", value: draftCount, icon: FileEdit, color: "text-muted-foreground bg-muted" },
    { label: "Sent", value: sentCount, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Failed", value: failedCount, icon: XCircle, color: "text-red-500 bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Outreach</h1>
          <p className="mt-1 text-muted-foreground">
            Compose and send outreach emails to leads.
          </p>
        </div>
        <Dialog open={composeOpen} onOpenChange={openCompose}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Outreach
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-primary">
                Compose Outreach
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDrafts} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="outreach-subject">Subject</Label>
                <Input
                  id="outreach-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Modern website for your practice"
                  className="font-notes text-base"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="outreach-body">Message</Label>
                <Textarea
                  id="outreach-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your outreach message..."
                  rows={5}
                  className="font-notes !text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Select Leads ({selectedLeadIds.size} selected)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search leads with email..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                  {filteredLeads.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No leads with email addresses found.
                    </p>
                  )}
                  {filteredLeads.map((lead) => (
                    <label
                      key={lead.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 last:border-0 hover:bg-muted/30"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.has(lead.id)}
                        onChange={() => toggleLead(lead.id)}
                        className="h-4 w-4 shrink-0 rounded border-border accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{lead.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lead.company ? `${lead.company} · ` : ""}{lead.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={creating || !subject || !body}
                  className="w-full"
                >
                  {creating
                    ? "Creating..."
                    : selectedLeadIds.size > 0
                      ? `Create ${selectedLeadIds.size} Draft${selectedLeadIds.size !== 1 ? "s" : ""}`
                      : "Save Draft"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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

      {error && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground">Failed to load outreach emails.</p>
          <button type="button" onClick={fetchEmails} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retry</button>
        </div>
      )}

      {!error && (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No outreach emails yet. Compose your first one!</TableCell></TableRow>
              )}
              {filtered.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium text-sm">{email.subject}</TableCell>
                  <TableCell>
                    {email.lead ? (
                      <div>
                        <p className="text-sm">{email.lead.name}</p>
                        <p className="text-xs text-muted-foreground">{email.lead.company ?? ""}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Template — no recipient</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{email.lead?.email ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge label={email.status} variant={statusVariant[email.status]} dot />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {email.sentAt
                      ? format(new Date(email.sentAt), "MMM d, yyyy")
                      : format(new Date(email.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <ActionTooltip label="Preview email">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                          onClick={() => openPreview(email.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                      {email.status === "DRAFT" && (
                        <ActionTooltip label="Edit draft">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                            onClick={() => openEdit(email)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      <ActionTooltip label="Clone as new draft">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                          onClick={() => cloneEmail(email.id)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                      {email.status === "DRAFT" && !email.lead && (
                        <ActionTooltip label="Assign leads">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-blue-500"
                            onClick={() => openAssign(email.id)}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      {email.status === "DRAFT" && email.lead && (
                        <ActionTooltip label="Send email">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-emerald-500"
                            onClick={() => sendEmail(email.id, email.lead!.name, email.lead!.email ?? "")}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      {email.status === "SENT" && email.lead && (
                        <ActionTooltip label="Resend email">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-blue-500"
                            onClick={() => sendEmail(email.id, email.lead!.name, email.lead!.email ?? "")}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      {email.status === "FAILED" && email.lead && (
                        <ActionTooltip label="Retry send">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-amber-500"
                            onClick={() => sendEmail(email.id, email.lead!.name, email.lead!.email ?? "")}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      {email.status !== "SENT" && (
                        <ActionTooltip label="Delete draft">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => deleteEmail(email.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign Leads Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Assign Leads
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads with email..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
              {assignFilteredLeads.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No leads with email addresses found.
                </p>
              )}
              {assignFilteredLeads.map((lead) => (
                <label
                  key={lead.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 last:border-0 hover:bg-muted/30"
                >
                  <input
                    type="checkbox"
                    checked={assignLeadIds.has(lead.id)}
                    onChange={() => toggleAssignLead(lead.id)}
                    className="h-4 w-4 shrink-0 rounded border-border accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead.company ? `${lead.company} · ` : ""}{lead.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={assigning || assignLeadIds.size === 0}
                className="w-full"
              >
                {assigning
                  ? "Assigning..."
                  : `Assign to ${assignLeadIds.size} Lead${assignLeadIds.size !== 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Draft Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Edit Draft
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="font-notes text-base"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-body">Message</Label>
              <Textarea
                id="edit-body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={8}
                className="font-notes !text-base"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editSaving} className="w-full">
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Email Preview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid gap-1 text-sm">
              <p><span className="text-muted-foreground">From:</span> {previewMeta.from}</p>
              <p><span className="text-muted-foreground">To:</span> {previewMeta.to}</p>
              <p><span className="text-muted-foreground">Subject:</span> {previewMeta.subject}</p>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                title="Email preview"
                className="w-full h-[450px] bg-[#0A0A0F]"
                sandbox=""
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
