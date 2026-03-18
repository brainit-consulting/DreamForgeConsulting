"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { ProjectStatus } from "@/types";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  budget?: number;
}

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const confirmAction = useConfirm();

  function fetchProjects() {
    fetch("/api/portal/data")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []));
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleApprove(projectId: string, projectName: string) {
    const ok = await confirmAction({
      title: "Approve Project",
      description: `Approve "${projectName}" to begin development? This confirms the scope, design, and budget.`,
      confirmLabel: "Approve & Begin Development",
      variant: "promote",
    });
    if (!ok) return;

    const res = await fetch(`/api/projects/${projectId}/approve`, { method: "POST" });
    if (res.ok) {
      toast.success("Project approved — development begins!");
      fetchProjects();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Approval failed");
    }
  }

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl">{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              {project.status === "APPROVAL" && (
                <Button
                  onClick={() => handleApprove(project.id, project.name)}
                  className="shrink-0"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Review &amp; Approve
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <WorkflowTracker currentStatus={project.status} progress={project.progress} />
            {project.status === "APPROVAL" && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                <p className="text-sm font-medium text-amber-400">
                  This project is ready for your approval. Review the scope and design, then click &quot;Review &amp; Approve&quot; to begin development.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
