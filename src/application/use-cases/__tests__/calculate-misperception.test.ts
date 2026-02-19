import { describe, it, expect, vi } from "vitest";
import { CalculateMisperceptionUseCase } from "../calculate-misperception";
import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import { StanceDimension } from "@/domain/value-objects/stance-dimension";

function mockBaselineProvider(): BaselineProvider {
  return {
    getBaseline: vi.fn().mockReturnValue({
      dimensions: {
        TECH_REGULATION: { mean: 0.1, std: 0.3, sampleSize: 1500 },
        REDISTRIBUTION: { mean: 0.2, std: 0.35, sampleSize: 1500 },
        WORK_LIFE: { mean: 0.15, std: 0.28, sampleSize: 1500 },
        MERITOCRACY: { mean: 0.05, std: 0.32, sampleSize: 1500 },
        TECH_OPTIMISM: { mean: 0.1, std: 0.3, sampleSize: 1500 },
        OPPORTUNITY_EQUALITY: { mean: 0.18, std: 0.33, sampleSize: 1500 },
      },
      label: "한국 사회조사 데이터 기준 (N=1,500)",
    }),
    calculatePercentile: vi.fn().mockReturnValue(65),
    getOppositeDistribution: vi.fn().mockReturnValue(0.3),
  };
}

describe("CalculateMisperceptionUseCase", () => {
  it("calculates misperception for a single dimension", async () => {
    const baseline = mockBaselineProvider();
    const useCase = new CalculateMisperceptionUseCase({ baselineProvider: baseline });

    const output = await useCase.execute({
      sessionId: "sess-1",
      dimension: StanceDimension.TECH_REGULATION,
      prediction: 0.7,
    });

    expect(output.dimension).toBe(StanceDimension.TECH_REGULATION);
    expect(output.userPrediction).toBe(0.7);
    expect(output.actualBaseline).toBe(0.3);
    expect(output.gap).toBeCloseTo(0.4);
    expect(baseline.getOppositeDistribution).toHaveBeenCalledWith(
      StanceDimension.TECH_REGULATION,
      0.7,
    );
  });

  it("returns isAccurate true when gap is small", async () => {
    const baseline = mockBaselineProvider();
    (baseline.getOppositeDistribution as ReturnType<typeof vi.fn>).mockReturnValue(0.12);
    const useCase = new CalculateMisperceptionUseCase({ baselineProvider: baseline });

    const output = await useCase.execute({
      sessionId: "sess-1",
      dimension: StanceDimension.WORK_LIFE,
      prediction: 0.1,
    });

    expect(output.isAccurate).toBe(true);
  });

  it("returns isAccurate false when gap is large", async () => {
    const baseline = mockBaselineProvider();
    (baseline.getOppositeDistribution as ReturnType<typeof vi.fn>).mockReturnValue(-0.5);
    const useCase = new CalculateMisperceptionUseCase({ baselineProvider: baseline });

    const output = await useCase.execute({
      sessionId: "sess-1",
      dimension: StanceDimension.REDISTRIBUTION,
      prediction: 0.5,
    });

    expect(output.isAccurate).toBe(false);
  });

  it("calculates gap percentage correctly", async () => {
    const baseline = mockBaselineProvider();
    (baseline.getOppositeDistribution as ReturnType<typeof vi.fn>).mockReturnValue(0.2);
    const useCase = new CalculateMisperceptionUseCase({ baselineProvider: baseline });

    const output = await useCase.execute({
      sessionId: "sess-1",
      dimension: StanceDimension.MERITOCRACY,
      prediction: 0.8,
    });

    // gap = |0.8 - 0.2| = 0.6, gapPercentage = 0.6 * 50 = 30
    expect(output.gapPercentage).toBe(30);
  });
});
