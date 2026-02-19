import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JourneyProgressBar from "../_components/JourneyProgressBar";

describe("JourneyProgressBar", () => {
  it("shows all phases with arrows when empty", () => {
    render(<JourneyProgressBar completedPhases={[]} />);
    expect(screen.getByText("내 생각 지도 만들기")).toBeDefined();
    expect(screen.getByText("1번 대화 완료")).toBeDefined();
  });

  it("shows checkmark for completed phases", () => {
    render(<JourneyProgressBar completedPhases={["THOUGHT_MAP"]} />);
    const items = screen.getAllByText("✓");
    expect(items.length).toBe(1);
  });
});
