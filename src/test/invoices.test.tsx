import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvoicesTable } from "@/components/admin/invoices/invoices-table";
import { InvoiceStats } from "@/components/admin/invoices/invoice-stats";
import { mockInvoices } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/invoices",
}));

describe("InvoicesTable", () => {
  it("renders all invoices", () => {
    render(<InvoicesTable invoices={mockInvoices} />);
    expect(screen.getAllByText(/DataStream Dashboard/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NovaPay Merchant Portal/).length).toBeGreaterThan(0);
  });

  it("filters invoices by status", () => {
    render(<InvoicesTable invoices={mockInvoices} filter="PAID" />);
    const rows = screen.getAllByText("PAID");
    expect(rows.length).toBeGreaterThan(0);
    expect(screen.queryByText("DRAFT")).not.toBeInTheDocument();
  });

  it("shows empty state when no matches", () => {
    render(<InvoicesTable invoices={mockInvoices} filter="CANCELLED" />);
    expect(screen.getByText("No invoices found.")).toBeInTheDocument();
  });
});

describe("InvoiceStats", () => {
  it("renders all stat cards", () => {
    render(<InvoiceStats invoices={mockInvoices} />);
    expect(screen.getByText("Collected")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  it("calculates collected revenue correctly", () => {
    render(<InvoiceStats invoices={mockInvoices} />);
    // PAID invoices: $16,000 + $24,000 + $65,000 = $105,000
    expect(screen.getByText("$105,000")).toBeInTheDocument();
  });
});
