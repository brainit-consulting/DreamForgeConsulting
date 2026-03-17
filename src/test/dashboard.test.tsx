import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { ProjectOverview } from "@/components/admin/dashboard/project-overview";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const mockStats = {
  totalRevenue: 105000,
  revenueChange: "+12.5%",
  activeProjects: 4,
  newLeads: 5,
  activeClients: 4,
};

describe("KpiCards", () => {
  it("renders all 4 KPI cards with real data", () => {
    render(<KpiCards stats={mockStats} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("New Leads")).toBeInTheDocument();
    expect(screen.getByText("Active Clients")).toBeInTheDocument();
  });

  it("displays revenue value", () => {
    render(<KpiCards stats={mockStats} />);
    expect(screen.getByText("$105,000")).toBeInTheDocument();
  });

  it("shows loading skeletons when stats is null", () => {
    const { container } = render(<KpiCards stats={null} />);
    expect(container.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });
});

describe("ProjectOverview", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve([
        { id: "1", name: "Test Project", status: "DEVELOPMENT", progress: 45, client: { company: "Test Co" } },
      ]),
    }));
  });

  it("renders projects from API", async () => {
    render(<ProjectOverview />);
    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });
  });
});

describe("ActivityFeed", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve([
        { id: "1", type: "stage_transition", description: "Project moved to Design", createdAt: new Date().toISOString() },
      ]),
    }));
  });

  it("renders activities from API", async () => {
    render(<ActivityFeed />);
    await waitFor(() => {
      expect(screen.getByText("Project moved to Design")).toBeInTheDocument();
    });
  });
});
