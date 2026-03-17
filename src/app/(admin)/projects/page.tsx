import { ProjectsTable } from "@/components/admin/projects/projects-table";
import { HelpButton } from "@/components/shared/help-modal";
import { mockProjects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            All active and completed SaaS projects.
          </p>
        </div>
        <HelpButton sectionKey="projects" />
      </div>

      <ProjectsTable projects={mockProjects} />
    </div>
  );
}
