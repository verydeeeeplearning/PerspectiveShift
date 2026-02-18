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
});
