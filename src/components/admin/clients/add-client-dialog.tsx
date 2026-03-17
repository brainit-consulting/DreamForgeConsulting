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
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddClientDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    tempPassword?: string;
    error?: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    website: "",
    address: "",
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setResult(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/invite-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sendInvite,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          tempPassword: data.tempPassword,
        });
        toast.success(sendInvite ? "Client added & invite sent" : "Client added");
        setForm({ name: "", email: "", company: "", phone: "", website: "", address: "" });
        onCreated();
      } else {
        setResult({ error: data.error });
        toast.error(data.error ?? "Failed to add client");
      }
    } catch {
      setResult({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        Add Client
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">
            Add Client
          </DialogTitle>
          <DialogDescription>
            Create a client record with a portal account.
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-medium text-emerald-500">
                {result.message}
              </p>
            </div>
            {result.tempPassword && (
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Temporary password{sendInvite ? " (also sent via email)" : ""}:
                </p>
                <code className="text-sm font-mono text-primary">
                  {result.tempPassword}
                </code>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setResult(null);
                setOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            {result?.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {result.error}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="client-name">Full Name</Label>
                <Input
                  id="client-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
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
                  placeholder="jane@company.com"
                  required
                />
              </div>
            </div>
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
                <Label htmlFor="client-phone">Phone</Label>
                <Input
                  id="client-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555-0100"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="client-website">Website</Label>
                <Input
                  id="client-website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="client-address">Address</Label>
                <Input
                  id="client-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Send portal invite email</p>
                <p className="text-xs text-muted-foreground">
                  Sends login credentials to the client
                </p>
              </div>
              <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
