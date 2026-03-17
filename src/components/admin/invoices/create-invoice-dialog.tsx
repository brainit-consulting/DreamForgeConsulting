"use client";

import { useState, useEffect } from "react";
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

interface ClientOption { id: string; company: string }
interface ProjectOption { id: string; name: string; clientId: string }

export function CreateInvoiceDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [form, setForm] = useState({
    clientId: "", projectId: "", amount: "", description: "", dueDate: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/clients").then((r) => r.json()).then(setClients);
      fetch("/api/projects").then((r) => r.json()).then(setProjects);
    }
  }, [open]);

  const filteredProjects = form.clientId
    ? projects.filter((p) => p.clientId === form.clientId)
    : projects;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: form.clientId,
          projectId: form.projectId || undefined,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          dueDate: form.dueDate || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Invoice created as draft");
        setForm({ clientId: "", projectId: "", amount: "", description: "", dueDate: "" });
        setOpen(false);
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error?.[0]?.message ?? "Failed to create invoice");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        New Invoice
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Client</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v ?? "", projectId: "" })}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Project (optional)</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v ?? "" })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {filteredProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="inv-amount">Amount ($)</Label>
              <Input id="inv-amount" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="font-notes text-base" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="inv-due">Due Date</Label>
              <Input id="inv-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="font-notes text-base" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="inv-desc">Description</Label>
            <Textarea id="inv-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="font-notes !text-base" placeholder="e.g., Phase 1 deposit - 50% upfront" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !form.clientId || !form.amount} className="w-full">
              {loading ? "Creating..." : "Create Draft Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
