import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EffortGradeSelector } from "../_components/EffortGradeSelector";

describe("EffortGradeSelector", () => {
  it("renders the prompt question", () => {
    render(
      <EffortGradeSelector selectedGrade={null} onSelect={vi.fn()} />,
    );
    expect(
      screen.getByText("대화 시간을 선택하세요"),
    ).toBeDefined();
  });

  it("renders all 3 grades", () => {
    render(
      <EffortGradeSelector selectedGrade={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByText("가볍게")).toBeDefined();
    expect(screen.getByText("체계적으로")).toBeDefined();
    expect(screen.getByText("깊이 있게")).toBeDefined();
  });

  it("shows duration info", () => {
    render(
      <EffortGradeSelector selectedGrade={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByText("5분 / 3단계")).toBeDefined();
    expect(screen.getByText("15분 / 5단계")).toBeDefined();
    expect(screen.getByText("30분 / 7단계")).toBeDefined();
  });

  it("calls onSelect when a grade is clicked", () => {
    const onSelect = vi.fn();
    render(
      <EffortGradeSelector selectedGrade={null} onSelect={onSelect} />,
    );
    fireEvent.click(screen.getByText("가볍게").closest("button")!);
    expect(onSelect).toHaveBeenCalledWith("QUICK");
  });

  it("highlights selected grade", () => {
    render(
      <EffortGradeSelector selectedGrade="STRUCTURED" onSelect={vi.fn()} />,
    );
    const selectedButton = screen.getByText("체계적으로").closest("button");
    expect(selectedButton?.className).toContain("border-blue-500");
  });
});
