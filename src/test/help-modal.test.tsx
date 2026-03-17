import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelpProvider, HelpButton } from "@/components/shared/help-modal";

vi.mock("react-rnd", () => ({
  Rnd: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="rnd-container" className={className}>
      {children}
    </div>
  ),
}));

describe("HelpModal", () => {
  it("renders help button", () => {
    render(
      <HelpProvider>
        <HelpButton sectionKey="dashboard" />
      </HelpProvider>
    );
    expect(
      screen.getByRole("button", { name: /help for dashboard/i })
    ).toBeInTheDocument();
  });

  it("opens modal when help button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HelpProvider>
        <HelpButton sectionKey="dashboard" />
      </HelpProvider>
    );
    await user.click(
      screen.getByRole("button", { name: /help for dashboard/i })
    );
    expect(screen.getByText(/Dashboard.*Command Center/)).toBeInTheDocument();
    expect(screen.getByText("Tips")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HelpProvider>
        <HelpButton sectionKey="dashboard" />
      </HelpProvider>
    );
    await user.click(
      screen.getByRole("button", { name: /help for dashboard/i })
    );
    expect(screen.getByText(/Dashboard.*Command Center/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close help/i }));
    expect(screen.queryByText(/Dashboard.*Command Center/)).not.toBeInTheDocument();
  });

  it("displays context-specific content for different sections", async () => {
    const user = userEvent.setup();
    render(
      <HelpProvider>
        <HelpButton sectionKey="leads" />
      </HelpProvider>
    );
    await user.click(
      screen.getByRole("button", { name: /help for leads/i })
    );
    expect(screen.getByText(/Leads.*Sales Pipeline/)).toBeInTheDocument();
    expect(screen.getByText(/Leads are potential clients/i)).toBeInTheDocument();
  });
});
