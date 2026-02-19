import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RubricQuestion } from "../components/RubricQuestion";

describe("RubricQuestion", () => {
  it("renders question text", () => {
    render(
      <RubricQuestion
        questionId={4}
        text="야근 금지에 대해 어떻게 생각하시나요?"
        onAnswer={vi.fn()}
      />,
    );
    expect(
      screen.getByText("야근 금지에 대해 어떻게 생각하시나요?"),
    ).toBeInTheDocument();
  });

  it("renders 5 scale options", () => {
    render(
      <RubricQuestion questionId={4} text="질문" onAnswer={vi.fn()} />,
    );
    expect(screen.getByText("매우 반대")).toBeInTheDocument();
    expect(screen.getByText("반대")).toBeInTheDocument();
    expect(screen.getByText("보통")).toBeInTheDocument();
    expect(screen.getByText("동의")).toBeInTheDocument();
    expect(screen.getByText("매우 동의")).toBeInTheDocument();
  });

  it("calls onAnswer with score when option clicked", () => {
    const onAnswer = vi.fn();
    render(
      <RubricQuestion questionId={4} text="질문" onAnswer={onAnswer} />,
    );
    fireEvent.click(screen.getByText("동의"));
    expect(onAnswer).toHaveBeenCalledWith(4, 4);
  });

  it("highlights selected option", () => {
    render(
      <RubricQuestion
        questionId={4}
        text="질문"
        onAnswer={vi.fn()}
        selected={3}
      />,
    );
    const buttons = screen.getAllByRole("button");
    const selectedButton = buttons.find((b) =>
      b.textContent?.includes("보통"),
    );
    expect(selectedButton?.className).toContain("bg-blue-600");
  });

  it("renders uncertain options when enabled", () => {
    render(
      <RubricQuestion
        questionId={4}
        text="질문"
        onAnswer={vi.fn()}
        allowUncertain
      />,
    );

    expect(screen.getByText("모르겠어요")).toBeInTheDocument();
    expect(screen.getByText("상황따라")).toBeInTheDocument();
  });

  it("calls onAnswer with uncertain value", () => {
    const onAnswer = vi.fn();
    render(
      <RubricQuestion
        questionId={4}
        text="질문"
        onAnswer={onAnswer}
        allowUncertain
      />,
    );

    fireEvent.click(screen.getByText("모르겠어요"));
    expect(onAnswer).toHaveBeenCalledWith(4, "DONT_KNOW");
  });

  it("shows tooltip text when provided", () => {
    render(
      <RubricQuestion
        questionId={4}
        text="질문"
        onAnswer={vi.fn()}
        tooltipText="왜 묻는지 설명입니다"
      />,
    );

    expect(screen.getByText(/왜 묻는지 설명입니다/)).toBeInTheDocument();
  });
});
