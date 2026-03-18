"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import { StageWorkPanel } from "@/components/admin/projects/stage-work-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ActionTooltip } from "@/components/shared/action-tooltip";
import { toast } from "sonner";
import { ArrowRight, Clock, FileText, Copy, Bot, Save, Eye, Mail } from "lucide-react";
import type { ProjectStatus, InvoiceStatus, TicketPriority, Activity } from "@/types";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info", DESIGN: "ember", PROPOSAL: "warning", APPROVAL: "warning",
  DEVELOPMENT: "ember", TESTING: "warning", DEPLOYMENT: "warning", LAUNCHED: "success", SUPPORT: "default",
};
const invoiceStatusVariant: Record<InvoiceStatus, "default" | "info" | "success" | "destructive" | "warning"> = {
  DRAFT: "default", SENT: "info", PAID: "success", OVERDUE: "destructive", CANCELLED: "warning",
};
const priorityVariant: Record<TicketPriority, "default" | "info" | "warning" | "destructive"> = {
  LOW: "default", MEDIUM: "info", HIGH: "warning", URGENT: "destructive",
};

interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  budget?: number;
  startDate?: string;
  deadline?: string;
  client?: { company: string };
  invoices: Array<{ id: string; description?: string; amount: number; status: string; dueDate?: string }>;
  tickets: Array<{ id: string; subject: string; priority: string; status: string; createdAt: string }>;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  // Proposal generation state
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalSaving, setProposalSaving] = useState(false);

  // Approval state
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean | null>(null);
  const [approvalPreviewOpen, setApprovalPreviewOpen] = useState(false);
  const [approvalPreviewHtml, setApprovalPreviewHtml] = useState("");
  const [approvalSending, setApprovalSending] = useState(false);
  const [proposalNotes, setProposalNotes] = useState<Array<{ id: string; content: string }>>([]);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        setProject(await res.json());
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [id]);

  const fetchActivities = useCallback(async () => {
    const res = await fetch(`/api/activities?entityType=project&entityId=${id}`);
    if (res.ok) setActivities(await res.json());
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchActivities();
    // Fetch email config for approval banner
    fetch("/api/email/config").then(r => r.json()).then(c => setAutoSendEnabled(c.autoApprovalEmail)).catch(() => {});
  }, [fetchProject, fetchActivities]);

  // Fetch proposal notes when at APPROVAL stage
  useEffect(() => {
    if (project && ["APPROVAL", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCHED", "SUPPORT"].includes(project.status)) {
      fetch(`/api/projects/${id}/stage-notes?stage=PROPOSAL`)
        .then(r => r.json())
        .then(setProposalNotes)
        .catch(() => {});
    }
  }, [project?.status, id]);

  async function handleStageClick(newStatus: ProjectStatus) {
    const res = await fetch(`/api/projects/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      setProject(data);
      fetchActivities();
      toast.success(`Moved to ${newStatus.toLowerCase().replace("_", " ")}`);
    } else {
      toast.error(data.error);
    }
  }

  async function copyProposalPrompt() {
    const res = await fetch(`/api/projects/${id}/proposal-prompt`);
    if (!res.ok) { toast.error("Failed to generate prompt"); return; }
    const { prompt } = await res.json();
    await navigator.clipboard.writeText(prompt);
    toast.success("Proposal prompt copied — paste into Claude or ChatGPT");
  }

  async function generateViaAthena() {
    setProposalLoading(true);
    setProposalContent("");
    setProposalOpen(true);
    try {
      const promptRes = await fetch(`/api/projects/${id}/proposal-prompt`);
      if (!promptRes.ok) { toast.error("Failed to gather data"); setProposalOpen(false); return; }
      const { prompt } = await promptRes.json();

      const chatRes = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!chatRes.ok || !chatRes.body) {
        toast.error("Athena failed to generate proposal");
        setProposalOpen(false);
        return;
      }

      // Stream the response
      const reader = chatRes.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setProposalContent(full);
      }
    } finally {
      setProposalLoading(false);
    }
  }

  async function saveProposalAsNote() {
    if (!proposalContent) return;
    setProposalSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}/stage-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "PROPOSAL", content: proposalContent }),
      });
      if (res.ok) {
        toast.success("Proposal saved as stage note");
        setProposalOpen(false);
      } else {
        toast.error("Failed to save note");
      }
    } finally {
      setProposalSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Failed to load project.</p>
        <div className="flex gap-2">
          <button type="button" onClick={fetchProject} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Retry
          </button>
          <a href="/projects" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">{project.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {project.client?.company} &middot; {project.description}
          </p>
        </div>
        <StatusBadge label={project.status} variant={statusVariant[project.status]} dot />
      </div>

      {project.status === "APPROVAL" && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <Clock className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-400">Awaiting Client Approval</p>
            <p className="text-xs text-amber-400/70">
              {autoSendEnabled
                ? "The client has been notified and can approve from their portal. You can also advance manually."
                : "Auto-notification is off. Preview and send the approval email manually, or advance via the workflow."}
            </p>
          </div>
          {autoSendEnabled === false && (
            <div className="flex gap-2 shrink-0">
              <ActionTooltip label="Preview approval email">
                <Button variant="outline" size="sm" onClick={async () => {
                  const res = await fetch(`/api/projects/${id}/approval-preview`);
                  if (res.ok) {
                    const data = await res.json();
                    setApprovalPreviewHtml(data.html);
                    setApprovalPreviewOpen(true);
                  } else { toast.error("Failed to load preview"); }
                }}>
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
              </ActionTooltip>
              <ActionTooltip label="Send approval request email to client">
                <Button size="sm" disabled={approvalSending} onClick={async () => {
                  setApprovalSending(true);
                  try {
                    const res = await fetch(`/api/projects/${id}/notify-approval`, { method: "POST" });
                    const data = await res.json();
                    if (res.ok) { toast.success(data.message ?? "Approval email sent"); }
                    else { toast.error(data.error ?? "Failed to send"); }
                  } finally { setApprovalSending(false); }
                }}>
                  <Mail className="mr-2 h-3.5 w-3.5" />
                  {approvalSending ? "Sending..." : "Send Notification"}
                </Button>
              </ActionTooltip>
            </div>
          )}
        </div>
      )}

      {project.status === "PROPOSAL" && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Generate Proposal</p>
            <p className="text-xs text-muted-foreground">
              Auto-build a proposal from Discovery &amp; Design data.
            </p>
          </div>
          <ActionTooltip label="Copy prompt to clipboard for Claude/ChatGPT">
            <Button variant="outline" size="sm" onClick={copyProposalPrompt}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy Prompt
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Generate proposal draft via Athena AI">
            <Button size="sm" onClick={generateViaAthena}>
              <Bot className="mr-2 h-3.5 w-3.5" />
              Generate via Athena
            </Button>
          </ActionTooltip>
        </div>
      )}

      {/* Athena Proposal Modal */}
      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              {proposalLoading ? "Generating Proposal..." : "Proposal Draft"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4">
            {proposalContent ? (
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-notes text-sm">
                {proposalContent}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground animate-pulse">
                Athena is writing your proposal...
              </p>
            )}
          </div>
          {!proposalLoading && proposalContent && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(proposalContent);
                toast.success("Proposal copied to clipboard");
              }}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copy
              </Button>
              <Button onClick={saveProposalAsNote} disabled={proposalSaving}>
                <Save className="mr-2 h-3.5 w-3.5" />
                {proposalSaving ? "Saving..." : "Save as Note"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Interactive Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Project Workflow</CardTitle>
          <p className="text-sm text-muted-foreground">Click the next stage to advance, or a previous stage to revert.</p>
        </CardHeader>
        <CardContent>
          <WorkflowTracker
            currentStatus={project.status}
            progress={project.progress}
            onStageClick={handleStageClick}
          />
        </CardContent>
      </Card>

      {/* Show Proposal notes when at APPROVAL stage for easy editing */}
      {["APPROVAL", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCHED", "SUPPORT"].includes(project.status) && proposalNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl text-primary">Proposal Document</CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.status === "APPROVAL"
                ? "Review or edit the proposal before notifying the client. Changes save on blur."
                : "The approved proposal for this project."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposalNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border bg-muted/20 p-4">
                <textarea
                  defaultValue={note.content}
                  title="Proposal note"
                  placeholder="Proposal content..."
                  readOnly={project.status !== "APPROVAL"}
                  className={`w-full min-h-[200px] bg-transparent font-notes text-sm text-foreground outline-none resize-y ${project.status !== "APPROVAL" ? "cursor-default" : ""}`}
                  onBlur={async (e) => {
                    if (project.status === "APPROVAL" && e.target.value !== note.content) {
                      await fetch(`/api/projects/${id}/stage-notes/${note.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: e.target.value }),
                      });
                      toast.success("Proposal note saved");
                    }
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stage Work — Tasks + Notes */}
      <StageWorkPanel projectId={project.id} currentStage={project.status} />

      {/* Approval Email Preview Modal */}
      <Dialog open={approvalPreviewOpen} onOpenChange={setApprovalPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Approval Email Preview
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-border overflow-hidden">
            <iframe
              srcDoc={approvalPreviewHtml}
              title="Approval email preview"
              className="w-full h-[450px] bg-[#0A0A0F]"
              sandbox=""
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Budget</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : "TBD"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Progress</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-medium">{project.progress}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Start Date</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-medium">{project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "—"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Deadline</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-medium">{project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "—"}</p></CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader><CardTitle className="font-display text-xl">Invoices</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {project.invoices.length === 0 && <p className="text-sm text-muted-foreground">No invoices yet.</p>}
          {project.invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <p className="text-sm">{inv.description}</p>
              <div className="flex items-center gap-3">
                <span className="font-medium">${inv.amount.toLocaleString()}</span>
                <StatusBadge label={inv.status} variant={invoiceStatusVariant[inv.status as InvoiceStatus]} dot />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader><CardTitle className="font-display text-xl">Support Tickets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {project.tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets.</p>}
          {project.tickets.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(t.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={t.priority} variant={priorityVariant[t.priority as TicketPriority]} />
                <StatusBadge label={t.status.replace("_", " ")} dot />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
