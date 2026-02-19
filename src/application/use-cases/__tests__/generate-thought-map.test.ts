import { describe, it, expect, vi } from "vitest";
import { GenerateThoughtMapUseCase } from "../generate-thought-map";
import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { StanceResultOutput } from "../../dtos/stance-result-output";
import { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { MapTypeName } from "@/domain/value-objects/map-type";

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

function mockStanceRepository(): StanceRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findBySessionId: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(undefined),
  };
}

describe("GenerateThoughtMapUseCase", () => {
  const sampleResult: StanceResultOutput = {
    sessionId: "sess-1",
    vector: {
      TECH_REGULATION: 0.5,
      REDISTRIBUTION: 0.3,
      WORK_LIFE: 0.1,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.4,
      OPPORTUNITY_EQUALITY: 0.2,
    },
    precision: "initial",
    reasoning: null,
    readiness: 0.5,
  };

  it("generates thought map with percentiles", async () => {
    const baseline = mockBaselineProvider();
    const repo = mockStanceRepository();

    const useCase = new GenerateThoughtMapUseCase({
      baselineProvider: baseline,
      stanceRepository: repo,
    });

    const output = await useCase.execute(sampleResult);

    expect(output.sessionId).toBe("sess-1");
    expect(output.percentiles).toHaveLength(6);
    expect(output.mapType.alias).toBeDefined();
    expect(output.baselineLabel).toContain("한국 사회조사");
  });

  it("calculates percentile for each dimension", async () => {
    const baseline = mockBaselineProvider();
    const repo = mockStanceRepository();

    const useCase = new GenerateThoughtMapUseCase({
      baselineProvider: baseline,
      stanceRepository: repo,
    });

    await useCase.execute(sampleResult);

    expect(baseline.calculatePercentile).toHaveBeenCalledTimes(6);
    expect(baseline.calculatePercentile).toHaveBeenCalledWith(
      StanceDimension.TECH_REGULATION,
      0.5,
    );
  });

  it("saves stance profile to repository", async () => {
    const baseline = mockBaselineProvider();
    const repo = mockStanceRepository();

    const useCase = new GenerateThoughtMapUseCase({
      baselineProvider: baseline,
      stanceRepository: repo,
    });

    await useCase.execute(sampleResult);

    expect(repo.save).toHaveBeenCalledTimes(1);
    const savedProfile = (repo.save as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(savedProfile.sessionId).toBe("sess-1");
    expect(savedProfile.precision).toBe("initial");
  });

  it("classifies neutral vector as BALANCE_SEEKER", async () => {
    const baseline = mockBaselineProvider();
    const repo = mockStanceRepository();

    const useCase = new GenerateThoughtMapUseCase({
      baselineProvider: baseline,
      stanceRepository: repo,
    });

    const neutralResult: StanceResultOutput = {
      ...sampleResult,
      vector: {
        TECH_REGULATION: 0.1,
        REDISTRIBUTION: -0.1,
        WORK_LIFE: 0.05,
        MERITOCRACY: 0,
        TECH_OPTIMISM: -0.05,
        OPPORTUNITY_EQUALITY: 0.1,
      },
    };

    const output = await useCase.execute(neutralResult);
    expect(output.mapType.name).toBe(MapTypeName.BALANCE_SEEKER);
  });

  it("includes dimension labels in Korean", async () => {
    const baseline = mockBaselineProvider();
    const repo = mockStanceRepository();

    const useCase = new GenerateThoughtMapUseCase({
      baselineProvider: baseline,
      stanceRepository: repo,
    });

    const output = await useCase.execute(sampleResult);

    const techRegPercentile = output.percentiles.find(
      (p) => p.dimension === StanceDimension.TECH_REGULATION,
    );
    expect(techRegPercentile?.label).toBe("기술 규제");
  });
});
