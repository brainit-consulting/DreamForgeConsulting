import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { mockClients, mockProjects, mockInvoices } from "@/lib/mock-data";
import type { ProjectStatus, InvoiceStatus } from "@/types";

const projectStatusVariant: Record<ProjectStatus, "info" | "ember" | "warning" | "success" | "default"> = {
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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = mockClients.find((c) => c.id === id);
  if (!client) notFound();

  const projects = mockProjects.filter((p) => p.clientId === id);
  const invoices = mockInvoices.filter((i) => i.clientId === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">{client.company}</h1>
        <p className="mt-1 text-muted-foreground">{client.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{client.phone ?? "Not provided"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Client Since</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{format(client.createdAt, "MMMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{projects.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
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
                <StatusBadge
                  label={project.status}
                  variant={projectStatusVariant[project.status]}
                  dot
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {invoice.description ?? `Invoice ${invoice.id}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.dueDate
                    ? `Due ${format(invoice.dueDate, "MMM d, yyyy")}`
                    : "No due date"}
                </p>
              </div>
              <div className="flex items-center gap-4">
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
    </div>
  );
}
