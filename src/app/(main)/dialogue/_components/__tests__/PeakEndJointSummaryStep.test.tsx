import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PeakEndJointSummaryStep } from "../PeakEndJointSummaryStep";

const defaultSummary = {
  topic: "기본소득",
  date: "2026-02-20",
  myKeyPoint: "기본소득은 모든 시민에게 필요합니다",
  opponentKeyPoint: "재원 마련이 현실적으로 어렵습니다",
  commonGround: "사회 안전망은 강화되어야 합니다",
  newDiscovery: "북유럽 모델의 적용 가능성",
  understandingScore: 0.75,
  feelHeardScore: 4,
};

describe("PeakEndJointSummaryStep", () => {
  it("renders with summary data", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    expect(screen.getByTestId("step-joint-summary")).toBeInTheDocument();
    expect(screen.getByText("대화 요약")).toBeInTheDocument();
    expect(screen.getByText("기본소득")).toBeInTheDocument();
    expect(screen.getByText("2026-02-20")).toBeInTheDocument();
  });

  it("shows myKeyPoint in left split card", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    const mineCard = screen.getByTestId("split-card-mine");
    expect(mineCard).toBeInTheDocument();
    expect(mineCard).toHaveTextContent("기본소득은 모든 시민에게 필요합니다");
  });

  it("shows opponentKeyPoint in right split card", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    const opponentCard = screen.getByTestId("split-card-opponent");
    expect(opponentCard).toBeInTheDocument();
    expect(opponentCard).toHaveTextContent("재원 마련이 현실적으로 어렵습니다");
  });

  it("truncates long key points to ~40 characters", () => {
    const onNext = vi.fn();
    const longSummary = {
      ...defaultSummary,
      myKeyPoint:
        "이것은 매우 긴 핵심 주장으로 40자를 초과하는 텍스트를 포함하고 있어 잘려야 합니다",
    };
    render(<PeakEndJointSummaryStep summary={longSummary} onNext={onNext} />);

    const mineCard = screen.getByTestId("split-card-mine");
    const text = mineCard.textContent ?? "";
    // Truncated text ends with ellipsis and is roughly 41 chars (40 + ellipsis)
    expect(text.endsWith("\u2026")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(41);
  });

  it("shows merged card after timeout", async () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    // Before merge
    expect(screen.getByTestId("split-card-mine")).toBeInTheDocument();

    // Wait for the 1100ms merge timeout + AnimatePresence exit animation
    await waitFor(
      () => {
        expect(screen.getByTestId("merged-card")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows commonGround in merged card when available", async () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("merged-card")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByTestId("merged-card")).toHaveTextContent(
      "사회 안전망은 강화되어야 합니다",
    );
  });

  it("shows fallback text in merged card when commonGround is null", async () => {
    const onNext = vi.fn();
    const noCommonSummary = { ...defaultSummary, commonGround: null };
    render(
      <PeakEndJointSummaryStep summary={noCommonSummary} onNext={onNext} />,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("merged-card")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByTestId("merged-card")).toHaveTextContent(
      "공동 요약 카드가 완성됐어요",
    );
  });

  it("shows merge particles at merge time", async () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    // Before merge - no particles
    expect(screen.queryByTestId("merge-particles")).not.toBeInTheDocument();

    // Wait for merge
    await waitFor(
      () => {
        expect(screen.getByTestId("merge-particles")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("hides merge particles after 700ms", async () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    // Wait for particles to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("merge-particles")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Wait for particles to disappear (700ms hide timer)
    await waitFor(
      () => {
        expect(
          screen.queryByTestId("merge-particles"),
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("calls onNext when button is clicked", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    fireEvent.click(screen.getByText("다음"));

    expect(onNext).toHaveBeenCalledOnce();
  });

  it("displays summary detail section with key points", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    expect(
      screen.getByText(/나의 핵심 주장:.*기본소득은 모든 시민에게 필요합니다/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/상대의 핵심 주장:.*재원 마련이 현실적으로 어렵습니다/),
    ).toBeInTheDocument();
  });

  it("displays commonGround and newDiscovery in details when present", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    expect(
      screen.getByText(/공통점:.*사회 안전망은 강화되어야 합니다/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/새로운 발견:.*북유럽 모델의 적용 가능성/),
    ).toBeInTheDocument();
  });

  it("does not display commonGround or newDiscovery when null", () => {
    const onNext = vi.fn();
    const spareSummary = {
      ...defaultSummary,
      commonGround: null,
      newDiscovery: null,
    };
    render(<PeakEndJointSummaryStep summary={spareSummary} onNext={onNext} />);

    expect(screen.queryByText(/공통점:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/새로운 발견:/)).not.toBeInTheDocument();
  });

  it("displays understanding and feel-heard scores", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    expect(screen.getByText("Understanding: 0.75")).toBeInTheDocument();
    expect(screen.getByText("Feel Heard: 4/5")).toBeInTheDocument();
  });

  it("has the merge animation container with relative positioning", () => {
    const onNext = vi.fn();
    render(<PeakEndJointSummaryStep summary={defaultSummary} onNext={onNext} />);

    const container = screen.getByTestId("joint-summary-merge-animation");
    expect(container).toBeInTheDocument();
    expect(container.className).toContain("relative");
  });
});
