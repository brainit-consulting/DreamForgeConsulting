import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/shared/logo";

describe("Logo", () => {
  it("renders full logo with image and text", () => {
    render(<Logo />);
    expect(screen.getByAltText("DreamForge Consulting")).toBeInTheDocument();
    expect(screen.getByText("DreamForge")).toBeInTheDocument();
    expect(screen.getByText("Consulting")).toBeInTheDocument();
  });

  it("renders collapsed logo with image but no text", () => {
    render(<Logo collapsed />);
    expect(screen.getByAltText("DreamForge Consulting")).toBeInTheDocument();
    expect(screen.queryByText("DreamForge")).not.toBeInTheDocument();
  });
});
