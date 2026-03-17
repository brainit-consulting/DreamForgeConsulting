import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/shared/logo";

describe("Logo", () => {
  it("renders full logo with text", () => {
    render(<Logo />);
    expect(screen.getByText("DreamForge")).toBeInTheDocument();
    expect(screen.getByText("Consulting")).toBeInTheDocument();
  });

  it("renders collapsed logo without text", () => {
    render(<Logo collapsed />);
    expect(screen.queryByText("DreamForge")).not.toBeInTheDocument();
  });
});
