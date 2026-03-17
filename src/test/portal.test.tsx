import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PortalDashboard from "@/app/(portal)/portal/page";
import PortalTickets from "@/app/(portal)/portal/tickets/page";
import { HelpProvider } from "@/components/shared/help-modal";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal",
}));

// Mock react-rnd
vi.mock("react-rnd", () => ({
  Rnd: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("Portal Dashboard", () => {
  it("renders summary cards", () => {
    render(
      <HelpProvider>
        <PortalDashboard />
      </HelpProvider>
    );
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("Pending Invoices")).toBeInTheDocument();
    expect(screen.getByText("Open Tickets")).toBeInTheDocument();
  });

  it("shows UrbanPulse projects (client-3 mock)", () => {
    render(
      <HelpProvider>
        <PortalDashboard />
      </HelpProvider>
    );
    expect(screen.getByText("UrbanPulse Mobile App")).toBeInTheDocument();
  });
});

describe("Portal Tickets", () => {
  it("renders existing tickets", () => {
    render(<PortalTickets />);
    expect(
      screen.getByText("Map markers not loading on iOS Safari")
    ).toBeInTheDocument();
  });

  it("shows new ticket form when button is clicked", async () => {
    const user = userEvent.setup();
    render(<PortalTickets />);

    await user.click(screen.getByRole("button", { name: /new ticket/i }));
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("validates ticket form requires subject and description", async () => {
    const user = userEvent.setup();
    render(<PortalTickets />);

    await user.click(screen.getByRole("button", { name: /new ticket/i }));
    const subjectInput = screen.getByLabelText(/subject/i);
    expect(subjectInput).toBeRequired();
  });
});
