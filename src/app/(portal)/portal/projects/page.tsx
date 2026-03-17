"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import type { ProjectStatus } from "@/types";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
}

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/portal/data")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">My Projects</h1>
        <p className="mt-1 text-muted-foreground">
          View the status and progress of your active projects.
        </p>
      </div>

      {projects.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No projects yet.</p>
      )}

      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="font-display text-xl">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </CardHeader>
          <CardContent>
            <WorkflowTracker currentStatus={project.status} progress={project.progress} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
