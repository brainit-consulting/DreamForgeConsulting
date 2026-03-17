import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeadsTable } from "@/components/admin/leads/leads-table";
import { LeadPipeline } from "@/components/admin/leads/lead-pipeline";
import { ClientsTable } from "@/components/admin/clients/clients-table";
import { mockLeads, mockClients } from "@/lib/mock-data";
import type { LeadStatus } from "@/types";

// Mock next/navigation for Link components
vi.mock("next/navigation", () => ({
  usePathname: () => "/clients",
}));

describe("LeadsTable", () => {
  it("renders all leads in the table", () => {
    render(<LeadsTable leads={mockLeads} />);
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Marcus Rivera")).toBeInTheDocument();
    expect(screen.getByText("Aisha Patel")).toBeInTheDocument();
  });

  it("displays lead status badges", () => {
    render(<LeadsTable leads={mockLeads} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByText("CONTACTED")).toBeInTheDocument();
    expect(screen.getByText("QUALIFIED")).toBeInTheDocument();
  });

  it("shows lead values formatted as currency", () => {
    render(<LeadsTable leads={mockLeads} />);
    expect(screen.getByText("$15,000")).toBeInTheDocument();
    expect(screen.getByText("$42,000")).toBeInTheDocument();
  });
});

describe("LeadPipeline", () => {
  it("renders all pipeline stages", () => {
    const counts: Record<LeadStatus, number> = {
      NEW: 1,
      CONTACTED: 1,
      QUALIFIED: 1,
      PROPOSAL: 1,
      CONVERTED: 1,
      LOST: 1,
    };
    render(<LeadPipeline counts={counts} />);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Contacted")).toBeInTheDocument();
    expect(screen.getByText("Qualified")).toBeInTheDocument();
    expect(screen.getByText("Converted")).toBeInTheDocument();
  });
});

describe("ClientsTable", () => {
  it("renders client companies", () => {
    render(
      <ClientsTable
        clients={mockClients}
        projectCounts={{ "client-1": 1, "client-4": 2 }}
      />
    );
    expect(screen.getByText("DataStream AI")).toBeInTheDocument();
    expect(screen.getByText("NovaPay Solutions")).toBeInTheDocument();
    expect(screen.getByText("MediTrack Health")).toBeInTheDocument();
  });

  it("shows project counts", () => {
    render(
      <ClientsTable
        clients={mockClients}
        projectCounts={{ "client-4": 2 }}
      />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
