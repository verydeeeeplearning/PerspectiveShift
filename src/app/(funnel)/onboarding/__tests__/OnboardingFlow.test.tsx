import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OnboardingFlow, type QuestionData } from "../components/OnboardingFlow";

const MOCK_QUESTIONS: QuestionData[] = [
  { id: 1, text: "Q1 OX 질문", type: "OX", phase: "core" },
  { id: 2, text: "Q2 OX 질문", type: "OX", phase: "core" },
  { id: 3, text: "Q3 OX 질문", type: "OX", phase: "core" },
  {
    id: 4,
    text: "Q4 리커트 질문",
    type: "RUBRIC",
    phase: "core",
    allowUncertain: true,
  },
  {
    id: 5,
    text: "Q5 리커트 질문",
    type: "RUBRIC",
    phase: "core",
    allowUncertain: true,
  },
  { id: 6, text: "Q6 OX 확장", type: "OX", phase: "extended" },
  { id: 7, text: "Q7 리커트 확장", type: "RUBRIC", phase: "extended" },
  { id: 8, text: "Q8 리커트 확장", type: "RUBRIC", phase: "extended" },
  { id: 9, text: "Q9 서술형", type: "OPEN_ENDED", phase: "extended" },
  { id: 10, text: "Q10 서술형", type: "OPEN_ENDED", phase: "extended" },
];

describe("OnboardingFlow", () => {
  it("renders precision selector first", () => {
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );

    expect(screen.getByText("정밀도 사다리 선택")).toBeInTheDocument();
    expect(screen.getByText("빠르게 시작")).toBeInTheDocument();
    expect(screen.getByText("정밀 분석")).toBeInTheDocument();
  });

  it("starts questions after selecting a precision", () => {
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("표준 분석"));
    expect(screen.getByText("Q1 OX 질문")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("[변경]")).toBeInTheDocument();
  });

  it("completes after 5 answers in quick precision", () => {
    const onCoreComplete = vi.fn();
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={onCoreComplete}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("빠르게 시작"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("동의"));
    fireEvent.click(screen.getByText("보통"));

    expect(onCoreComplete).toHaveBeenCalledTimes(1);
    expect(onCoreComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        1: true,
        2: false,
        3: true,
        4: 4,
        5: 3,
      }),
    );
  });

  it("moves to extended questions in standard precision", () => {
    const onExtendedComplete = vi.fn();
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={onExtendedComplete}
        onSkipExtended={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("표준 분석"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("동의"));
    fireEvent.click(screen.getByText("보통"));

    expect(screen.getByText("Q6 OX 확장")).toBeInTheDocument();
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("동의"));
    fireEvent.click(screen.getByText("보통"));
    fireEvent.change(screen.getByPlaceholderText("자유롭게 작성해주세요..."), {
      target: { value: "확장 답변 1" },
    });
    fireEvent.click(screen.getByText("확인"));
    fireEvent.change(screen.getByPlaceholderText("자유롭게 작성해주세요..."), {
      target: { value: "확장 답변 2" },
    });
    fireEvent.click(screen.getByText("확인"));

    expect(onExtendedComplete).toHaveBeenCalledTimes(1);
  });

  it("allows mid-flow precision downshift via change button", () => {
    const onCoreComplete = vi.fn();
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={onCoreComplete}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("표준 분석"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("동의"));
    fireEvent.click(screen.getByText("보통"));

    expect(screen.getByText("Q6 OX 확장")).toBeInTheDocument();
    fireEvent.click(screen.getByText("[변경]"));
    fireEvent.click(screen.getByText("빠르게 시작"));

    expect(onCoreComplete).toHaveBeenCalledTimes(1);
  });

  it("emits onboarding events for precision/answers", () => {
    const onEvent = vi.fn();
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
        onEvent={onEvent}
      />,
    );

    fireEvent.click(screen.getByText("표준 분석"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("모르겠어요"));
    fireEvent.click(screen.getByText("보통"));
    fireEvent.click(screen.getByText("[변경]"));
    fireEvent.click(screen.getByText("빠르게 시작"));

    expect(onEvent).toHaveBeenCalledWith("precision_select_10");
    expect(onEvent).toHaveBeenCalledWith("question_answer_ox");
    expect(onEvent).toHaveBeenCalledWith("question_dontknow");
    expect(onEvent).toHaveBeenCalledWith("precision_change_midway");
    expect(onEvent).toHaveBeenCalledWith("precision_select_5");
  });
});
