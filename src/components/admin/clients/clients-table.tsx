"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Client } from "@/types";

interface ClientsTableProps {
  clients: Client[];
  projectCounts: Record<string, number>;
}

export function ClientsTable({ clients, projectCounts }: ClientsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-center">Projects</TableHead>
            <TableHead>Since</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const initials = client.company
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.company}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.phone ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  {projectCounts[client.id] ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(client.createdAt, "MMM yyyy")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
