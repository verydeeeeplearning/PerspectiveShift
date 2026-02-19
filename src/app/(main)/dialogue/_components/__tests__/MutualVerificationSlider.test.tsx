import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MutualVerificationSlider } from "../MutualVerificationSlider";

describe("MutualVerificationSlider", () => {
  it("auto-shows correction textarea when slider value < 40", () => {
    const onSubmit = vi.fn();
    render(<MutualVerificationSlider summary="요약 텍스트" onSubmit={onSubmit} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "30" } });

    expect(screen.getByPlaceholderText("조금 다른 부분은...")).toBeInTheDocument();
  });

  it("does not auto-show correction when slider value >= 40", () => {
    const onSubmit = vi.fn();
    render(<MutualVerificationSlider summary="요약 텍스트" onSubmit={onSubmit} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "60" } });

    // Should still show the manual button, not the textarea
    expect(screen.getByText("수정 제안 추가하기")).toBeInTheDocument();
  });

  it("calls onSubmit with value and correction", () => {
    const onSubmit = vi.fn();
    render(<MutualVerificationSlider summary="요약 텍스트" onSubmit={onSubmit} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "20" } });

    const textarea = screen.getByPlaceholderText("조금 다른 부분은...");
    fireEvent.change(textarea, { target: { value: "수정 내용" } });

    fireEvent.click(screen.getByLabelText("확인"));
    expect(onSubmit).toHaveBeenCalledWith(20, "수정 내용");
  });
});
