import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingQuestionRenderer } from "../components/OnboardingQuestionRenderer";
import type { QuestionData } from "../components/onboarding-flow.helpers";

describe("OnboardingQuestionRenderer", () => {
  it("resets open-ended input when question id changes", () => {
    const questionA: QuestionData = {
      id: 101,
      text: "질문 A",
      type: "OPEN_ENDED",
      phase: "core",
    };
    const questionB: QuestionData = {
      id: 102,
      text: "질문 B",
      type: "OPEN_ENDED",
      phase: "core",
    };

    const { rerender } = render(
      <OnboardingQuestionRenderer
        question={questionA}
        answers={{}}
        onAnswer={vi.fn()}
        onCoachClick={vi.fn()}
        onExampleSwipe={vi.fn()}
      />,
    );

    const textareaA = screen.getByRole("textbox", { name: "질문 A" });
    fireEvent.change(textareaA, { target: { value: "이전 질문 답변" } });
    expect(screen.queryByText("0/2000")).not.toBeInTheDocument();

    rerender(
      <OnboardingQuestionRenderer
        question={questionB}
        answers={{}}
        onAnswer={vi.fn()}
        onCoachClick={vi.fn()}
        onExampleSwipe={vi.fn()}
      />,
    );

    const textareaB = screen.getByRole("textbox", { name: "질문 B" }) as HTMLTextAreaElement;
    expect(textareaB.value).toBe("");
    expect(screen.getByText("0/2000")).toBeInTheDocument();
  });
});
