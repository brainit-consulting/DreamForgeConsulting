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
import { UserPlus } from "lucide-react";

export function InviteClientDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
  });

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/invite-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          tempPassword: data.tempPassword,
        });
        setForm({ name: "", email: "", company: "", phone: "" });
      } else {
        setResult({ error: data.error });
      }
    } catch {
      setResult({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Client
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">
            Invite a Client
          </DialogTitle>
          <DialogDescription>
            Create a portal account and send login credentials via email.
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
                  Temporary password (also sent via email):
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
          <form onSubmit={handleInvite} className="space-y-4 py-4">
            {result?.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {result.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="inv-name">Full Name</Label>
              <Input
                id="inv-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-email">Email</Label>
              <Input
                id="inv-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-company">Company</Label>
              <Input
                id="inv-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company Inc"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-phone">Phone (optional)</Label>
              <Input
                id="inv-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555-0100"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
