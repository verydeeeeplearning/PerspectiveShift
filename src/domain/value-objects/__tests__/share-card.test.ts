import { describe, it, expect } from "vitest";
import { ShareCard } from "../../entities/share-card";
import type { StanceDimension } from "../stance-dimension";

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

describe("ShareCard", () => {
  describe("ALIAS card", () => {
    it("creates alias card with required fields", () => {
      const card = ShareCard.alias({ alias: mockAlias, topDimensions: ["TECH_REGULATION", "TECH_OPTIMISM"] });

      expect(card.type).toBe("ALIAS");
      expect(card.alias).toEqual(mockAlias);
      expect(card.privacyDisclaimer).toBeDefined();
    });

    it("includes privacy disclaimer", () => {
      const card = ShareCard.alias({ alias: mockAlias, topDimensions: ["TECH_REGULATION"] });

      expect(card.privacyDisclaimer).toContain("개인정보");
    });
  });

  describe("THOUGHT_MAP card", () => {
    it("creates thought map card with selected axes", () => {
      const selectedAxes: StanceDimension[] = ["TECH_REGULATION", "REDISTRIBUTION", "TECH_OPTIMISM"];
      const card = ShareCard.thoughtMap({ vector: mockVector, selectedAxes });

      expect(card.type).toBe("THOUGHT_MAP");
      expect(card.selectedAxes).toHaveLength(3);
      expect(card.vectorSubset).toBeDefined();
    });

    it("defaults to top 3 axes by absolute value when none selected", () => {
      const card = ShareCard.thoughtMap({ vector: mockVector });

      expect(card.selectedAxes).toHaveLength(3);
      // Top 3 by absolute value: TECH_REGULATION(0.8), TECH_OPTIMISM(0.7), REDISTRIBUTION(0.6)
      expect(card.selectedAxes).toContain("TECH_REGULATION");
      expect(card.selectedAxes).toContain("TECH_OPTIMISM");
    });

    it("includes only selected axes in vectorSubset", () => {
      const selectedAxes: StanceDimension[] = ["TECH_REGULATION", "REDISTRIBUTION"];
      const card = ShareCard.thoughtMap({ vector: mockVector, selectedAxes });

      expect(Object.keys(card.vectorSubset!)).toHaveLength(2);
      expect(card.vectorSubset!["TECH_REGULATION"]).toBe(0.8);
    });

    it("includes privacy disclaimer", () => {
      const card = ShareCard.thoughtMap({ vector: mockVector });

      expect(card.privacyDisclaimer).toContain("개인정보");
    });
  });

  describe("MISPERCEPTION card", () => {
    it("creates misperception card with prediction vs actual", () => {
      const card = ShareCard.misperception({
        dimension: "REDISTRIBUTION",
        userPrediction: 0.3,
        actualBaseline: 0.6,
        baselineLabel: "20대 한국인 (KGSS 2024)",
      });

      expect(card.type).toBe("MISPERCEPTION");
      expect(card.misperception).toBeDefined();
      expect(card.misperception!.dimension).toBe("REDISTRIBUTION");
      expect(card.misperception!.gap).toBeCloseTo(0.3, 1);
    });

    it("includes baseline label for transparency", () => {
      const card = ShareCard.misperception({
        dimension: "REDISTRIBUTION",
        userPrediction: 0.3,
        actualBaseline: 0.6,
        baselineLabel: "20대 한국인 (KGSS 2024)",
      });

      expect(card.misperception!.baselineLabel).toContain("KGSS");
    });

    it("includes privacy disclaimer", () => {
      const card = ShareCard.misperception({
        dimension: "REDISTRIBUTION",
        userPrediction: 0.3,
        actualBaseline: 0.6,
        baselineLabel: "20대 한국인",
      });

      expect(card.privacyDisclaimer).toContain("개인정보");
    });
  });
});
