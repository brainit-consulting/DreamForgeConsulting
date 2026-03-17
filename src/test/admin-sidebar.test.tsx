import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
  }),
}));

describe("AdminSidebar", () => {
  it("renders all navigation items", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders the DreamForge logo", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("Dream")).toBeInTheDocument();
  });

  it("highlights the active nav item", () => {
    render(<AdminSidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("primary");
  });
});
