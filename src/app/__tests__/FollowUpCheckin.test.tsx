import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FollowUpCheckin } from "../_components/FollowUpCheckin";

describe("FollowUpCheckin", () => {
  it("renders question", () => {
    render(<FollowUpCheckin checkinId="c-1" onSubmit={vi.fn()} />);
    expect(screen.getByText("다른 의견 대화에 대한 회피감이 줄었나요?")).toBeDefined();
  });

  it("renders 5 score options", () => {
    render(<FollowUpCheckin checkinId="c-1" onSubmit={vi.fn()} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`회피감 감소 ${i}점`)).toBeDefined();
    }
  });

  it("submit button disabled until score selected", () => {
    render(<FollowUpCheckin checkinId="c-1" onSubmit={vi.fn()} />);
    const btn = screen.getByText("제출");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("calls onSubmit with checkinId and score", () => {
    const onSubmit = vi.fn();
    render(<FollowUpCheckin checkinId="c-1" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByLabelText("회피감 감소 4점"));
    fireEvent.click(screen.getByText("제출"));
    expect(onSubmit).toHaveBeenCalledWith("c-1", 4);
  });

  it("shows dismiss button when onDismiss provided", () => {
    const onDismiss = vi.fn();
    render(<FollowUpCheckin checkinId="c-1" onSubmit={vi.fn()} onDismiss={onDismiss} />);
    const dismissBtn = screen.getByText("나중에");
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
