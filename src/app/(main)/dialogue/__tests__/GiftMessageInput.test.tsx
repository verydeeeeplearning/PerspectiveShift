import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GiftMessageInput from "../_components/GiftMessageInput";

describe("GiftMessageInput", () => {
  it("renders placeholder and submit button", () => {
    render(<GiftMessageInput onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText("따뜻한 한 마디를 남겨보세요")).toBeDefined();
    expect(screen.getByText("저장")).toBeDefined();
  });

  it("disables button when empty", () => {
    render(<GiftMessageInput onSubmit={vi.fn()} />);
    const btn = screen.getByText("저장");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("calls onSubmit with trimmed text", () => {
    const onSubmit = vi.fn();
    render(<GiftMessageInput onSubmit={onSubmit} />);
    const textarea = screen.getByLabelText("선물 메시지");
    fireEvent.change(textarea, { target: { value: " 감사합니다 " } });
    fireEvent.click(screen.getByText("저장"));
    expect(onSubmit).toHaveBeenCalledWith("감사합니다");
  });
});
