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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddLeadDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", website: "", address: "", source: "", sector: "", notes: "", value: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: form.value ? parseFloat(form.value) : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Lead created");
        setForm({ name: "", email: "", company: "", phone: "", website: "", address: "", source: "", sector: "", notes: "", value: "" });
        setOpen(false);
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error?.[0]?.message ?? "Failed to create lead");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        Add Lead
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Add Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="lead-name">Name</Label>
              <Input id="lead-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="lead-company">Company</Label>
              <Input id="lead-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input id="lead-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-website">Website</Label>
            <Input id="lead-website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://company.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-address">Address</Label>
            <Input id="lead-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City, FL 33901" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="lead-sector">Sector</Label>
              <Input id="lead-sector" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="e.g., Veterinary, Elder Care..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lead-value">Est. Value ($)</Label>
              <Input id="lead-value" type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-source">Source</Label>
            <Input id="lead-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Website, Referral, LinkedIn..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea id="lead-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
