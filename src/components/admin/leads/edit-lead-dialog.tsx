"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import type { Lead } from "@/types";

export function EditLeadDialog({ lead, onUpdated }: { lead: Lead; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email,
    company: lead.company ?? "",
    phone: lead.phone ?? "",
    website: lead.website ?? "",
    address: lead.address ?? "",
    source: lead.source ?? "",
    notes: lead.notes ?? "",
    value: lead.value?.toString() ?? "",
  });

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setForm({
        name: lead.name,
        email: lead.email,
        company: lead.company ?? "",
        phone: lead.phone ?? "",
        website: lead.website ?? "",
        address: lead.address ?? "",
        source: lead.source ?? "",
        notes: lead.notes ?? "",
        value: lead.value?.toString() ?? "",
      });
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: form.value ? parseFloat(form.value) : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Lead updated");
        setOpen(false);
        onUpdated();
      } else {
        const data = await res.json();
        toast.error(data.error?.[0]?.message ?? "Failed to update lead");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <ActionTooltip label="Edit lead">
        <DialogTrigger
          render={<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" />}
        >
          <Pencil className="h-3.5 w-3.5" />
        </DialogTrigger>
      </ActionTooltip>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Edit Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="edit-company">Company</Label>
              <Input id="edit-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-website">Website</Label>
            <Input id="edit-website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://company.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-address">Address</Label>
            <Input id="edit-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City, FL 33901" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="edit-source">Source</Label>
              <Input id="edit-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Website, Referral, LinkedIn..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-value">Est. Value ($)</Label>
              <Input id="edit-value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
