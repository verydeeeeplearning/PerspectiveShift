import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TurnSubmissionForm } from "../TurnSubmissionForm";

vi.mock("@/app/_shared/hooks/useInactivityTimer", () => ({
  useInactivityTimer: vi.fn(() => false),
}));

describe("TurnSubmissionForm", () => {
  it("shows step-specific examples carousel", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TurnSubmissionForm currentStep="POSITION" onSubmit={onSubmit} />);

    expect(screen.getByText(/예시 1\/3/)).toBeInTheDocument();
  });

  it("cycles through examples with next/prev buttons", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TurnSubmissionForm currentStep="QUESTION" onSubmit={onSubmit} />);

    expect(screen.getByText(/예시 1\/3/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("다음 예시"));
    expect(screen.getByText(/예시 2\/3/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("이전 예시"));
    expect(screen.getByText(/예시 1\/3/)).toBeInTheDocument();
  });

  it("has a Coach button", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TurnSubmissionForm currentStep="POSITION" onSubmit={onSubmit} />);

    expect(screen.getByText("Coach")).toBeInTheDocument();
  });
});
