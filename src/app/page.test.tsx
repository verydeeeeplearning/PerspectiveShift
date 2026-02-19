import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/app/_shared/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    session: null,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import Home from "./page";

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /새로운 관점을/i }),
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Home />);
    expect(screen.getByText(/안전하고 구조화된 대화를 통해/)).toBeInTheDocument();
  });

  it("renders CTA button for onboarding", () => {
    render(<Home />);
    expect(screen.getByText("생각 발견 시작하기")).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<Home />);
    expect(screen.getByText("로그인")).toBeInTheDocument();
  });
});
