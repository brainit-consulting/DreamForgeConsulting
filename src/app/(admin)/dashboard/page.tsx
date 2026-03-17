import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";
import { ProjectOverview } from "@/components/admin/dashboard/project-overview";
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your command center for everything DreamForge.
        </p>
      </div>

      <KpiCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <ActivityFeed />
      </div>

      <ProjectOverview />
    </div>
  );
}
