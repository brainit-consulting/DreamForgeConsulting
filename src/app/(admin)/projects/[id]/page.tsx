import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import { mockProjects, mockClients, mockInvoices, mockTickets } from "@/lib/mock-data";
import type { ProjectStatus, InvoiceStatus, TicketPriority } from "@/types";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info",
  DESIGN: "ember",
  DEVELOPMENT: "ember",
  TESTING: "warning",
  DEPLOYMENT: "warning",
  LAUNCHED: "success",
  SUPPORT: "default",
};

const invoiceStatusVariant: Record<InvoiceStatus, "default" | "info" | "success" | "destructive" | "warning"> = {
  DRAFT: "default",
  SENT: "info",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "warning",
};

const priorityVariant: Record<TicketPriority, "default" | "info" | "warning" | "destructive"> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "destructive",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);
  if (!project) notFound();

  const client = mockClients.find((c) => c.id === project.clientId);
  const invoices = mockInvoices.filter((i) => i.projectId === id);
  const tickets = mockTickets.filter((t) => t.projectId === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">{project.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {client?.company} &middot; {project.description}
          </p>
        </div>
        <StatusBadge
          label={project.status}
          variant={statusVariant[project.status]}
          dot
        />
      </div>

      {/* Workflow Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Project Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowTracker
            currentStatus={project.status}
            progress={project.progress}
          />
        </CardContent>
      </Card>

      {/* Project details grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {project.budget ? `$${project.budget.toLocaleString()}` : "TBD"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">{project.progress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {project.startDate ? format(project.startDate, "MMM d, yyyy") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {project.deadline ? format(project.deadline, "MMM d, yyyy") : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          )}
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <p className="text-sm">{invoice.description}</p>
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  ${invoice.amount.toLocaleString()}
                </span>
                <StatusBadge
                  label={invoice.status}
                  variant={invoiceStatusVariant[invoice.status]}
                  dot
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Support Tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tickets.length === 0 && (
            <p className="text-sm text-muted-foreground">No tickets.</p>
          )}
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {format(ticket.createdAt, "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={ticket.priority}
                  variant={priorityVariant[ticket.priority]}
                />
                <StatusBadge label={ticket.status.replace("_", " ")} dot />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
