import { ProjectsTable } from "@/components/admin/projects/projects-table";
import { mockProjects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">Projects</h1>
        <p className="mt-1 text-muted-foreground">
          All active and completed SaaS projects.
        </p>
      </div>

      <ProjectsTable projects={mockProjects} />
    </div>
  );
}
