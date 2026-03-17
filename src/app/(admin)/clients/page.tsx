import { ClientsTable } from "@/components/admin/clients/clients-table";
import { mockClients, mockProjects } from "@/lib/mock-data";

export default function ClientsPage() {
  const projectCounts = mockProjects.reduce(
    (acc, p) => {
      acc[p.clientId] = (acc[p.clientId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Clients</h1>
        <p className="mt-1 text-muted-foreground">
          Your active client roster and history.
        </p>
      </div>

      <ClientsTable clients={mockClients} projectCounts={projectCounts} />
    </div>
  );
}
