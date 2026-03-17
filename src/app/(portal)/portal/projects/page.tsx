import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import { mockProjects } from "@/lib/mock-data";

const CLIENT_ID = "client-3";

export default function PortalProjectsPage() {
  const projects = mockProjects.filter((p) => p.clientId === CLIENT_ID);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display">My Projects</h1>
        <p className="mt-1 text-muted-foreground">
          View the status and progress of your active projects.
        </p>
      </div>

      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </CardHeader>
          <CardContent>
            <WorkflowTracker
              currentStatus={project.status}
              progress={project.progress}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
