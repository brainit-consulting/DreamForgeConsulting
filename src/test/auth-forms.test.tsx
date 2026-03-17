import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock auth client
vi.mock("@/lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => ({ data: null }),
}));

// Dynamically import after mocks
const { default: LoginPage } = await import("@/app/(auth)/login/page");
const { default: RegisterPage } = await import("@/app/(auth)/register/page");

describe("Login Page", () => {
  it("renders login form with email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("has a link to register page", () => {
    render(<LoginPage />);
    expect(screen.getByText(/create one/i)).toBeInTheDocument();
  });

  it("renders the DreamForge logo", () => {
    render(<LoginPage />);
    expect(screen.getByText("DreamForge")).toBeInTheDocument();
  });
});

describe("Register Page", () => {
  it("renders register form with name, email, and password fields", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("has a link to login page", () => {
    render(<RegisterPage />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});
