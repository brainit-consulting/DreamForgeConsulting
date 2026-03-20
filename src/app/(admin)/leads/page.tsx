"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddLeadDialog } from "@/components/admin/leads/add-lead-dialog";
import { EditLeadDialog } from "@/components/admin/leads/edit-lead-dialog";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, UserCheck, Search, Send, X, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "@/types";

const statusVariant: Record<LeadStatus, "info" | "default" | "ember" | "warning" | "success" | "destructive"> = {
  NEW: "info", CONTACTED: "success", QUALIFIED: "ember",
  PROPOSAL: "warning", CONVERTED: "success", LOST: "destructive",
};

interface OutreachTemplate {
  id: string;
  subject: string;
  body: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [bulkSending, setBulkSending] = useState(false);
  const confirm = useConfirm();

  const [error, setError] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error();
      setLeads(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateStatus(id: string, status: LeadStatus) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error("Failed to update status");
    }
    fetchLeads();
  }

  async function deleteLead(id: string) {
    const ok = await confirm({
      title: "Delete Lead",
      description: "This lead will be permanently removed. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    toast.success("Lead deleted");
    fetchLeads();
  }

  async function promoteLead(id: string) {
    const ok = await confirm({
      title: "Promote to Client",
      description: "This will convert the lead to a client record. You can send a portal invite later from the Clients page.",
      confirmLabel: "Promote",
      variant: "promote",
    });
    if (!ok) return;
    const res = await fetch(`/api/leads/${id}/promote`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchLeads();
    } else {
      toast.error(data.error);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const emailLeads = filtered.filter((l) => l.email);
    if (emailLeads.every((l) => selectedIds.has(l.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(emailLeads.map((l) => l.id)));
    }
  }

  async function openBulkDialog() {
    // Fetch templates
    const res = await fetch("/api/outreach?templates=true");
    if (res.ok) {
      const data = await res.json();
      setTemplates(data);
    }
    setSelectedTemplate("");
    setBulkDialogOpen(true);
  }

  async function handleBulkSend() {
    if (!selectedTemplate) return;
    const leadIds = [...selectedIds];
    const leadsWithEmail = leads.filter((l) => selectedIds.has(l.id) && l.email);

    const ok = await confirm({
      title: "Send Bulk Outreach",
      description: `This will send the outreach email to ${leadsWithEmail.length} lead${leadsWithEmail.length !== 1 ? "s" : ""}. Each lead will receive a personalized email using the selected template.`,
      confirmLabel: `Send to ${leadsWithEmail.length} leads`,
    });
    if (!ok) return;

    setBulkSending(true);
    setBulkDialogOpen(false);

    try {
      const res = await fetch("/api/outreach/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate, leadIds }),
      });
      const data = await res.json();
      if (res.ok) {
        const parts = [`Sent to ${data.sent} lead${data.sent !== 1 ? "s" : ""}`];
        if (data.skipped > 0) parts.push(`${data.skipped} skipped (no email)`);
        if (data.failed > 0) parts.push(`${data.failed} failed`);
        toast.success(parts.join(" · "));
      } else {
        toast.error(data.error ?? "Bulk send failed");
      }
    } catch {
      toast.error("Bulk send failed");
    } finally {
      setBulkSending(false);
      setSelectedIds(new Set());
      fetchLeads();
    }
  }

  const sectors = [...new Set(leads.map((l) => l.sector).filter(Boolean))] as string[];

  const filtered = leads.filter((l) => {
    if (sectorFilter !== "ALL" && l.sector !== sectorFilter) return false;
    if (search) {
      return [l.name, l.email, l.company, l.source, l.sector].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const counts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emailLeadsInView = filtered.filter((l) => l.email);
  const allEmailSelected = emailLeadsInView.length > 0 && emailLeadsInView.every((l) => selectedIds.has(l.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            {leads.length} leads &middot; {counts.NEW ?? 0} new &middot; {counts.QUALIFIED ?? 0} qualified
          </p>
        </div>
        <AddLeadDialog onCreated={fetchLeads} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, company, sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {sectors.length > 0 && (
          <Select value={sectorFilter} onValueChange={(v) => setSectorFilter(v ?? "ALL")}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sectors</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground">Failed to load leads.</p>
          <button type="button" onClick={fetchLeads} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retry</button>
        </div>
      )}

      {!error && <div className="rounded-lg border border-border overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[3%] text-center">
                <input
                  type="checkbox"
                  checked={allEmailSelected}
                  title="Select all leads with email"
                  className="h-4 w-4 accent-primary cursor-pointer"
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[3%] text-center">Card</TableHead>
              <TableHead className="w-[19%]">Name</TableHead>
              <TableHead className="w-[18%]">Company</TableHead>
              <TableHead className="w-[15%]">Sector</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[8%] text-right">Value</TableHead>
              <TableHead className="w-[12%]">Created</TableHead>
              <TableHead className="w-[10%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{search ? "No leads match your search." : "No leads yet. Add your first one!"}</TableCell></TableRow>
            )}
            {filtered.map((lead) => (
              <TableRow key={lead.id} className={selectedIds.has(lead.id) ? "bg-primary/5" : ""}>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.id)}
                    disabled={!lead.email}
                    title={lead.email ? "Select for bulk outreach" : "No email — cannot send outreach"}
                    className="h-4 w-4 accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    onChange={() => toggleSelect(lead.id)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={lead.cardSent ?? false}
                    title="Postcard sent"
                    className="h-4 w-4 accent-primary cursor-pointer"
                    onChange={async (e) => {
                      const res = await fetch(`/api/leads/${lead.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cardSent: e.target.checked }),
                      });
                      if (res.ok) fetchLeads();
                    }}
                  />
                </TableCell>
                <TableCell className="truncate">
                  <div className="flex items-center gap-1.5">
                    <EditLeadDialog lead={lead} onUpdated={fetchLeads} variant="name" />
                    {lead.outreachEmails?.[0]?.status === "SENT" && (
                      <ActionTooltip label={`Outreach sent ${lead.outreachEmails[0].sentAt ? format(new Date(lead.outreachEmails[0].sentAt), "MMM d") : ""}`}>
                        <Mail className="h-3 w-3 text-emerald-500 shrink-0" />
                      </ActionTooltip>
                    )}
                    {lead.outreachEmails?.[0]?.status === "DRAFT" && (
                      <ActionTooltip label="Outreach draft pending">
                        <Mail className="h-3 w-3 text-amber-500 shrink-0" />
                      </ActionTooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="truncate">{lead.company ?? "—"}</TableCell>
                <TableCell className="truncate text-muted-foreground">{lead.sector ?? "—"}</TableCell>
                <TableCell>
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus(lead.id, v as LeadStatus)}
                  >
                    <SelectTrigger className="h-7 w-[130px] text-xs">
                      <StatusBadge label={lead.status} variant={statusVariant[lead.status]} dot />
                    </SelectTrigger>
                    <SelectContent>
                      {(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "LOST"] as LeadStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {lead.value ? `$${lead.value.toLocaleString()}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <EditLeadDialog lead={lead} onUpdated={fetchLeads} />
                    {lead.status !== "CONVERTED" && lead.status !== "LOST" && (
                      <ActionTooltip label="Promote to Client">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-emerald-500"
                          onClick={() => promoteLead(lead.id)}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete lead">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => deleteLead(lead.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    </ActionTooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl border border-primary/30 bg-card/95 backdrop-blur px-6 py-3 shadow-lg shadow-primary/10">
          <span className="text-sm font-medium">
            {selectedIds.size} lead{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
          <ActionTooltip label="Choose an outreach template to send to selected leads">
            <Button
              size="sm"
              onClick={openBulkDialog}
              disabled={bulkSending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {bulkSending ? "Sending..." : "Continue"}
            </Button>
          </ActionTooltip>
        </div>
      )}

      {/* Bulk outreach dialog — selected leads + template picker */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">Bulk Outreach</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Selected leads */}
            <div>
              <p className="text-sm font-display text-primary mb-2">Selected Leads ({selectedIds.size})</p>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {leads.filter((l) => selectedIds.has(l.id)).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.email ?? "no email"} · {lead.company}</p>
                    </div>
                    <ActionTooltip label="Remove from selection">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          const next = new Set(selectedIds);
                          next.delete(lead.id);
                          setSelectedIds(next);
                          if (next.size === 0) setBulkDialogOpen(false);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </ActionTooltip>
                  </div>
                ))}
              </div>
            </div>

            {/* Template picker */}
            <div>
              <p className="text-sm font-display text-primary mb-2">Choose Template</p>
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                  No templates found. Create one from the Outreach page first.
                </p>
              )}
              <div className="space-y-2">
                {templates.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={t.id}
                      checked={selectedTemplate === t.id}
                      onChange={() => setSelectedTemplate(t.id)}
                      className="accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.body.slice(0, 80)}...</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleBulkSend}
              disabled={!selectedTemplate || selectedIds.size === 0}
              className="bg-primary text-primary-foreground"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send to {selectedIds.size} lead{selectedIds.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
