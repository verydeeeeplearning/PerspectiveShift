import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ShareCard } from "../result/components/ShareCard";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";

const SAMPLE_OUTPUT: ThoughtMapOutput = {
  sessionId: "sess-share-1",
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
    emoji: "⚖️",
    description: "다양한 관점을 균형 있게 고려합니다.",
  },
  alias: {
    key: "BALANCED_THINKER",
    label: "균형 사색가",
    emoji: "🧭",
    description: "다양한 관점을 고르게 탐색하는 유형",
  },
  percentiles: [
    { dimension: "TECH_REGULATION", label: "기술 규제", percentile: 75, value: 0.5 },
    { dimension: "REDISTRIBUTION", label: "소득 재분배", percentile: 60, value: 0.3 },
    { dimension: "WORK_LIFE", label: "일·생활 균형", percentile: 45, value: 0.1 },
    { dimension: "MERITOCRACY", label: "능력주의", percentile: 30, value: -0.2 },
    { dimension: "TECH_OPTIMISM", label: "기술 낙관", percentile: 70, value: 0.4 },
    { dimension: "OPPORTUNITY_EQUALITY", label: "기회 균등", percentile: 55, value: 0.2 },
  ],
  precision: "refined",
  baselineLabel: "한국 사회조사 데이터 기준 (N=1,500)",
};

describe("ShareCard (result)", () => {
  it("calls onShare when share button is clicked", () => {
    const onShare = vi.fn();
    render(<ShareCard data={SAMPLE_OUTPUT} onShare={onShare} />);

    fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});
