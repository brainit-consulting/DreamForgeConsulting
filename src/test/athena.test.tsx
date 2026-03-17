import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AthenaChat } from "@/components/shared/athena-chat";

// Mock @ai-sdk/react
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  }),
}));

// Mock react-rnd
vi.mock("react-rnd", () => ({
  Rnd: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="rnd-container" className={className}>
      {children}
    </div>
  ),
}));

describe("AthenaChat", () => {
  it("renders the floating action button when closed", () => {
    render(<AthenaChat />);
    expect(
      screen.getByRole("button", { name: /open athena/i })
    ).toBeInTheDocument();
  });

  it("opens chat panel when FAB is clicked", async () => {
    const user = userEvent.setup();
    render(<AthenaChat />);

    await user.click(
      screen.getByRole("button", { name: /open athena/i })
    );
    expect(screen.getByText("Athena")).toBeInTheDocument();
    expect(screen.getByText(/AI Assistant/)).toBeInTheDocument();
    expect(
      screen.getByText(/I'm Athena, your DreamForge assistant/)
    ).toBeInTheDocument();
  });

  it("shows input field in chat panel", async () => {
    const user = userEvent.setup();
    render(<AthenaChat />);

    await user.click(
      screen.getByRole("button", { name: /open athena/i })
    );
    expect(
      screen.getByPlaceholderText(/ask athena anything/i)
    ).toBeInTheDocument();
  });

  it("can be closed after opening", async () => {
    const user = userEvent.setup();
    render(<AthenaChat />);

    await user.click(
      screen.getByRole("button", { name: /open athena/i })
    );
    expect(screen.getByText("Athena")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /close athena/i })
    );
    expect(screen.queryByText("Athena")).not.toBeInTheDocument();
  });
});
