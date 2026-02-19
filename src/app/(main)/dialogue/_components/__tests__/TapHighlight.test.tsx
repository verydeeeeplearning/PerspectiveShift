import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TapHighlight } from "../TapHighlight";

describe("TapHighlight", () => {
  const defaultSegments = [
    { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: false },
    { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: false },
  ];

  const onSegmentTap = vi.fn();
  const onInsertQuote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all segments", () => {
    render(
      <TapHighlight
        text="나는 동의합니다. 하지만 다른 관점도 있어요."
        segments={defaultSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    expect(screen.getByText("나는 동의합니다.")).toBeInTheDocument();
    expect(screen.getByText("하지만 다른 관점도 있어요.")).toBeInTheDocument();
  });

  it("calls onSegmentTap when a segment is tapped", () => {
    render(
      <TapHighlight
        text="나는 동의합니다. 하지만 다른 관점도 있어요."
        segments={defaultSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    fireEvent.click(screen.getByText("나는 동의합니다."));
    expect(onSegmentTap).toHaveBeenCalledWith("seg-0");
  });

  it("shows quote insertion button when a segment is highlighted", () => {
    const highlightedSegments = [
      { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: true },
      { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: false },
    ];

    render(
      <TapHighlight
        text="나는 동의합니다. 하지만 다른 관점도 있어요."
        segments={highlightedSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    expect(screen.getByText(/질문에 인용하기/)).toBeInTheDocument();
  });

  it("does not show quote insertion button when no segment is highlighted", () => {
    render(
      <TapHighlight
        text="나는 동의합니다. 하지만 다른 관점도 있어요."
        segments={defaultSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    expect(screen.queryByText(/질문에 인용하기/)).not.toBeInTheDocument();
  });

  it("calls onInsertQuote with concatenated highlighted texts", () => {
    const highlightedSegments = [
      { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: true },
      { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: true },
    ];

    render(
      <TapHighlight
        text="나는 동의합니다. 하지만 다른 관점도 있어요."
        segments={highlightedSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    fireEvent.click(screen.getByText(/질문에 인용하기/));
    expect(onInsertQuote).toHaveBeenCalledWith("나는 동의합니다. 하지만 다른 관점도 있어요.");
  });

  it("has correct aria-label on the list container", () => {
    render(
      <TapHighlight
        text="텍스트"
        segments={defaultSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    expect(screen.getByRole("list", { name: /하이라이트 가능한 텍스트/ })).toBeInTheDocument();
  });

  it("has correct aria-pressed on highlighted segment", () => {
    const highlightedSegments = [
      { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: true },
      { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: false },
    ];

    render(
      <TapHighlight
        text="텍스트"
        segments={highlightedSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    const buttons = screen.getAllByRole("listitem");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
  });

  it("applies highlight styling to highlighted segments", () => {
    const highlightedSegments = [
      { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: true },
      { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: false },
    ];

    render(
      <TapHighlight
        text="텍스트"
        segments={highlightedSegments}
        onSegmentTap={onSegmentTap}
        onInsertQuote={onInsertQuote}
      />,
    );

    const buttons = screen.getAllByRole("listitem");
    expect(buttons[0].className).toContain("bg-yellow-100");
    expect(buttons[1].className).not.toContain("bg-yellow-100");
  });
});
