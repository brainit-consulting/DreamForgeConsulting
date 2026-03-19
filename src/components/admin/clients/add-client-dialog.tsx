"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddClientDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    sector: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Client added");
        setForm({ company: "", email: "", phone: "", website: "", address: "", sector: "", notes: "" });
        setOpen(false);
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error?.[0]?.message ?? "Failed to add client");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        Add Client
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">
            Add Client
          </DialogTitle>
          <DialogDescription>
            Add a client record. You can send a portal invite later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="client-company">Company</Label>
              <Input
                id="client-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company Inc"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555-0100"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-website">Website</Label>
              <Input
                id="client-website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://company.com"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-address">Address</Label>
            <Input
              id="client-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St, City, FL 33901"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-sector">Sector</Label>
            <Input
              id="client-sector"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              placeholder="e.g., Veterinary, Elder Care..."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-notes">Notes</Label>
            <textarea
              id="client-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Internal notes about this client..."
              rows={3}
              className="font-notes text-base w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
