import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DynamicOnboardingFlow,
  type DynamicOnboardingFlowProps,
} from "../components/DynamicOnboardingFlow";
import type { QuestionData } from "../components/onboarding-flow.helpers";

const SEED_QUESTIONS: QuestionData[] = [
  { id: 1, text: "OX질문1", type: "OX", phase: "core", dimension: "TECH_REGULATION", polarity: 1 },
  { id: 2, text: "OX질문2", type: "OX", phase: "core", dimension: "REDISTRIBUTION", polarity: -1 },
  { id: 3, text: "리커트질문3", type: "RUBRIC", phase: "core", dimension: "WORK_LIFE", polarity: 1 },
];

const SEED_META = [
  { id: 1, text: "OX질문1", type: "OX" as const, dimension: "TECH_REGULATION", polarity: 1 as const },
  { id: 2, text: "OX질문2", type: "OX" as const, dimension: "REDISTRIBUTION", polarity: -1 as const },
  { id: 3, text: "리커트질문3", type: "RUBRIC" as const, dimension: "WORK_LIFE", polarity: 1 as const },
];

function renderFlow(overrides?: Partial<DynamicOnboardingFlowProps>) {
  const defaults: DynamicOnboardingFlowProps = {
    seedQuestions: SEED_QUESTIONS,
    seedMeta: SEED_META,
    onComplete: vi.fn(),
    onEvent: vi.fn(),
    ...overrides,
  };

  return { ...render(<DynamicOnboardingFlow {...defaults} />), props: defaults };
}

describe("DynamicOnboardingFlow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders precision selector initially", () => {
    renderFlow();
    expect(screen.getByText("정밀도 사다리 선택")).toBeInTheDocument();
  });

  it("shows seed questions after selecting precision", () => {
    renderFlow();
    fireEvent.click(screen.getByText("라이트"));
    expect(screen.getByText("OX질문1")).toBeInTheDocument();
  });

  it("advances through seed questions", () => {
    renderFlow();
    fireEvent.click(screen.getByText("라이트"));
    fireEvent.click(screen.getByText("O"));
    expect(screen.getByText("OX질문2")).toBeInTheDocument();
  });

  it("emits onboarding events", () => {
    const onEvent = vi.fn();
    renderFlow({ onEvent });
    fireEvent.click(screen.getByText("표준 분석"));
    expect(onEvent).toHaveBeenCalledWith("precision_select_20");
  });

  it("shows progress counter", () => {
    renderFlow();
    fireEvent.click(screen.getByText("표준 분석"));
    expect(screen.getByText("0/20")).toBeInTheDocument();
  });

  it("requests next batch when seed questions exhausted", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          batchIndex: 0,
          questions: [
            {
              id: "gen-0-0",
              text: "생성된 질문 1",
              type: "OX",
              dimension: "TECH_OPTIMISM",
              polarity: 1,
              batchIndex: 0,
            },
          ],
          isComplete: false,
          usedFallback: false,
        }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    renderFlow();
    // Select standard (20 questions)
    fireEvent.click(screen.getByText("표준 분석"));
    // Answer all 3 seed questions
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("동의"));

    // Should show loading indicator
    await waitFor(() => {
      expect(
        screen.getByText("다음 질문을 준비하고 있어요"),
      ).toBeInTheDocument();
    });

    // After batch loads, show generated question
    await waitFor(() => {
      expect(screen.getByText("생성된 질문 1")).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it("shows error state and retry button on batch failure", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", fetchSpy);

    renderFlow();
    fireEvent.click(screen.getByText("표준 분석"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("동의"));

    await waitFor(() => {
      expect(
        screen.getByText("질문 생성 중 오류가 발생했어요"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("다시 시도")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("calls onComplete when targetTotal answers collected", () => {
    const onComplete = vi.fn();
    // Use lite (10 questions) with exactly 10 seed questions for simplicity
    const tenSeeds: QuestionData[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      text: `질문${i + 1}`,
      type: "OX" as const,
      phase: "core" as const,
      dimension: "TECH_REGULATION",
      polarity: 1 as const,
    }));
    const tenMeta = tenSeeds.map((q) => ({
      id: q.id as number,
      text: q.text,
      type: q.type as "OX",
      dimension: "TECH_REGULATION",
      polarity: 1 as const,
    }));

    render(
      <DynamicOnboardingFlow
        seedQuestions={tenSeeds}
        seedMeta={tenMeta}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByText("라이트"));

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText("O"));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Array),
    );
  });
});
