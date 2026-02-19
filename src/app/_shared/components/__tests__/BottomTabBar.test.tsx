import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockPathname, mockIsAuthenticated } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => "/matching"),
  mockIsAuthenticated: vi.fn(() => false),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

vi.mock("@/app/_shared/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated(),
    loading: false,
  }),
}));

import { BottomTabBar } from "../BottomTabBar";

describe("BottomTabBar", () => {
  it("renders navigation with tablist role", () => {
    render(<BottomTabBar />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  describe("anonymous user", () => {
    it("shows 3 tabs: 매칭, 대화, 로그인", () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<BottomTabBar />);

      expect(screen.getByLabelText("매칭")).toBeInTheDocument();
      expect(screen.getByLabelText("대화")).toBeInTheDocument();
      expect(screen.getByLabelText("로그인")).toBeInTheDocument();
      expect(screen.queryByLabelText("친구")).not.toBeInTheDocument();
    });

    it("highlights active tab based on pathname", () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockPathname.mockReturnValue("/matching");
      render(<BottomTabBar />);

      expect(screen.getByLabelText("매칭")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(screen.getByLabelText("대화")).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("highlights dialogue tab for nested dialogue routes", () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockPathname.mockReturnValue("/dialogue/session-123");
      render(<BottomTabBar />);

      expect(screen.getByLabelText("대화")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("authenticated user", () => {
    it("shows 4 tabs: 매칭, 대화, 친구, 더보기", () => {
      mockIsAuthenticated.mockReturnValue(true);
      render(<BottomTabBar />);

      expect(screen.getByLabelText("매칭")).toBeInTheDocument();
      expect(screen.getByLabelText("대화")).toBeInTheDocument();
      expect(screen.getByLabelText("친구")).toBeInTheDocument();
      expect(screen.getByLabelText("더보기")).toBeInTheDocument();
      expect(screen.queryByLabelText("로그인")).not.toBeInTheDocument();
    });

    it("highlights friends tab on /friends", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockPathname.mockReturnValue("/friends");
      render(<BottomTabBar />);

      expect(screen.getByLabelText("친구")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("highlights 더보기 tab on /safety routes", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockPathname.mockReturnValue("/safety/report");
      render(<BottomTabBar />);

      expect(screen.getByLabelText("더보기")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("highlights 더보기 tab on /offline routes", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockPathname.mockReturnValue("/offline");
      render(<BottomTabBar />);

      expect(screen.getByLabelText("더보기")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  it("renders correct hrefs for tabs", () => {
    mockIsAuthenticated.mockReturnValue(false);
    render(<BottomTabBar />);

    expect(screen.getByLabelText("매칭")).toHaveAttribute("href", "/matching");
    expect(screen.getByLabelText("대화")).toHaveAttribute("href", "/dialogue");
  });
});
