import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NextQuestionInput from "../_components/NextQuestionInput";

describe("NextQuestionInput", () => {
  it("renders input and hint text", () => {
    render(<NextQuestionInput onSave={vi.fn()} />);
    expect(screen.getByText("다음에 묻고 싶은 질문")).toBeDefined();
    expect(screen.getByText(/재매칭 시 이 질문으로 시작/)).toBeDefined();
  });

  it("disables save when empty", () => {
    render(<NextQuestionInput onSave={vi.fn()} />);
    expect(screen.getByText("저장").hasAttribute("disabled")).toBe(true);
  });

  it("calls onSave with trimmed text", () => {
    const onSave = vi.fn();
    render(<NextQuestionInput onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("다음 질문"), {
      target: { value: " 경험이 궁금해요 " },
    });
    fireEvent.click(screen.getByText("저장"));
    expect(onSave).toHaveBeenCalledWith("경험이 궁금해요");
  });
});
