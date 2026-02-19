import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MatchCardV3 } from "../components/MatchCardV3";

const defaultProps = {
  topic: "AI 기술 규제",
  distanceLabel: {
    level: "MODERATE",
    emoji: "🌊",
    shortText: "적당한 차이",
    description: "한두 축에서 뚜렷이 다름",
    isDisabled: false,
  },
  estimatedMinutes: 15,
  socialProof: "어제 이 주제로 24쌍이 대화했어요",
  onStart: vi.fn(),
  onDecline: vi.fn(),
};

describe("MatchCardV3", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders topic text", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByText("AI 기술 규제")).toBeInTheDocument();
  });

  it("renders distance label with emoji", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByText(/적당한 차이/)).toBeInTheDocument();
    expect(screen.getByText("🌊")).toBeInTheDocument();
  });

  it("renders estimated time", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByTestId("match-card-time")).toHaveTextContent("약 15분");
  });

  it("renders default difficulty range", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByTestId("match-card-difficulty")).toHaveTextContent(
      "난이도 Level 1-2",
    );
  });

  it("renders custom difficulty range and CTA label", () => {
    render(
      <MatchCardV3
        {...defaultProps}
        difficultyRange={[0, 1]}
        ctaLabel="가볍게 5분 시작"
      />,
    );

    expect(screen.getByTestId("match-card-difficulty")).toHaveTextContent(
      "난이도 Level 0-1",
    );
    expect(
      screen.getByRole("button", { name: "가볍게 5분 시작" }),
    ).toBeInTheDocument();
  });

  it("renders social proof", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByText(/24쌍/)).toBeInTheDocument();
  });

  it("renders conversation trailer when provided", () => {
    render(
      <MatchCardV3
        {...defaultProps}
        trailer="기술에 열린 자세를 가진 분이에요."
      />,
    );
    expect(screen.getByText(/열린 자세/)).toBeInTheDocument();
  });

  it("renders start CTA button", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByRole("button", { name: /대화 시작/ })).toBeInTheDocument();
  });

  it("calls onStart when CTA clicked", () => {
    const onStart = vi.fn();
    render(<MatchCardV3 {...defaultProps} onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /대화 시작/ }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("calls onDecline when decline button clicked", () => {
    const onDecline = vi.fn();
    render(<MatchCardV3 {...defaultProps} onDecline={onDecline} />);
    fireEvent.click(screen.getByRole("button", { name: /다음에/ }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it("shows anonymous badge", () => {
    render(<MatchCardV3 {...defaultProps} />);
    expect(screen.getByText(/익명/)).toBeInTheDocument();
  });

  it("toggles transition flag within 0.3s when card metrics change", () => {
    vi.useFakeTimers();
    const { rerender } = render(<MatchCardV3 {...defaultProps} />);

    const card = screen.getByTestId("match-card-root");
    expect(card).toHaveAttribute("data-transitioning", "true");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(card).toHaveAttribute("data-transitioning", "false");

    rerender(<MatchCardV3 {...defaultProps} estimatedMinutes={10} />);
    expect(card).toHaveAttribute("data-transitioning", "true");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(card).toHaveAttribute("data-transitioning", "false");
  });
});
