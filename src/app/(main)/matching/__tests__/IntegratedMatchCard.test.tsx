import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntegratedMatchCard } from "../components/IntegratedMatchCard";

const defaultProps = {
  topic: "AI 기술 규제는 필요한가",
  energy: "NORMAL" as const,
  trailerLine1: "기술 발전에 긍정적인 시각을 가진 분이에요.",
  trailerLine2: "하지만 규제의 필요성도 인정하는 편이에요.",
  trailerLine3: null as string | null,
  distanceLabel: "적당한 차이",
  distanceDots: 3,
  difficultyLevel: 2,
  timeBudgetMinutes: 10,
  ctaCopy: "대화 시작",
  declineBadge: null as { text: string } | null,
  onStartDialogue: vi.fn(),
  onDecline: vi.fn(),
};

describe("IntegratedMatchCard", () => {
  it("renders topic", () => {
    render(<IntegratedMatchCard {...defaultProps} />);
    expect(screen.getByText("AI 기술 규제는 필요한가")).toBeInTheDocument();
  });

  it("renders trailer line 1 and line 2", () => {
    render(<IntegratedMatchCard {...defaultProps} />);
    expect(
      screen.getByText("기술 발전에 긍정적인 시각을 가진 분이에요."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("하지만 규제의 필요성도 인정하는 편이에요."),
    ).toBeInTheDocument();
  });

  it("renders trailer line 3 when provided", () => {
    render(
      <IntegratedMatchCard
        {...defaultProps}
        trailerLine3="대화를 통해 더 깊이 이해하고 싶어해요."
      />,
    );
    expect(
      screen.getByText("대화를 통해 더 깊이 이해하고 싶어해요."),
    ).toBeInTheDocument();
  });

  it("does not render trailer line 3 when null", () => {
    render(<IntegratedMatchCard {...defaultProps} trailerLine3={null} />);
    const trailerSection = screen.getByText("상대방 미리보기").parentElement;
    // Only two <p> elements for trailer lines (line1, line2)
    const paragraphs = trailerSection?.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
  });

  it("renders correct filled/empty distance dots", () => {
    render(<IntegratedMatchCard {...defaultProps} distanceDots={3} />);
    // 3 filled dots + 2 empty dots
    expect(screen.getByText("●●●○○")).toBeInTheDocument();
  });

  it("renders distance dots for all filled (5)", () => {
    render(<IntegratedMatchCard {...defaultProps} distanceDots={5} />);
    expect(screen.getByText("●●●●●")).toBeInTheDocument();
  });

  it("renders distance dots for minimum (1)", () => {
    render(<IntegratedMatchCard {...defaultProps} distanceDots={1} />);
    expect(screen.getByText("●○○○○")).toBeInTheDocument();
  });

  it("renders distance label text", () => {
    render(<IntegratedMatchCard {...defaultProps} distanceLabel="적당한 차이" />);
    expect(screen.getByText("적당한 차이")).toBeInTheDocument();
  });

  it("renders difficulty level", () => {
    render(<IntegratedMatchCard {...defaultProps} difficultyLevel={2} />);
    expect(screen.getByText("Level 2")).toBeInTheDocument();
  });

  it("renders time budget", () => {
    render(<IntegratedMatchCard {...defaultProps} timeBudgetMinutes={10} />);
    expect(screen.getByText("10분")).toBeInTheDocument();
  });

  it("renders CTA copy on the start button", () => {
    render(<IntegratedMatchCard {...defaultProps} ctaCopy="가볍게 5분 시작" />);
    expect(
      screen.getByRole("button", { name: "가볍게 5분 시작" }),
    ).toBeInTheDocument();
  });

  it("calls onStartDialogue when CTA button is clicked", () => {
    const onStartDialogue = vi.fn();
    render(
      <IntegratedMatchCard
        {...defaultProps}
        onStartDialogue={onStartDialogue}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "대화 시작" }));
    expect(onStartDialogue).toHaveBeenCalledTimes(1);
  });

  it("calls onDecline when decline button is clicked", () => {
    const onDecline = vi.fn();
    render(<IntegratedMatchCard {...defaultProps} onDecline={onDecline} />);
    fireEvent.click(screen.getByRole("button", { name: "다른 상대" }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it("renders decline badge when provided", () => {
    render(
      <IntegratedMatchCard
        {...defaultProps}
        declineBadge={{ text: "난이도를 낮춰봤어요" }}
      />,
    );
    expect(screen.getByText("난이도를 낮춰봤어요")).toBeInTheDocument();
  });

  it("does not render decline badge when null", () => {
    render(<IntegratedMatchCard {...defaultProps} declineBadge={null} />);
    expect(screen.queryByText("난이도를 낮춰봤어요")).not.toBeInTheDocument();
  });

  it('has aria-label="매칭 카드" on the card element', () => {
    render(<IntegratedMatchCard {...defaultProps} />);
    expect(screen.getByRole("article", { name: "매칭 카드" })).toBeInTheDocument();
  });
});
