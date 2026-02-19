import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NextStepHub } from "../components/NextStepHub";
import type { NextStepResult } from "@/domain/value-objects/next-step-action";

const mockActions: NextStepResult = {
  primary: {
    id: "find-match",
    label: "대화 상대 찾기",
    href: "/matching",
  },
  secondary: [
    {
      id: "precision-upgrade",
      label: "정밀도 올리기",
      href: "/onboarding?upgrade=true",
      estimatedMinutes: 2,
    },
    {
      id: "ai-analysis",
      label: "AI 심층 분석",
      href: "/onboarding/result?analysis=deep",
      estimatedMinutes: 7,
    },
  ],
};

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { vi } from "vitest";

describe("NextStepHub", () => {
  it("renders primary CTA prominently", () => {
    render(<NextStepHub actions={mockActions} />);

    expect(screen.getByText(/대화 상대 찾기/)).toBeInTheDocument();
  });

  it("primary CTA links to matching", () => {
    render(<NextStepHub actions={mockActions} />);

    const primaryLink = screen.getByRole("link", { name: /대화 상대 찾기/ });
    expect(primaryLink).toHaveAttribute("href", "/matching");
  });

  it("renders secondary CTAs", () => {
    render(<NextStepHub actions={mockActions} />);

    expect(screen.getByText(/정밀도 올리기/)).toBeInTheDocument();
    expect(screen.getByText(/AI 심층 분석/)).toBeInTheDocument();
  });

  it("shows estimated time for secondary actions", () => {
    render(<NextStepHub actions={mockActions} />);

    expect(screen.getByText(/2분/)).toBeInTheDocument();
    expect(screen.getByText(/7분/)).toBeInTheDocument();
  });

  it("renders without secondary actions", () => {
    const actionsNoSecondary: NextStepResult = {
      primary: mockActions.primary,
      secondary: [],
    };

    render(<NextStepHub actions={actionsNoSecondary} />);

    expect(screen.getByText(/대화 상대 찾기/)).toBeInTheDocument();
  });
});
