import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReflectionForm } from "../_components/ReflectionForm";

describe("ReflectionForm", () => {
  it("renders all 5 reflection fields", () => {
    render(<ReflectionForm onSubmit={vi.fn()} />);
    expect(screen.getByText(/R1: 상대 입장 요약/)).toBeDefined();
    expect(screen.getByText(/R2: 정확성 확인/)).toBeDefined();
    expect(screen.getByText(/R3: 상대 관점의 가장 강한 논거/)).toBeDefined();
    expect(screen.getByText(/R4: 공통점/)).toBeDefined();
    expect(screen.getByText(/R5: 더 알고 싶은 질문/)).toBeDefined();
  });

  it("marks R1 and R2 as required", () => {
    render(<ReflectionForm onSubmit={vi.fn()} />);
    const requiredMarkers = screen.getAllByText("*");
    expect(requiredMarkers.length).toBe(2);
  });

  it("disables submit when R1 is empty", () => {
    render(<ReflectionForm onSubmit={vi.fn()} />);
    const button = screen.getByText("성찰 제출");
    expect(button).toHaveProperty("disabled", true);
  });

  it("enables submit when R1 and R2 are filled", () => {
    render(<ReflectionForm onSubmit={vi.fn()} />);
    const textareas = screen.getAllByRole("textbox");
    fireEvent.change(textareas[0], { target: { value: "요약 내용" } });
    fireEvent.change(textareas[1], { target: { value: "정확합니다" } });
    const button = screen.getByText("성찰 제출");
    expect(button).toHaveProperty("disabled", false);
  });
});
