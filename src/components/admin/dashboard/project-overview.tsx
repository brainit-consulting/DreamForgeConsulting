"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ProjectStatus } from "@/types";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info", DESIGN: "ember", PROPOSAL: "warning", APPROVAL: "warning",
  DEVELOPMENT: "ember", TESTING: "warning", DEPLOYMENT: "warning", LAUNCHED: "success", SUPPORT: "default",
};

const statusLabel: Record<ProjectStatus, string> = {
  DISCOVERY: "Discovery", DESIGN: "Design", PROPOSAL: "Proposal", APPROVAL: "Approval",
  DEVELOPMENT: "Development", TESTING: "Testing", DEPLOYMENT: "Deploying", LAUNCHED: "Launched", SUPPORT: "Support",
};

interface ProjectRow {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  client?: { company: string };
}

export function ProjectOverview() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: ProjectRow[]) =>
        setProjects(data.filter((p) => p.status !== "LAUNCHED"))
      );
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Active Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No active projects.</p>
        )}
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="block space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium hover:text-primary">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.client?.company}</p>
              </div>
              <StatusBadge
                label={statusLabel[project.status]}
                variant={statusVariant[project.status]}
                dot
              />
            </div>
            <div className="flex items-center gap-3">
              <Progress value={project.progress} className="flex-1" />
              <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                {project.progress}%
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
