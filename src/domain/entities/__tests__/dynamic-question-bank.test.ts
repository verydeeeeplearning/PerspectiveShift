import { describe, it, expect } from "vitest";
import { DynamicQuestionBank } from "../dynamic-question-bank";
import { GeneratedQuestion } from "../../value-objects/generated-question";
import type { SeedQuestion } from "../dynamic-question-bank";

const SEEDS: SeedQuestion[] = [
  { id: 1, text: "Q1", type: "OX", dimension: "TECH_REGULATION", polarity: 1 },
  { id: 2, text: "Q2", type: "OX", dimension: "REDISTRIBUTION", polarity: 1 },
  { id: 3, text: "Q3", type: "OX", dimension: "MERITOCRACY", polarity: 1 },
  { id: 4, text: "Q4", type: "RUBRIC", dimension: "WORK_LIFE", polarity: 1 },
  { id: 5, text: "Q5", type: "RUBRIC", dimension: "TECH_OPTIMISM", polarity: 1 },
  { id: 6, text: "Q6", type: "OX", dimension: "OPPORTUNITY_EQUALITY", polarity: 1 },
  { id: 7, text: "Q7", type: "RUBRIC", dimension: "TECH_REGULATION", polarity: -1 },
  { id: 8, text: "Q8", type: "RUBRIC", dimension: "REDISTRIBUTION", polarity: 1 },
  { id: 9, text: "Q9", type: "OX", dimension: "WORK_LIFE", polarity: 1 },
  { id: 10, text: "Q10", type: "OX", dimension: "MERITOCRACY", polarity: -1 },
];

function makeBatch(batchIndex: number, count: number = 5): GeneratedQuestion[] {
  const dims = [
    "TECH_REGULATION", "REDISTRIBUTION", "WORK_LIFE",
    "MERITOCRACY", "TECH_OPTIMISM", "OPPORTUNITY_EQUALITY",
  ] as const;

  return Array.from({ length: count }, (_, i) =>
    GeneratedQuestion.create({
      index: i,
      batchIndex,
      text: `Generated Q batch${batchIndex} idx${i}`,
      type: i % 2 === 0 ? "OX" : "RUBRIC",
      dimension: dims[i % dims.length],
      polarity: 1,
    }),
  );
}

describe("DynamicQuestionBank", () => {
  it("creates with seeds and target total", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    expect(bank.seeds).toHaveLength(10);
    expect(bank.totalQuestionCount).toBe(10);
    expect(bank.targetTotal).toBe(20);
    expect(bank.batchCount).toBe(0);
  });

  it("tracks remaining count", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    expect(bank.remainingCount).toBe(10);
    expect(bank.isComplete()).toBe(false);
  });

  it("adds batches and tracks generated questions", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    bank.addBatch(makeBatch(0));
    expect(bank.batchCount).toBe(1);
    expect(bank.generatedQuestionCount).toBe(5);
    expect(bank.totalQuestionCount).toBe(15);
    expect(bank.remainingCount).toBe(5);
  });

  it("reports complete when target is met", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    bank.addBatch(makeBatch(0));
    bank.addBatch(makeBatch(1));
    expect(bank.totalQuestionCount).toBe(20);
    expect(bank.isComplete()).toBe(true);
    expect(bank.remainingCount).toBe(0);
  });

  it("retrieves specific batch by index", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    const batch0 = makeBatch(0);
    const batch1 = makeBatch(1);
    bank.addBatch(batch0);
    bank.addBatch(batch1);

    expect(bank.getBatch(0)).toHaveLength(5);
    expect(bank.getBatch(1)).toHaveLength(5);
    expect(bank.getBatch(2)).toHaveLength(0);
  });

  it("calculates dimension coverage", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    const coverage = bank.getDimensionCoverage();

    expect(coverage).toHaveLength(6);
    const techReg = coverage.find((c) => c.dimension === "TECH_REGULATION");
    expect(techReg).toBeDefined();
    expect(techReg!.questionCount).toBe(2); // Q1 + Q7
  });

  it("identifies under-covered dimensions", () => {
    // Create bank with seeds only covering 2 dimensions
    const biasedSeeds: SeedQuestion[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      text: `Q${i + 1}`,
      type: "OX" as const,
      dimension: i < 8 ? "TECH_REGULATION" as const : "REDISTRIBUTION" as const,
      polarity: 1 as const,
    }));

    const bank = DynamicQuestionBank.create(biasedSeeds, 20);
    const uncovered = bank.getUncoveredDimensions();

    // WORK_LIFE, MERITOCRACY, TECH_OPTIMISM, OPPORTUNITY_EQUALITY should be uncovered
    expect(uncovered.length).toBeGreaterThanOrEqual(4);
    expect(uncovered).toContain("WORK_LIFE");
    expect(uncovered).toContain("MERITOCRACY");
  });

  it("returns all question IDs (seed + generated)", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    bank.addBatch(makeBatch(0));

    const ids = bank.getAllQuestionIds();
    expect(ids).toHaveLength(15);
    expect(ids).toContain("1");
    expect(ids).toContain("gen-0-0");
  });

  it("LITE tier (10q) is complete with seeds only", () => {
    const bank = DynamicQuestionBank.create(SEEDS, 10);
    expect(bank.isComplete()).toBe(true);
    expect(bank.remainingCount).toBe(0);
  });
});
