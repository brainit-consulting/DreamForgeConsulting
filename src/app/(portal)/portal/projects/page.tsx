"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { CheckCircle, Headphones, Clock, ShieldCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { ProjectStatus } from "@/types";

interface SupportPlanInfo {
  planType: string;
  includedHours: number;
  hoursUsed: number;
  active: boolean;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  budget?: number;
  supportPlan?: SupportPlanInfo | null;
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
      description: `Approve "${projectName}" to begin development? This confirms the scope, design, budget, and the Ownership & Licensing terms outlined in the proposal.`,
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
            {project.supportPlan?.active && ["LAUNCHED", "SUPPORT"].includes(project.status) && (
              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
                <Headphones className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {project.supportPlan.planType === "ANNUAL" ? "Annual" : "Monthly"} Support Plan
                  </p>
                  <p className="text-xs text-muted-foreground">Active support and maintenance</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={project.supportPlan.hoursUsed > project.supportPlan.includedHours ? "text-amber-400" : ""}>
                      {project.supportPlan.hoursUsed}h
                    </span>
                    <span className="text-muted-foreground">/ {project.supportPlan.includedHours}h this month</span>
                  </div>
                </div>
              </div>
            )}
            {["DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCHED", "SUPPORT"].includes(project.status) && (
              <details className="rounded-lg border border-border/30 bg-white/5">
                <summary className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/80 cursor-pointer select-none">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>Ownership & Licensing Terms</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                </summary>
                <div className="px-4 pb-4 space-y-2 text-xs text-foreground/60 leading-relaxed">
                  <p>DreamForge Consulting retains full ownership of all source code, architecture, and intellectual property developed during this engagement.</p>
                  <p>You receive a <strong className="text-foreground/80">perpetual, non-exclusive license</strong> to use the product for your business operations, maintained through an active support retainer.</p>
                  <p>You may <strong className="text-foreground/80">not</strong> resell, redistribute, sublicense, reverse-engineer, decompile, or clone the product or any part of it.</p>
                  <p>If the support retainer lapses beyond <strong className="text-foreground/80">60 days</strong>, DreamForge reserves the right to suspend or disable the software. During the 60-day grace period, the software continues to function but no support or updates are provided.</p>
                  <p>You may submit a written offer to <strong className="text-foreground/80">purchase full source code ownership</strong> (buyout) at any time. Buyout pricing is negotiated separately.</p>
                  <p>All custom assets (logos, content, branding) you provided remain your property.</p>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
