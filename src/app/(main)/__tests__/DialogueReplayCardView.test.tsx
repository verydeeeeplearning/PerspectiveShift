import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DialogueReplayCardView from "../_components/DialogueReplayCardView";

describe("DialogueReplayCardView", () => {
  it("renders opponent statement and topic", () => {
    render(
      <DialogueReplayCardView
        opponentKeyStatement="핵심 발언"
        topic="에너지"
        onRespond={vi.fn()}
      />,
    );
    expect(screen.getByText("핵심 발언")).toBeDefined();
    expect(screen.getByText(/에너지/)).toBeDefined();
  });

  it("renders three thought-change options", () => {
    render(
      <DialogueReplayCardView
        opponentKeyStatement="발언"
        topic="주제"
        onRespond={vi.fn()}
      />,
    );
    expect(screen.getByText("여전히 잘 모르겠어요")).toBeDefined();
    expect(screen.getByText("좀 더 생각하게 됐어요")).toBeDefined();
    expect(screen.getByText("내 생각이 조금 바뀌었어요")).toBeDefined();
  });

  it("calls onRespond with selected choice", () => {
    const onRespond = vi.fn();
    render(
      <DialogueReplayCardView
        opponentKeyStatement="발언"
        topic="주제"
        onRespond={onRespond}
      />,
    );
    fireEvent.click(screen.getByText("내 생각이 조금 바뀌었어요"));
    expect(onRespond).toHaveBeenCalledWith("내 생각이 조금 바뀌었어요");
  });
});
