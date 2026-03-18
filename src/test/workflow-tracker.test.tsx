import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkflowTracker } from "@/components/shared/workflow-tracker";
import { ProjectsTable } from "@/components/admin/projects/projects-table";
import { mockProjects } from "@/lib/mock-data";

// Mock next/navigation for Link
vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
}));

describe("WorkflowTracker", () => {
  it("renders all 9 workflow stages", () => {
    render(
      <WorkflowTracker currentStatus="DEVELOPMENT" progress={50} />
    );
    expect(screen.getByText("Discovery & Planning")).toBeInTheDocument();
    expect(screen.getByText("Design & Wireframing")).toBeInTheDocument();
    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText("Client Approval")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Testing & QA")).toBeInTheDocument();
    expect(screen.getByText("Deployment & Launch")).toBeInTheDocument();
    expect(screen.getByText("Launched")).toBeInTheDocument();
    expect(screen.getByText("Post-Launch Support")).toBeInTheDocument();
  });

  it("shows progress on the active stage", () => {
    render(
      <WorkflowTracker currentStatus="DEVELOPMENT" progress={45} />
    );
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("applies ember-pulse class to active stage", () => {
    const { container } = render(
      <WorkflowTracker currentStatus="TESTING" progress={78} />
    );
    const pulseElements = container.querySelectorAll(".ember-pulse");
    expect(pulseElements.length).toBe(1);
  });

  it("marks earlier stages as completed (emerald)", () => {
    const { container } = render(
      <WorkflowTracker currentStatus="TESTING" progress={78} />
    );
    const emeraldNodes = container.querySelectorAll(".border-emerald-500");
    // DISCOVERY, DESIGN, PROPOSAL, APPROVAL, DEVELOPMENT = 5 completed stages
    expect(emeraldNodes.length).toBe(5);
  });
});

describe("ProjectsTable", () => {
  it("renders all projects", () => {
    render(<ProjectsTable projects={mockProjects} />);
    expect(screen.getByText("DataStream Dashboard")).toBeInTheDocument();
    expect(screen.getByText("NovaPay Merchant Portal")).toBeInTheDocument();
    expect(screen.getByText("UrbanPulse Mobile App")).toBeInTheDocument();
  });

  it("shows project budgets", () => {
    render(<ProjectsTable projects={mockProjects} />);
    expect(screen.getByText("$35,000")).toBeInTheDocument();
    expect(screen.getByText("$48,000")).toBeInTheDocument();
  });
});
