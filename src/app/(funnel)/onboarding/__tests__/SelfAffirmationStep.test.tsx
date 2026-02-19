import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelfAffirmationStep } from "../components/SelfAffirmationStep";

describe("SelfAffirmationStep", () => {
  it("renders 8 value buttons", () => {
    render(
      <SelfAffirmationStep onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    const labels = ["공정", "자유", "배려", "성취", "안전", "진실", "책임", "성장"];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("renders skip button", () => {
    render(
      <SelfAffirmationStep onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    expect(screen.getByText("건너뛰기 →")).toBeDefined();
  });

  it("calls onSkip when skip is clicked", () => {
    const onSkip = vi.fn();
    render(
      <SelfAffirmationStep onComplete={vi.fn()} onSkip={onSkip} />,
    );

    fireEvent.click(screen.getByText("건너뛰기 →"));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("transitions to experience step after value selection", () => {
    render(
      <SelfAffirmationStep onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("공정"));

    // Experience step should now show
    expect(screen.getByText(/에 대한 경험이 있나요/)).toBeDefined();
    expect(screen.getByLabelText("경험 입력")).toBeDefined();
  });

  it("calls onComplete with value and experience when submitted", () => {
    const onComplete = vi.fn();
    render(
      <SelfAffirmationStep onComplete={onComplete} onSkip={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("배려"));
    fireEvent.change(screen.getByLabelText("경험 입력"), {
      target: { value: "팀원을 도운 경험" },
    });
    fireEvent.click(screen.getByText("다음"));

    expect(onComplete).toHaveBeenCalledWith("CARING", "팀원을 도운 경험");
  });

  it("calls onComplete with value only when experience is skipped", () => {
    const onComplete = vi.fn();
    render(
      <SelfAffirmationStep onComplete={onComplete} onSkip={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("성장"));
    fireEvent.click(screen.getByText("건너뛰기"));

    expect(onComplete).toHaveBeenCalledWith("GROWTH");
  });

  it("renders UX copy text", () => {
    render(
      <SelfAffirmationStep onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    expect(
      screen.getByText(
        "당신을 바꾸려는 게 아니에요. 당신이 어떤 사람인지 먼저 확인하는 과정이에요.",
      ),
    ).toBeDefined();
  });

  it("renders PII masking notice in experience step", () => {
    render(
      <SelfAffirmationStep onComplete={vi.fn()} onSkip={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("진실"));

    expect(
      screen.getByText(/개인정보는 자동으로 마스킹됩니다/),
    ).toBeDefined();
  });
});
