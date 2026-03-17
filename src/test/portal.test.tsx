import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal",
}));

vi.mock("react-rnd", () => ({
  Rnd: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div className={className}>{children}</div>
  ),
}));

const mockPortalData = {
  client: { company: "Test Co" },
  projects: [
    { id: "1", name: "Test App", description: "A test project", status: "DEVELOPMENT", progress: 45 },
  ],
  invoices: [
    { id: "inv-1", amount: 5000, status: "SENT", description: "Test invoice" },
  ],
  tickets: [
    { id: "t-1", subject: "Bug report", description: "Something broke", status: "OPEN", priority: "HIGH", createdAt: new Date().toISOString() },
  ],
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockPortalData),
  }));
});

// Dynamic imports after mocks
const { default: PortalDashboard } = await import("@/app/(portal)/portal/page");
const { default: PortalTickets } = await import("@/app/(portal)/portal/tickets/page");

describe("Portal Dashboard", () => {
  it("renders summary cards from API", async () => {
    render(<PortalDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Active Projects")).toBeInTheDocument();
      expect(screen.getByText("Pending Invoices")).toBeInTheDocument();
      expect(screen.getByText("Open Tickets")).toBeInTheDocument();
    });
  });

  it("shows projects from API", async () => {
    render(<PortalDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Test App")).toBeInTheDocument();
    });
  });
});

describe("Portal Tickets", () => {
  it("renders tickets from API", async () => {
    render(<PortalTickets />);
    await waitFor(() => {
      expect(screen.getByText("Bug report")).toBeInTheDocument();
    });
  });

  it("shows new ticket form when button is clicked", async () => {
    const user = userEvent.setup();
    render(<PortalTickets />);
    await waitFor(() => screen.getByText("Bug report"));
    await user.click(screen.getByRole("button", { name: /new ticket/i }));
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
  });
});
