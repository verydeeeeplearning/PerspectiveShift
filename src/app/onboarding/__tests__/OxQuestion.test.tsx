import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OxQuestion } from "../components/OxQuestion";

describe("OxQuestion", () => {
  it("renders question text", () => {
    render(
      <OxQuestion
        questionId={1}
        text="AI 규제가 강화되어야 한다"
        onAnswer={vi.fn()}
      />,
    );
    expect(
      screen.getByText("AI 규제가 강화되어야 한다"),
    ).toBeInTheDocument();
  });

  it("renders O and X buttons", () => {
    render(
      <OxQuestion questionId={1} text="질문" onAnswer={vi.fn()} />,
    );
    expect(screen.getByText("O")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("calls onAnswer with true when O clicked", () => {
    const onAnswer = vi.fn();
    render(
      <OxQuestion questionId={1} text="질문" onAnswer={onAnswer} />,
    );
    fireEvent.click(screen.getByText("O"));
    expect(onAnswer).toHaveBeenCalledWith(1, true);
  });

  it("calls onAnswer with false when X clicked", () => {
    const onAnswer = vi.fn();
    render(
      <OxQuestion questionId={1} text="질문" onAnswer={onAnswer} />,
    );
    fireEvent.click(screen.getByText("X"));
    expect(onAnswer).toHaveBeenCalledWith(1, false);
  });

  it("highlights selected O button", () => {
    render(
      <OxQuestion
        questionId={1}
        text="질문"
        onAnswer={vi.fn()}
        selected={true}
      />,
    );
    const oButton = screen.getByText("O");
    expect(oButton.className).toContain("bg-blue-600");
  });
});
