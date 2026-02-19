import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CooldownScreen } from "../_components/CooldownScreen";

describe("CooldownScreen", () => {
  it("shows fatigue message", () => {
    render(<CooldownScreen reason="FATIGUE" suggestedActivity="Thought Map을 확인하세요" />);
    expect(screen.getByText("오늘은 충분히 대화했어요")).toBeDefined();
  });

  it("shows daily limit message", () => {
    render(<CooldownScreen reason="DAILY_LIMIT" suggestedActivity="과거 대화를 돌아보세요" />);
    expect(screen.getByText("오늘의 대화 횟수를 모두 사용했어요")).toBeDefined();
  });

  it("shows suggested activity", () => {
    render(<CooldownScreen reason="FATIGUE" suggestedActivity="Thought Map을 확인하세요" />);
    expect(screen.getByText("Thought Map을 확인하세요")).toBeDefined();
  });

  it("shows rest encouragement", () => {
    render(<CooldownScreen reason="USER_REQUEST" suggestedActivity="쉬어가세요" />);
    expect(screen.getByText(/충분한 휴식이 필요해요/)).toBeDefined();
  });
});
