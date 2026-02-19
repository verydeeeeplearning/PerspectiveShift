import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MicroCheckinPrompt } from "../MicroCheckinPrompt";

describe("MicroCheckinPrompt", () => {
  const defaultProps = {
    prompt: "지금까지 대화에서 가장 흥미로웠던 점은 무엇인가요?",
    onSubmit: vi.fn(),
    onSkip: vi.fn(),
  };

  it("displays the prompt", () => {
    render(<MicroCheckinPrompt {...defaultProps} />);
    expect(screen.getByText(defaultProps.prompt)).toBeInTheDocument();
  });

  it("has submit and skip buttons", () => {
    render(<MicroCheckinPrompt {...defaultProps} />);
    expect(screen.getByRole("button", { name: "응답" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "건너뛰기" }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with response text", () => {
    const onSubmit = vi.fn();
    render(<MicroCheckinPrompt {...defaultProps} onSubmit={onSubmit} />);
    const input = screen.getByLabelText("체크인 응답");
    fireEvent.change(input, { target: { value: "interesting point" } });
    fireEvent.submit(input.closest("form")!);
    expect(onSubmit).toHaveBeenCalledWith("interesting point");
  });

  it("calls onSkip when skip button clicked", () => {
    const onSkip = vi.fn();
    render(<MicroCheckinPrompt {...defaultProps} onSkip={onSkip} />);
    fireEvent.click(screen.getByRole("button", { name: "건너뛰기" }));
    expect(onSkip).toHaveBeenCalled();
  });

  it("disables submit when response is empty", () => {
    render(<MicroCheckinPrompt {...defaultProps} />);
    expect(screen.getByRole("button", { name: "응답" })).toBeDisabled();
  });
});
