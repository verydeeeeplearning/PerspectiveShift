import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OnboardingFlow, type QuestionData } from "../components/OnboardingFlow";

const MOCK_QUESTIONS: QuestionData[] = [
  { id: 1, text: "Q1 OX 질문", type: "OX", phase: "core" },
  { id: 2, text: "Q2 OX 질문", type: "OX", phase: "core" },
  { id: 3, text: "Q3 OX 질문", type: "OX", phase: "core" },
  { id: 4, text: "Q4 리커트 질문", type: "RUBRIC", phase: "core" },
  { id: 5, text: "Q5 리커트 질문", type: "RUBRIC", phase: "core" },
  { id: 6, text: "Q6 OX 확장", type: "OX", phase: "extended" },
  { id: 7, text: "Q7 리커트 확장", type: "RUBRIC", phase: "extended" },
  { id: 8, text: "Q8 리커트 확장", type: "RUBRIC", phase: "extended" },
  { id: 9, text: "Q9 서술형", type: "OPEN_ENDED", phase: "extended" },
  { id: 10, text: "Q10 서술형", type: "OPEN_ENDED", phase: "extended" },
];

describe("OnboardingFlow", () => {
  it("renders first question", () => {
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );
    expect(screen.getByText("Q1 OX 질문")).toBeInTheDocument();
  });

  it("shows progress bar", () => {
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText(/핵심 질문 1\/5/)).toBeInTheDocument();
  });

  it("advances to next question on answer", () => {
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("O"));
    expect(screen.getByText("Q2 OX 질문")).toBeInTheDocument();
  });

  it("calls onCoreComplete after 5 core answers", () => {
    const onCoreComplete = vi.fn();
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={onCoreComplete}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );

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

  it("shows decision screen after core complete", () => {
    render(
      <OnboardingFlow
        questions={MOCK_QUESTIONS}
        onCoreComplete={vi.fn()}
        onExtendedComplete={vi.fn()}
        onSkipExtended={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("동의"));
    fireEvent.click(screen.getByText("보통"));

    expect(
      screen.getByText("Thought Map이 생성되었습니다!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("확장 질문 시작"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("지금은 건너뛸게요"),
    ).toBeInTheDocument();
  });
});
