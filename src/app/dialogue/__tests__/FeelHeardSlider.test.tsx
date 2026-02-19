import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeelHeardSlider } from "../_components/FeelHeardSlider";

describe("FeelHeardSlider", () => {
  it("renders question label", () => {
    render(<FeelHeardSlider value={3} onChange={vi.fn()} />);
    expect(screen.getByText("상대가 내 말을 제대로 이해했다고 느꼈나요?")).toBeDefined();
  });

  it("renders 5 score buttons", () => {
    render(<FeelHeardSlider value={3} onChange={vi.fn()} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`Feel Heard ${i}점`)).toBeDefined();
    }
  });

  it("highlights selected score", () => {
    render(<FeelHeardSlider value={4} onChange={vi.fn()} />);
    const btn = screen.getByLabelText("Feel Heard 4점");
    expect(btn.className).toContain("border-blue-500");
  });

  it("calls onChange when score clicked", () => {
    const onChange = vi.fn();
    render(<FeelHeardSlider value={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Feel Heard 5점"));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
