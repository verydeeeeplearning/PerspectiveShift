import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResultPage from "../page";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";

const mockUseSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

const SAMPLE_OUTPUT: ThoughtMapOutput = {
  sessionId: "sess-result-1",
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
    key: "CAREFUL_SCALE",
    label: "신중한 저울",
    emoji: "⚖️",
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

describe("onboarding/result page", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseSearchParams.mockReset();
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    );
  });

  it("caches query result into localStorage", async () => {
    const encoded = encodeURIComponent(JSON.stringify(SAMPLE_OUTPUT));
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => (key === "data" ? encoded : null),
    });

    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("균형 탐색가")).toBeInTheDocument();
    });

    const cached = localStorage.getItem("ps-thought-map");
    expect(cached).toBeTruthy();
    expect(cached).toContain('"sessionId":"sess-result-1"');
  });

  it("restores result from localStorage when query is missing", async () => {
    localStorage.setItem("ps-thought-map", JSON.stringify(SAMPLE_OUTPUT));
    mockUseSearchParams.mockReturnValue({
      get: () => null,
    });

    render(<ResultPage />);

    await waitFor(() => {
      expect(
        screen.getByText("최근 저장된 결과를 불러왔어요."),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("균형 탐색가")).toBeInTheDocument();
  });
});
