import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfidenceSelector } from "../components/ConfidenceSelector";

describe("ConfidenceSelector", () => {
  it("renders all 6 dimension labels", () => {
    render(
      <ConfidenceSelector onSubmit={vi.fn()} onSkip={vi.fn()} />,
    );

    const labels = [
      "기술 규제", "소득 재분배", "일·생활 균형",
      "능력주의", "기술 낙관", "기회 균등",
    ];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("renders the instruction text", () => {
    render(
      <ConfidenceSelector onSubmit={vi.fn()} onSkip={vi.fn()} />,
    );

    expect(
      screen.getByText("아래 주제 중 당신의 생각이 가장 확고한 주제는?"),
    ).toBeDefined();
  });

  it("toggles dimension selection", () => {
    render(
      <ConfidenceSelector onSubmit={vi.fn()} onSkip={vi.fn()} />,
    );

    const button = screen.getByText("기술 규제");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("calls onSubmit with selected dimensions", () => {
    const onSubmit = vi.fn();
    render(
      <ConfidenceSelector onSubmit={onSubmit} onSkip={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("기술 규제"));
    fireEvent.click(screen.getByText("능력주의"));
    fireEvent.click(screen.getByText("다음"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining(["TECH_REGULATION", "MERITOCRACY"]),
    );
  });

  it("calls onSkip when skip is clicked", () => {
    const onSkip = vi.fn();
    render(
      <ConfidenceSelector onSubmit={vi.fn()} onSkip={onSkip} />,
    );

    fireEvent.click(screen.getByText("건너뛰기"));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
