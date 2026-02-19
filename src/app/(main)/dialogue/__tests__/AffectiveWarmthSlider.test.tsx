import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AffectiveWarmthSlider } from "../_components/AffectiveWarmthSlider";

describe("AffectiveWarmthSlider", () => {
  it("renders label", () => {
    render(<AffectiveWarmthSlider value={5} onChange={vi.fn()} />);
    expect(screen.getByText("이 대화 상대에 대한 호감/온도")).toBeDefined();
  });

  it("renders cold and warm labels", () => {
    render(<AffectiveWarmthSlider value={5} onChange={vi.fn()} />);
    expect(screen.getByText("춥다")).toBeDefined();
    expect(screen.getByText("따뜻하다")).toBeDefined();
  });

  it("displays current value", () => {
    render(<AffectiveWarmthSlider value={7} onChange={vi.fn()} />);
    expect(screen.getByText("7 / 10")).toBeDefined();
  });

  it("calls onChange when slider changes", () => {
    const onChange = vi.fn();
    render(<AffectiveWarmthSlider value={5} onChange={onChange} />);
    const slider = screen.getByLabelText("Affective Warmth");
    fireEvent.change(slider, { target: { value: "8" } });
    expect(onChange).toHaveBeenCalledWith(8);
  });
});
