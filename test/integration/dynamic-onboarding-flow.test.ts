import { describe, it, expect } from "vitest";
import { QUESTION_PRECISION_CONFIG, type QuestionPrecision } from "@/domain/value-objects/question-precision";
import { ONBOARDING_MODES } from "@/domain/value-objects/onboarding-mode";
import { DynamicQuestionBank, type SeedQuestion } from "@/domain/entities/dynamic-question-bank";
import { GeneratedQuestion } from "@/domain/value-objects/generated-question";
import { PrecisionScore } from "@/domain/value-objects/precision-score";
import questionsData from "@/infrastructure/external/data/questions.json";
import expandedQuestionsData from "@/infrastructure/external/data/expanded-questions.json";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

describe("Dynamic Onboarding Integration", () => {
  describe("4-tier precision system consistency", () => {
    const TIERS: QuestionPrecision[] = ["lite", "standard", "deep", "comprehensive"];

    it("all tiers have matching config in both OnboardingMode and QuestionPrecision", () => {
      for (const tier of TIERS) {
        const config = QUESTION_PRECISION_CONFIG[tier];
        expect(config).toBeDefined();
        expect(config.totalQuestions).toBeGreaterThan(0);
        expect(config.estimatedMinutes).toBeGreaterThan(0);
        expect(config.label).toBeTruthy();
      }
    });

    it("tier question counts are monotonically increasing", () => {
      const counts = TIERS.map((t) => QUESTION_PRECISION_CONFIG[t].totalQuestions);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]).toBeGreaterThan(counts[i - 1]);
      }
    });

    it("OnboardingMode tiers match QuestionPrecision tiers", () => {
      expect(ONBOARDING_MODES.LITE.questionCount).toBe(
        QUESTION_PRECISION_CONFIG.lite.totalQuestions,
      );
      expect(ONBOARDING_MODES.STANDARD.questionCount).toBe(
        QUESTION_PRECISION_CONFIG.standard.totalQuestions,
      );
      expect(ONBOARDING_MODES.DEEP.questionCount).toBe(
        QUESTION_PRECISION_CONFIG.deep.totalQuestions,
      );
      expect(ONBOARDING_MODES.COMPREHENSIVE.questionCount).toBe(
        QUESTION_PRECISION_CONFIG.comprehensive.totalQuestions,
      );
    });
  });

  describe("seed questions from question pool", () => {
    it("has at least 10 questions available as seeds", () => {
      expect(questionsData.length).toBeGreaterThanOrEqual(10);
    });

    it("seed questions cover multiple dimensions", () => {
      const seeds = questionsData.slice(0, 10);
      const dimensions = new Set(seeds.map((q) => q.dimension));
      expect(dimensions.size).toBeGreaterThanOrEqual(3);
    });

    it("seed questions include both OX and RUBRIC types", () => {
      const seeds = questionsData.slice(0, 10);
      const types = new Set(seeds.map((q) => q.type));
      expect(types.has("OX")).toBe(true);
      expect(types.has("RUBRIC")).toBe(true);
    });
  });

  describe("dynamic question bank flow", () => {
    function createSeeds(): SeedQuestion[] {
      return questionsData.slice(0, 10).map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type as "OX" | "RUBRIC" | "OPEN_ENDED",
        dimension: q.dimension as StanceDimension,
        polarity: q.polarity as 1 | -1,
      }));
    }

    it("LITE tier completes with just seed questions", () => {
      const seeds = createSeeds();
      const bank = DynamicQuestionBank.create(seeds, 10);
      expect(bank.isComplete()).toBe(true);
    });

    it("STANDARD tier needs 2 additional batches after seeds", () => {
      const seeds = createSeeds();
      const bank = DynamicQuestionBank.create(seeds, 20);
      expect(bank.isComplete()).toBe(false);
      expect(bank.remainingCount).toBe(10);

      // Add 2 batches of 5
      for (let b = 0; b < 2; b++) {
        const batch = Array.from({ length: 5 }, (_, i) =>
          GeneratedQuestion.create({
            index: i,
            batchIndex: b,
            text: `gen-q-${b}-${i}`,
            type: "OX",
            dimension: "TECH_OPTIMISM",
            polarity: 1,
          }),
        );
        bank.addBatch(batch);
      }

      expect(bank.isComplete()).toBe(true);
    });

    it("COMPREHENSIVE tier needs 8 additional batches after seeds", () => {
      const seeds = createSeeds();
      const bank = DynamicQuestionBank.create(seeds, 50);
      expect(bank.remainingCount).toBe(40);
    });
  });

  describe("precision score targets for 4-tier system", () => {
    it("10 questions with full consistency yields ~62%", () => {
      const score = PrecisionScore.calculate(10, 1.0);
      expect(score.value).toBeGreaterThanOrEqual(55);
      expect(score.value).toBeLessThanOrEqual(70);
    });

    it("20 questions with full consistency yields ~75%", () => {
      const score = PrecisionScore.calculate(20, 1.0);
      expect(score.value).toBeGreaterThanOrEqual(70);
      expect(score.value).toBeLessThanOrEqual(80);
    });

    it("30 questions with full consistency yields ~88%", () => {
      const score = PrecisionScore.calculate(30, 1.0);
      expect(score.value).toBeGreaterThanOrEqual(82);
      expect(score.value).toBeLessThanOrEqual(95);
    });

    it("50 questions with full consistency yields ~95%", () => {
      const score = PrecisionScore.calculate(50, 1.0);
      expect(score.value).toBeGreaterThanOrEqual(90);
      expect(score.value).toBeLessThanOrEqual(100);
    });
  });

  describe("expanded question pool", () => {
    it("has at least 30 expanded questions", () => {
      expect(expandedQuestionsData.length).toBeGreaterThanOrEqual(30);
    });

    it("combined pool has at least 50 questions for comprehensive tier", () => {
      const total = questionsData.length + expandedQuestionsData.length;
      expect(total).toBeGreaterThanOrEqual(50);
    });

    it("expanded questions cover all 6 dimensions", () => {
      const dimensions = new Set(expandedQuestionsData.map((q) => q.dimension));
      expect(dimensions.size).toBe(6);
    });
  });

  describe("feature flag behavior", () => {
    it("NEXT_PUBLIC_DYNAMIC_QUESTIONS defaults to undefined (static flow)", () => {
      // In test env, the flag is not set
      expect(process.env.NEXT_PUBLIC_DYNAMIC_QUESTIONS).toBeUndefined();
    });
  });
});
