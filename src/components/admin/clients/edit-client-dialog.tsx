"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ClientData {
  id: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  sector?: string | null;
  notes?: string | null;
}

export function EditClientDialog({
  client,
  onUpdated,
  variant = "button",
}: {
  client: ClientData;
  onUpdated?: () => void;
  variant?: "button" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: client.company,
    email: client.email ?? "",
    phone: client.phone ?? "",
    website: client.website ?? "",
    address: client.address ?? "",
    sector: client.sector ?? "",
    notes: client.notes ?? "",
  });

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setForm({
        company: client.company,
        email: client.email ?? "",
        phone: client.phone ?? "",
        website: client.website ?? "",
        address: client.address ?? "",
        sector: client.sector ?? "",
        notes: client.notes ?? "",
      });
    }
    setOpen(isOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Client updated");
        setOpen(false);
        if (onUpdated) {
          onUpdated();
        } else {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        toast.error(data.error?.[0]?.message ?? "Failed to update client");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <ActionTooltip label="Edit client details">
        {variant === "icon" ? (
          <DialogTrigger
            render={<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" />}
          >
            <Pencil className="h-3.5 w-3.5" />
          </DialogTrigger>
        ) : (
          <DialogTrigger
            render={<Button variant="outline" size="sm" />}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DialogTrigger>
        )}
      </ActionTooltip>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">
            Edit Client
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="edit-company">Company</Label>
            <Input
              id="edit-company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@company.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-website">Website</Label>
              {form.website && (
                <a href={form.website.startsWith("http") ? form.website : `https://${form.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs cursor-pointer">↗ Visit</a>
              )}
            </div>
            <Input
              id="edit-website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://company.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St, City, FL 33901"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-sector">Sector</Label>
            <Input
              id="edit-sector"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              placeholder="e.g., Veterinary, Elder Care..."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-notes">Notes</Label>
            <textarea
              id="edit-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Internal notes about this client..."
              rows={3}
              className="font-notes text-base w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
