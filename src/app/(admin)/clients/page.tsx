"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InviteClientDialog } from "@/components/admin/clients/invite-client-dialog";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { Trash2 } from "lucide-react";

interface ClientRow {
  id: string;
  company: string;
  email: string;
  phone?: string;
  createdAt: string;
  _count: { projects: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  async function deleteClient(id: string) {
    if (!confirm("Delete this client and all their projects/invoices?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    fetchClients();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Clients</h1>
          <p className="mt-1 text-muted-foreground">
            {clients.length} active clients
          </p>
        </div>
        <InviteClientDialog />
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead>Since</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && clients.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No clients yet. Invite one or promote a lead!</TableCell></TableRow>
            )}
            {clients.map((client) => {
              const initials = client.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <TableRow key={client.id}>
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
                  <TableCell className="text-center">{client._count.projects}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(client.createdAt), "MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <ActionTooltip label="Delete client">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    </ActionTooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
