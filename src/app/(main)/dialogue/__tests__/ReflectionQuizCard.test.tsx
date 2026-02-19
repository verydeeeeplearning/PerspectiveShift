import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReflectionQuizCard } from "../_components/ReflectionQuizCard";

describe("ReflectionQuizCard", () => {
  const options = ["A옵션", "B옵션", "C옵션", "D옵션"];
  const onAnswer = vi.fn();

  it("renders 4 radio options", () => {
    render(<ReflectionQuizCard options={options} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("shows question text", () => {
    render(<ReflectionQuizCard options={options} onAnswer={onAnswer} />);
    expect(screen.getByText(/상대방이 가장 중요하게 생각한 건/)).toBeInTheDocument();
  });

  it("calls onAnswer with selected index", () => {
    render(<ReflectionQuizCard options={options} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("B옵션"));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it("shows all option texts", () => {
    render(<ReflectionQuizCard options={options} onAnswer={onAnswer} />);
    for (const opt of options) {
      expect(screen.getByText(opt)).toBeInTheDocument();
    }
  });
});
