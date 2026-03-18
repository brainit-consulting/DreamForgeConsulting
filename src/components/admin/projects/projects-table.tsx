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
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockClients } from "@/lib/mock-data";
import type { Project, ProjectStatus } from "@/types";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info",
  DESIGN: "ember",
  PROPOSAL: "warning",
  APPROVAL: "warning",
  DEVELOPMENT: "ember",
  TESTING: "warning",
  DEPLOYMENT: "warning",
  LAUNCHED: "success",
  SUPPORT: "default",
};

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const client = mockClients.find((c) => c.id === project.clientId);
            return (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client?.company ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={project.status}
                    variant={statusVariant[project.status]}
                    dot
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="w-20" />
                    <span className="text-xs text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {project.budget
                    ? `$${project.budget.toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.deadline
                    ? format(project.deadline, "MMM d, yyyy")
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
