"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddClientDialog } from "@/components/admin/clients/add-client-dialog";
import { EditClientDialog } from "@/components/admin/clients/edit-client-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { Trash2, Search, Mail, ShieldCheck, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ClientRow {
  id: string;
  userId?: string | null;
  company: string;
  email: string;
  phone?: string;
  sector?: string;
  cardSent?: boolean;
  createdAt: string;
  _count: { projects: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [error, setError] = useState(false);
  const confirm = useConfirm();

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error();
      setClients(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Invite result state
  const [inviteResult, setInviteResult] = useState<{
    message: string;
    tempPassword: string;
    email: string;
  } | null>(null);

  async function inviteClient(id: string) {
    const client = clients.find((c) => c.id === id);
    const ok = await confirm({
      title: "Send Portal Invite",
      description: "This will create a portal account and send an email to the client with their login email and a temporary password. They can use these to sign in to their client portal.",
      confirmLabel: "Send Invite",
      variant: "promote",
    });
    if (!ok) return;
    const res = await fetch("/api/admin/invite-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      setInviteResult({
        message: data.message,
        tempPassword: data.tempPassword,
        email: client?.email ?? "",
      });
      fetchClients();
    } else {
      toast.error(data.error);
    }
  }

  async function deleteClient(id: string) {
    const ok = await confirm({
      title: "Delete Client",
      description: "This will permanently delete the client and all their projects, invoices, and tickets.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    toast.success("Client deleted");
    fetchClients();
  }

  const sectors = [...new Set(clients.map((c) => c.sector).filter(Boolean))] as string[];

  const filtered = clients.filter((c) => {
    if (sectorFilter !== "ALL" && c.sector !== sectorFilter) return false;
    if (search) {
      return [c.company, c.email, c.phone, c.sector].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Clients</h1>
          <p className="mt-1 text-muted-foreground">
            {clients.length} active clients
          </p>
        </div>
        <AddClientDialog onCreated={fetchClients} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients by company, email, sector..."
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
          <p className="text-muted-foreground">Failed to load clients.</p>
          <button type="button" onClick={fetchClients} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Retry</button>
        </div>
      )}

      {!error && <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">Card</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-center">Portal</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead>Since</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{search ? "No clients match your search." : "No clients yet. Add your first one!"}</TableCell></TableRow>
            )}
            {filtered.map((client) => {
              const initials = client.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <TableRow key={client.id}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={client.cardSent ?? false}
                      title="Postcard sent"
                      className="h-4 w-4 accent-primary cursor-pointer"
                      onChange={async (e) => {
                        const res = await fetch(`/api/clients/${client.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ cardSent: e.target.checked }),
                        });
                        if (res.ok) fetchClients();
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{client.company}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="text-muted-foreground">{client.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{client.sector ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    {client.userId ? (
                      <ActionTooltip label="Has portal access">
                        <ShieldCheck className="mx-auto h-4 w-4 text-emerald-500" />
                      </ActionTooltip>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{client._count.projects}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(client.createdAt), "MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <EditClientDialog
                        client={client}
                        onUpdated={fetchClients}
                        variant="icon"
                      />
                      {!client.userId && (
                        <ActionTooltip label="Send portal invite">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-blue-500"
                            onClick={() => inviteClient(client.id)}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      {client.userId && (
                        <ActionTooltip label="Resend portal invite (new password)">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Resend Portal Invite",
                                description: "This will generate a new temporary password and resend the login credentials email. The old password will no longer work.",
                                confirmLabel: "Resend",
                                variant: "promote",
                              });
                              if (!ok) return;
                              const res = await fetch("/api/admin/invite-client", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ clientId: client.id, resend: true }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setInviteResult({
                                  message: data.message,
                                  tempPassword: data.tempPassword,
                                  email: client.email ?? "",
                                });
                              } else {
                                toast.error(data.error);
                              }
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>
                      )}
                      <ActionTooltip label="Delete client">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => deleteClient(client.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>}

      {/* Invite Result Dialog — shows credentials persistently */}
      <Dialog open={!!inviteResult} onOpenChange={(open) => { if (!open) setInviteResult(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Portal Invite Sent
            </DialogTitle>
          </DialogHeader>
          {inviteResult && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-emerald-400">
                  {inviteResult.message}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Login credentials (also sent via email):</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <code className="text-sm font-mono text-foreground">{inviteResult.email}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Temp Password:</span>
                  <code className="text-sm font-mono text-primary">{inviteResult.tempPassword}</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Save these credentials. You can share them manually if the email doesn&apos;t arrive.
              </p>
              <DialogFooter>
                <Button variant="outline" className="w-full" onClick={() => setInviteResult(null)}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
