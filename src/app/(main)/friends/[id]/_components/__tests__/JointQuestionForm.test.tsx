import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JointQuestionForm } from "../JointQuestionForm";

describe("JointQuestionForm", () => {
  it("renders question input", () => {
    render(<JointQuestionForm sessionId="lp-1" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("함께 만들 질문")).toBeInTheDocument();
  });

  it("disables submit when empty", () => {
    render(<JointQuestionForm sessionId="lp-1" onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "질문 제안하기" })).toBeDisabled();
  });

  it("enables submit when question is filled", () => {
    render(<JointQuestionForm sessionId="lp-1" onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("함께 만들 질문"), {
      target: { value: "Why do we differ on this?" },
    });
    expect(screen.getByRole("button", { name: "질문 제안하기" })).not.toBeDisabled();
  });

  it("calls onSubmit with proposed question", () => {
    const onSubmit = vi.fn();
    render(<JointQuestionForm sessionId="lp-1" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("함께 만들 질문"), {
      target: { value: "Why do we differ?" },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledWith({
      proposedQuestion: "Why do we differ?",
    });
  });
});
