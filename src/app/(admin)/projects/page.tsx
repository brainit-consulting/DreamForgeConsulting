"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddProjectDialog } from "@/components/admin/projects/add-project-dialog";
import { Trash2 } from "lucide-react";
import type { ProjectStatus } from "@/types";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info", DESIGN: "ember", DEVELOPMENT: "ember",
  TESTING: "warning", DEPLOYMENT: "warning", LAUNCHED: "success", SUPPORT: "default",
};

interface ProjectRow {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  budget?: number;
  deadline?: string;
  client?: { company: string };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function updateProject(id: string, data: Partial<ProjectRow>) {
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchProjects();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            {projects.length} projects
          </p>
        </div>
        <AddProjectDialog onCreated={fetchProjects} />
      </div>

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
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!loading && projects.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No projects yet. Create one for a client!</TableCell></TableRow>
            )}
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.client?.company ?? "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={project.status}
                    onValueChange={(v) => updateProject(project.id, { status: v as ProjectStatus })}
                  >
                    <SelectTrigger className="h-7 w-[140px] text-xs">
                      <StatusBadge label={project.status} variant={statusVariant[project.status]} dot />
                    </SelectTrigger>
                    <SelectContent>
                      {(["DISCOVERY", "DESIGN", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCHED", "SUPPORT"] as ProjectStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="w-20" />
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {project.budget ? `$${project.budget.toLocaleString()}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={() => deleteProject(project.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
