import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Gather tasks and notes from Discovery + Design stages
    const [discoveryTasks, designTasks, discoveryNotes, designNotes] =
      await Promise.all([
        db.stageTask.findMany({
          where: { projectId: id, stage: "DISCOVERY" },
          orderBy: { sortOrder: "asc" },
        }),
        db.stageTask.findMany({
          where: { projectId: id, stage: "DESIGN" },
          orderBy: { sortOrder: "asc" },
        }),
        db.stageNote.findMany({
          where: { projectId: id, stage: "DISCOVERY" },
          orderBy: { createdAt: "asc" },
        }),
        db.stageNote.findMany({
          where: { projectId: id, stage: "DESIGN" },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    function formatTasks(tasks: typeof discoveryTasks): string {
      if (tasks.length === 0) return "(no tasks recorded)";
      return tasks
        .map((t) => `- [${t.completed ? "x" : " "}] ${t.title}`)
        .join("\n");
    }

    function formatNotes(notes: typeof discoveryNotes): string {
      if (notes.length === 0) return "(no notes recorded)";
      return notes.map((n) => n.content).join("\n\n");
    }

    const budget = project.budget
      ? `$${project.budget.toLocaleString()}`
      : "Not specified";
    const startDate = project.startDate
      ? project.startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "Not set";
    const deadline = project.deadline
      ? project.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "Not set";

    const prompt = `You are writing a professional project proposal for a SaaS consulting engagement.

Client: ${project.client?.company ?? "Unknown"}
Project: ${project.name}
Description: ${project.description ?? "No description provided"}
Budget: ${budget}
Timeline: ${startDate} to ${deadline}

## Discovery & Planning Findings:

### Tasks completed during discovery:
${formatTasks(discoveryTasks)}

### Discovery notes:
${formatNotes(discoveryNotes)}

## Design & Wireframing Deliverables:

### Design tasks:
${formatTasks(designTasks)}

### Design notes:
${formatNotes(designNotes)}

---

Based on the above discovery and design data, write a professional proposal including:

1. **Executive Summary** — Brief overview of what the client needs and how we'll deliver it
2. **Scope of Work** — Detailed breakdown based on discovery findings
3. **Deliverables** — Specific outputs based on the design work completed
4. **Timeline with Milestones** — Realistic schedule from development through launch
5. **Pricing Breakdown** — Based on the budget, break down costs by phase
6. **Terms & Next Steps** — What happens after approval

Keep it concise, professional, and specific to the data above. Use markdown formatting.`;

    return NextResponse.json({ prompt, projectName: project.name });
  } catch (error) {
    return handleAuthError(error);
  }
}
