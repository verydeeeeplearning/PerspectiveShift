import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OpenEndedQuestion } from "../components/OpenEndedQuestion";

describe("OpenEndedQuestion", () => {
  it("renders question text", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="한국 사회에서 가장 시급한 것은?"
        onAnswer={vi.fn()}
      />,
    );
    expect(
      screen.getByText("한국 사회에서 가장 시급한 것은?"),
    ).toBeInTheDocument();
  });

  it("renders textarea with placeholder", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={vi.fn()}
      />,
    );
    expect(
      screen.getByPlaceholderText("자유롭게 작성해주세요..."),
    ).toBeInTheDocument();
  });

  it("shows character count", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={vi.fn()}
      />,
    );
    expect(screen.getByText("0/2000")).toBeInTheDocument();
  });

  it("updates character count on input", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={vi.fn()}
      />,
    );
    const textarea = screen.getByPlaceholderText(
      "자유롭게 작성해주세요...",
    );
    fireEvent.change(textarea, { target: { value: "테스트" } });
    expect(screen.getByText("3/2000")).toBeInTheDocument();
  });

  it("calls onAnswer on submit", () => {
    const onAnswer = vi.fn();
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={onAnswer}
      />,
    );
    const textarea = screen.getByPlaceholderText(
      "자유롭게 작성해주세요...",
    );
    fireEvent.change(textarea, { target: { value: "답변 텍스트" } });
    fireEvent.click(screen.getByText("확인"));
    expect(onAnswer).toHaveBeenCalledWith(9, "답변 텍스트");
  });

  it("disables submit button when empty", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={vi.fn()}
      />,
    );
    const button = screen.getByText("확인");
    expect(button).toBeDisabled();
  });

  it("swipes example cards with prev/next buttons", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={vi.fn()}
      />,
    );

    expect(screen.getByText(/예시 1\/3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음 예시" }));
    expect(screen.getByText(/예시 2\/3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "이전 예시" }));
    expect(screen.getByText(/예시 1\/3/)).toBeInTheDocument();
  });

  it("shows coach guidance when coach button is clicked", () => {
    render(
      <OpenEndedQuestion
        questionId={9}
        text="질문"
        onAnswer={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Coach"));
    expect(screen.getByText(/설득력이 올라가요/)).toBeInTheDocument();
  });

  it("resets textarea when component remounts for a different question", () => {
    const { rerender } = render(
      <OpenEndedQuestion
        key="question-9"
        questionId={9}
        text="질문 A"
        onAnswer={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText("자유롭게 작성해주세요...");
    fireEvent.change(textarea, { target: { value: "이전 답변" } });

    rerender(
      <OpenEndedQuestion
        key="question-10"
        questionId={10}
        text="질문 B"
        onAnswer={vi.fn()}
      />,
    );

    expect(
      (screen.getByPlaceholderText("자유롭게 작성해주세요...") as HTMLTextAreaElement).value,
    ).toBe("");
  });
});
