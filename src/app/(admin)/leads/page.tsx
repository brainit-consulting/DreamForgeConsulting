import { LeadPipeline } from "@/components/admin/leads/lead-pipeline";
import { LeadsTable } from "@/components/admin/leads/leads-table";
import { HelpButton } from "@/components/shared/help-modal";
import { mockLeads } from "@/lib/mock-data";
import type { LeadStatus } from "@/types";

export default function LeadsPage() {
  const counts = mockLeads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<LeadStatus, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage your sales pipeline.
          </p>
        </div>
        <HelpButton sectionKey="leads" />
      </div>

      <LeadPipeline counts={counts} />
      <LeadsTable leads={mockLeads} />
    </div>
  );
}
