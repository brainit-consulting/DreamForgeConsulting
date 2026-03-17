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
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { Trash2, UserCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "@/types";

const statusVariant: Record<LeadStatus, "info" | "default" | "ember" | "warning" | "success" | "destructive"> = {
  NEW: "info", CONTACTED: "default", QUALIFIED: "ember",
  PROPOSAL: "warning", CONVERTED: "success", LOST: "destructive",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      description: "This will create a portal account and send login credentials via email.",
      confirmLabel: "Promote & Send Invite",
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

  const filtered = search
    ? leads.filter((l) =>
        [l.name, l.email, l.company, l.source].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : leads;

  const counts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leads by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground">Failed to load leads.</p>
          <button type="button" onClick={fetchLeads} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retry</button>
        </div>
      )}

      {!error && <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{search ? "No leads match your search." : "No leads yet. Add your first one!"}</TableCell></TableRow>
            )}
            {filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                </TableCell>
                <TableCell>{lead.company ?? "—"}</TableCell>
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
                <TableCell className="text-muted-foreground">{lead.source ?? "—"}</TableCell>
                <TableCell className="text-right font-medium">
                  {lead.value ? `$${lead.value.toLocaleString()}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
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
    </div>
  );
}
