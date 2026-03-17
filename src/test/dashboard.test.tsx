import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { ProjectOverview } from "@/components/admin/dashboard/project-overview";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";

// Mock recharts to avoid canvas issues in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe("KpiCards", () => {
  it("renders all 4 KPI cards", () => {
    render(<KpiCards />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("New Leads")).toBeInTheDocument();
    expect(screen.getByText("Active Clients")).toBeInTheDocument();
  });

  it("displays revenue value", () => {
    render(<KpiCards />);
    expect(screen.getByText("$194,000")).toBeInTheDocument();
  });
});

describe("ProjectOverview", () => {
  it("renders active projects with progress bars", () => {
    render(<ProjectOverview />);
    expect(screen.getByText("DataStream Dashboard")).toBeInTheDocument();
    expect(screen.getByText("NovaPay Merchant Portal")).toBeInTheDocument();
    expect(screen.getByText("UrbanPulse Mobile App")).toBeInTheDocument();
  });

  it("shows project progress percentages", () => {
    render(<ProjectOverview />);
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });
});

describe("ActivityFeed", () => {
  it("renders activity items", () => {
    render(<ActivityFeed />);
    expect(
      screen.getByText(/DataStream Dashboard moved to Development/)
    ).toBeInTheDocument();
    expect(screen.getByText(/NovaPay paid invoice/)).toBeInTheDocument();
  });
});
