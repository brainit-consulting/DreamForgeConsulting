import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { HelpButton } from "@/components/shared/help-modal";
import { mockProjects, mockInvoices, mockTickets } from "@/lib/mock-data";
import type { ProjectStatus, InvoiceStatus, TicketStatus } from "@/types";
import { FolderKanban, Receipt, TicketCheck } from "lucide-react";

const statusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
  DISCOVERY: "info",
  DESIGN: "ember",
  DEVELOPMENT: "ember",
  TESTING: "warning",
  DEPLOYMENT: "warning",
  LAUNCHED: "success",
  SUPPORT: "default",
};

// Simulating a logged-in client (client-3: UrbanPulse)
const CLIENT_ID = "client-3";

export default function PortalDashboardPage() {
  const projects = mockProjects.filter((p) => p.clientId === CLIENT_ID);
  const invoices = mockInvoices.filter((i) => i.clientId === CLIENT_ID);
  const tickets = mockTickets.filter((t) => t.clientId === CLIENT_ID);
  const pendingInvoices = invoices.filter(
    (i) => i.status === "SENT" || i.status === "OVERDUE"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your projects and account.
          </p>
        </div>
        <HelpButton sectionKey="portal" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Pending Invoices
            </CardTitle>
            <Receipt className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl">{pendingInvoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Open Tickets
            </CardTitle>
            <TicketCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl">
              {tickets.filter((t) => t.status === "OPEN").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Your Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  {project.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={project.progress} className="w-24" />
                <span className="text-xs text-muted-foreground w-8">
                  {project.progress}%
                </span>
                <StatusBadge
                  label={project.status}
                  variant={statusVariant[project.status]}
                  dot
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
