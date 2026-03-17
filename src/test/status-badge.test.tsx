import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders with label text", () => {
    render(<StatusBadge label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with dot indicator", () => {
    const { container } = render(
      <StatusBadge label="In Progress" variant="ember" dot />
    );
    const dot = container.querySelector(".rounded-full");
    expect(dot).toBeInTheDocument();
  });

  it("applies variant styles", () => {
    render(<StatusBadge label="Success" variant="success" />);
    const badge = screen.getByText("Success").closest("[data-slot='badge']");
    expect(badge?.className).toContain("emerald");
  });
});
