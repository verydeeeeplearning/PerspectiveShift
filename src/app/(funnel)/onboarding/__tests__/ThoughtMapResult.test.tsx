import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThoughtMapResult } from "../components/ThoughtMapResult";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";

vi.stubGlobal(
  "ResizeObserver",
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

const SAMPLE_OUTPUT: ThoughtMapOutput = {
  sessionId: "sess-1",
  vector: {
    TECH_REGULATION: 0.5,
    REDISTRIBUTION: 0.3,
    WORK_LIFE: 0.1,
    MERITOCRACY: -0.2,
    TECH_OPTIMISM: 0.4,
    OPPORTUNITY_EQUALITY: 0.2,
  },
  mapType: {
    name: "BALANCE_SEEKER",
    alias: "균형 탐색가",
    emoji: "\u2696\uFE0F",
    description: "다양한 관점을 균형 있게 고려합니다.",
  },
  alias: {
    key: "CAREFUL_SCALE",
    label: "신중한 저울",
    emoji: "\u2696\uFE0F",
    description: "여러 관점을 차분하게 저울질하며, 극단보다 균형을 선호합니다.",
  },
  percentiles: [
    { dimension: "TECH_REGULATION", label: "기술 규제", percentile: 75, value: 0.5 },
    { dimension: "REDISTRIBUTION", label: "소득 재분배", percentile: 60, value: 0.3 },
    { dimension: "WORK_LIFE", label: "일·생활 균형", percentile: 45, value: 0.1 },
    { dimension: "MERITOCRACY", label: "능력주의", percentile: 30, value: -0.2 },
    { dimension: "TECH_OPTIMISM", label: "기술 낙관", percentile: 70, value: 0.4 },
    { dimension: "OPPORTUNITY_EQUALITY", label: "기회 균등", percentile: 55, value: 0.2 },
  ],
  precision: "initial",
  baselineLabel: "한국 사회조사 데이터 기준 (N=1,500)",
};

describe("ThoughtMapResult", () => {
  it("renders type alias", () => {
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} />);
    expect(screen.getByText("균형 탐색가")).toBeInTheDocument();
  });

  it("renders percentile display", () => {
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} />);
    expect(screen.getAllByText("기술 규제").length).toBeGreaterThanOrEqual(1);
  });

  it("shows precision level", () => {
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} />);
    expect(
      screen.getByText("핵심 질문 기반 초기 프로필"),
    ).toBeInTheDocument();
  });

  it("shows baseline label in percentile display", () => {
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} />);
    expect(
      screen.getByText("한국 사회조사 데이터 기준 (N=1,500)"),
    ).toBeInTheDocument();
  });

  it("shows refined label when precision is refined", () => {
    render(
      <ThoughtMapResult
        data={{ ...SAMPLE_OUTPUT, precision: "refined" }}
      />,
    );
    expect(
      screen.getByText("확장 질문 포함 정밀 프로필"),
    ).toBeInTheDocument();
  });

  it("shows direct precision upsell CTA for initial precision", () => {
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} />);
    expect(
      screen.getByRole("link", {
        name: "정밀도 높이기: 추가 질문으로 결과를 더 정확하게 만들기",
      }),
    ).toBeInTheDocument();
  });

  it("renders primary CTA and recommendation fold", () => {
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} />);

    expect(
      screen.getByRole("link", { name: "대화 상대 찾기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("상황 기반 추천 보기"),
    ).toBeInTheDocument();
  });

  it("emits view and match click events", async () => {
    const onEvent = vi.fn();
    render(<ThoughtMapResult data={SAMPLE_OUTPUT} onEvent={onEvent} />);

    await waitFor(() =>
      expect(onEvent).toHaveBeenCalledWith("thought_map_view"),
    );

    const ctaLink = screen.getByRole("link", { name: "대화 상대 찾기" });
    ctaLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(ctaLink);
    expect(onEvent).toHaveBeenCalledWith("thought_map_cta_match_click");
  });
});
