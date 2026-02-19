import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StanceDriftConsentCard from "../StanceDriftConsentCard";

describe("StanceDriftConsentCard", () => {
  it("renders consent UI with opt-in and decline buttons", () => {
    render(<StanceDriftConsentCard onOptIn={() => {}} onDecline={() => {}} />);
    expect(screen.getByText("입장 변화 알림")).toBeDefined();
    expect(screen.getByText("켜기")).toBeDefined();
    expect(screen.getByText("지금은 안 할게요")).toBeDefined();
  });

  it("calls onOptIn when 켜기 clicked", () => {
    const onOptIn = vi.fn();
    render(<StanceDriftConsentCard onOptIn={onOptIn} onDecline={() => {}} />);
    fireEvent.click(screen.getByText("켜기"));
    expect(onOptIn).toHaveBeenCalledOnce();
  });

  it("calls onDecline when 지금은 안 할게요 clicked", () => {
    const onDecline = vi.fn();
    render(<StanceDriftConsentCard onOptIn={() => {}} onDecline={onDecline} />);
    fireEvent.click(screen.getByText("지금은 안 할게요"));
    expect(onDecline).toHaveBeenCalledOnce();
  });
});
