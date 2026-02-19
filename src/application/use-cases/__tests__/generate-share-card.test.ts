import { describe, it, expect } from "vitest";
import { GenerateShareCardUseCase } from "../generate-share-card";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

const mockVector: Record<StanceDimension, number> = {
  TECH_REGULATION: 0.8,
  REDISTRIBUTION: 0.6,
  WORK_LIFE: 0.4,
  MERITOCRACY: 0.3,
  TECH_OPTIMISM: 0.7,
  OPPORTUNITY_EQUALITY: 0.5,
};

const mockAlias = {
  key: "BALANCED_THINKER" as const,
  label: "균형 사색가",
  emoji: "🧭",
  description: "다양한 관점을 고르게 탐색하는 유형",
};

describe("GenerateShareCardUseCase", () => {
  const uc = new GenerateShareCardUseCase();

  it("generates alias card", () => {
    const result = uc.execute({
      type: "ALIAS",
      alias: mockAlias,
      vector: mockVector,
    });

    expect(result.type).toBe("ALIAS");
    expect(result.alias).toEqual(mockAlias);
    expect(result.privacyDisclaimer).toBeDefined();
  });

  it("generates thought map card with default top 3 axes", () => {
    const result = uc.execute({
      type: "THOUGHT_MAP",
      vector: mockVector,
    });

    expect(result.type).toBe("THOUGHT_MAP");
    expect(result.selectedAxes).toHaveLength(3);
    expect(result.vectorSubset).toBeDefined();
  });

  it("generates thought map card with custom axes", () => {
    const result = uc.execute({
      type: "THOUGHT_MAP",
      vector: mockVector,
      selectedAxes: ["WORK_LIFE", "MERITOCRACY"],
    });

    expect(result.selectedAxes).toHaveLength(2);
    expect(result.selectedAxes).toContain("WORK_LIFE");
  });

  it("generates misperception card", () => {
    const result = uc.execute({
      type: "MISPERCEPTION",
      vector: mockVector,
      misperception: {
        dimension: "REDISTRIBUTION",
        userPrediction: 0.3,
        actualBaseline: 0.6,
        baselineLabel: "20대 한국인 (KGSS 2024)",
      },
    });

    expect(result.type).toBe("MISPERCEPTION");
    expect(result.misperception).toBeDefined();
    expect(result.misperception!.baselineLabel).toContain("KGSS");
  });

  it("always includes privacy disclaimer", () => {
    const alias = uc.execute({ type: "ALIAS", alias: mockAlias, vector: mockVector });
    const map = uc.execute({ type: "THOUGHT_MAP", vector: mockVector });

    expect(alias.privacyDisclaimer).toContain("개인정보");
    expect(map.privacyDisclaimer).toContain("개인정보");
  });

  it("throws for invalid card type", () => {
    expect(() =>
      uc.execute({ type: "INVALID" as never, vector: mockVector }),
    ).toThrow();
  });
});
