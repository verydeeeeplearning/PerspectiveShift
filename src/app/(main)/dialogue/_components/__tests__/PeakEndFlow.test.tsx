import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PeakEndFlow } from "../PeakEndFlow";
import type { FinalCTAContext } from "@/domain/value-objects/final-cta-type";

describe("PeakEndFlow", () => {
  const defaultSummary = {
    topic: "기본소득",
    date: "2026-02-19",
    myKeyPoint: "기본소득은 필요합니다",
    opponentKeyPoint: "재원 마련이 어렵습니다",
    commonGround: "사회 안전망은 필요합니다",
    newDiscovery: "재원 마련 방안에 대한 새로운 시각",
    understandingScore: 0.7,
    feelHeardScore: 4,
    agreedPoints: ["사회 안전망 필요"],
    disagreedPoints: ["재원 마련 방법"],
  };

  const defaultGiftMessage = {
    text: "당신의 관점이 저를 성장시켰어요",
    writtenAtStep: "REFLECTION",
  };

  const defaultBlindSpot = {
    discoveredConcept: "세금 구조의 복잡성",
  };

  const defaultCtaContext: FinalCTAContext = {
    isAgentDialogue: false,
    feelHeardScore: 50,
    hasHumanMatch: false,
    energyLevel: "NORMAL",
  };

  const onKPISubmit = vi.fn();
  const onNextQuestionSave = vi.fn();
  const onCTAClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderFlow(overrides: Partial<Parameters<typeof PeakEndFlow>[0]> = {}) {
    return render(
      <PeakEndFlow
        summary={defaultSummary}
        giftMessage={defaultGiftMessage}
        blindSpot={defaultBlindSpot}
        ctaContext={defaultCtaContext}
        onKPISubmit={onKPISubmit}
        onNextQuestionSave={onNextQuestionSave}
        onCTAClick={onCTAClick}
        {...overrides}
      />,
    );
  }

  it("renders joint summary step initially", () => {
    renderFlow();
    expect(screen.getByTestId("step-joint-summary")).toBeInTheDocument();
    expect(screen.getByText("대화 요약")).toBeInTheDocument();
    expect(screen.getByText("기본소득")).toBeInTheDocument();
  });

  it("displays summary key points", () => {
    renderFlow();
    expect(screen.getByText(/기본소득은 필요합니다/)).toBeInTheDocument();
    expect(screen.getByText(/재원 마련이 어렵습니다/)).toBeInTheDocument();
  });

  it("displays common ground when present", () => {
    renderFlow();
    expect(screen.getByText(/사회 안전망은 필요합니다/)).toBeInTheDocument();
  });

  it("clicking next advances to gift message step", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByTestId("step-gift-message")).toBeInTheDocument();
    expect(screen.getByText("선물 한 문장")).toBeInTheDocument();
  });

  it("displays gift message text", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByText(/당신의 관점이 저를 성장시켰어요/)).toBeInTheDocument();
  });

  it("handles null gift message", () => {
    renderFlow({ giftMessage: null });
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByText("선물 메시지가 없습니다")).toBeInTheDocument();
  });

  it("advances to blind spot step", () => {
    renderFlow();
    // Step 1 -> 2
    fireEvent.click(screen.getByText("다음"));
    // Step 2 -> 3
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByTestId("step-blind-spot")).toBeInTheDocument();
    expect(screen.getByText("새로운 발견")).toBeInTheDocument();
  });

  it("displays blind spot concept", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByText(/세금 구조의 복잡성/)).toBeInTheDocument();
  });

  it("handles null blind spot", () => {
    renderFlow({ blindSpot: null });
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByText("이번 대화에서 새로운 발견이 없었어요")).toBeInTheDocument();
  });

  it("renders KPI sliders on step 4", () => {
    renderFlow();
    // Advance through first 3 steps
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByTestId("step-kpi")).toBeInTheDocument();
    expect(screen.getByText("대화는 어땠나요?")).toBeInTheDocument();
    expect(screen.getByLabelText("Feel Heard")).toBeInTheDocument();
    expect(screen.getByLabelText("다시 대화 의향")).toBeInTheDocument();
  });

  it("calls onKPISubmit when advancing from KPI step", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));

    // Change slider value
    const feelHeardSlider = screen.getByLabelText("Feel Heard");
    fireEvent.change(feelHeardSlider, { target: { value: "75" } });

    fireEvent.click(screen.getByText("다음"));
    expect(onKPISubmit).toHaveBeenCalledWith(75, 50);
  });

  it("renders next question input on step 5", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByTestId("step-next-question")).toBeInTheDocument();
    expect(screen.getByLabelText("다음 질문")).toBeInTheDocument();
  });

  it("shows skip button when next question is empty", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(screen.getByText("건너뛰기")).toBeInTheDocument();
  });

  it("shows save button when next question has text", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));

    const textarea = screen.getByLabelText("다음 질문");
    fireEvent.change(textarea, { target: { value: "다음에 물어볼 질문" } });
    expect(screen.getByText("저장하고 다음")).toBeInTheDocument();
  });

  it("calls onNextQuestionSave when advancing with text", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));

    const textarea = screen.getByLabelText("다음 질문");
    fireEvent.change(textarea, { target: { value: "다음에 물어볼 질문" } });
    fireEvent.click(screen.getByText("저장하고 다음"));
    expect(onNextQuestionSave).toHaveBeenCalledWith("다음에 물어볼 질문");
  });

  it("does not call onNextQuestionSave when skipping", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("건너뛰기"));
    expect(onNextQuestionSave).not.toHaveBeenCalled();
  });

  it("renders final CTA with correct label", () => {
    renderFlow();
    // Advance through all 5 steps to reach FINAL_CTA
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("건너뛰기"));
    expect(screen.getByTestId("step-final-cta")).toBeInTheDocument();
    expect(screen.getByText("대화가 끝났어요!")).toBeInTheDocument();
    // Default context -> FIND_NEXT_DIALOGUE
    expect(screen.getByText("다음 대화 찾기")).toBeInTheDocument();
  });

  it("CTA click calls onCTAClick with correct type", () => {
    renderFlow();
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("건너뛰기"));

    fireEvent.click(screen.getByText("다음 대화 찾기"));
    expect(onCTAClick).toHaveBeenCalledWith("FIND_NEXT_DIALOGUE");
  });

  it("renders BECOME_FRIENDS CTA when feelHeard >= 80", () => {
    renderFlow({
      ctaContext: { ...defaultCtaContext, feelHeardScore: 80 },
    });
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("건너뛰기"));
    expect(screen.getByText("친구 되기")).toBeInTheDocument();
  });

  it("renders REST_FOR_TODAY CTA when energy is LOW", () => {
    renderFlow({
      ctaContext: { ...defaultCtaContext, energyLevel: "LOW" },
    });
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("건너뛰기"));
    expect(screen.getByText("오늘은 여기까지")).toBeInTheDocument();
  });

  it("has accessible region label", () => {
    renderFlow();
    expect(screen.getByRole("region", { name: "대화 마무리" })).toBeInTheDocument();
  });

  it("shows progress bar", () => {
    renderFlow();
    const region = screen.getByRole("region", { name: "대화 마무리" });
    expect(region).toBeInTheDocument();
    // Progress bar should exist
    const progressBar = region.querySelector(".bg-blue-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("shows turing step for agent dialogue", () => {
    renderFlow({
      ctaContext: { ...defaultCtaContext, isAgentDialogue: true },
    });
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));

    expect(screen.getByTestId("step-turing")).toBeInTheDocument();
    expect(screen.getByText(/이 대화 상대는 사람이었을까요/)).toBeInTheDocument();
  });
});
