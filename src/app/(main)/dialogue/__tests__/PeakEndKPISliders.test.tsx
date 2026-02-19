import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PeakEndKPISliders from "../_components/PeakEndKPISliders";

describe("PeakEndKPISliders", () => {
  it("renders three sliders with emoji anchors", () => {
    render(<PeakEndKPISliders onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Feel Heard 슬라이더")).toBeDefined();
    expect(screen.getByLabelText("Rematch Intent 슬라이더")).toBeDefined();
    expect(screen.getByLabelText("Trailer 일치도 슬라이더")).toBeDefined();
    expect(screen.getByText("😕")).toBeDefined();
    expect(screen.getByText("😊")).toBeDefined();
    expect(screen.getByText("🙅")).toBeDefined();
    expect(screen.getByText("🙋")).toBeDefined();
    expect(screen.getByText("😐")).toBeDefined();
    expect(screen.getByText("🎯")).toBeDefined();
  });
});
