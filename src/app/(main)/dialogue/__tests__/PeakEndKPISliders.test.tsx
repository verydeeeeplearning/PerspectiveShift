import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PeakEndKPISliders from "../_components/PeakEndKPISliders";

describe("PeakEndKPISliders", () => {
  it("renders two sliders with emoji anchors", () => {
    render(<PeakEndKPISliders onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Feel Heard 슬라이더")).toBeDefined();
    expect(screen.getByLabelText("Rematch Intent 슬라이더")).toBeDefined();
    expect(screen.getByText("😕")).toBeDefined();
    expect(screen.getByText("😊")).toBeDefined();
    expect(screen.getByText("🙅")).toBeDefined();
    expect(screen.getByText("🙋")).toBeDefined();
  });

  it("calls onSubmit with slider values", () => {
    const onSubmit = vi.fn();
    render(<PeakEndKPISliders onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Feel Heard 슬라이더"), {
      target: { value: "80" },
    });
    fireEvent.change(screen.getByLabelText("Rematch Intent 슬라이더"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getByText("제출"));
    expect(onSubmit).toHaveBeenCalledWith(80, 60);
  });
});
