import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock auth client
vi.mock("@/lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => ({ data: null }),
}));

const { default: LoginPage } = await import("@/app/(auth)/login/page");

describe("Login Page", () => {
  it("renders login form with email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows invite-only message instead of register link", () => {
    render(<LoginPage />);
    expect(screen.getByText(/invitation only/i)).toBeInTheDocument();
  });

  it("renders the DreamForge logo", () => {
    render(<LoginPage />);
    expect(screen.getByText("Dream")).toBeInTheDocument();
  });
});
