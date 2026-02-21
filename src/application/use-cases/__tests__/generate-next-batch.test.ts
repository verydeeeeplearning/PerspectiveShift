import { describe, it, expect, vi } from "vitest";
import { GenerateNextBatchUseCase } from "../generate-next-batch";
import { DynamicQuestionBank } from "@/domain/entities/dynamic-question-bank";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type {
  QuestionGenerator,
  QuestionGenerationContext,
  GeneratedQuestionBatch,
} from "@/domain/interfaces/question-generator";
import { BatchGenerationError } from "@/domain/errors/domain-errors";

const SEEDS = [
  { id: 1, text: "Q1", type: "OX" as const, dimension: "TECH_REGULATION" as const, polarity: 1 as const },
  { id: 2, text: "Q2", type: "OX" as const, dimension: "REDISTRIBUTION" as const, polarity: 1 as const },
  { id: 3, text: "Q3", type: "OX" as const, dimension: "MERITOCRACY" as const, polarity: 1 as const },
  { id: 4, text: "Q4", type: "RUBRIC" as const, dimension: "WORK_LIFE" as const, polarity: 1 as const },
  { id: 5, text: "Q5", type: "RUBRIC" as const, dimension: "TECH_OPTIMISM" as const, polarity: 1 as const },
  { id: 6, text: "Q6", type: "OX" as const, dimension: "OPPORTUNITY_EQUALITY" as const, polarity: 1 as const },
  { id: 7, text: "Q7", type: "RUBRIC" as const, dimension: "TECH_REGULATION" as const, polarity: -1 as const },
  { id: 8, text: "Q8", type: "RUBRIC" as const, dimension: "REDISTRIBUTION" as const, polarity: 1 as const },
  { id: 9, text: "Q9", type: "OX" as const, dimension: "WORK_LIFE" as const, polarity: 1 as const },
  { id: 10, text: "Q10", type: "OX" as const, dimension: "MERITOCRACY" as const, polarity: -1 as const },
];

function createMockPiiScrubber(): PiiScrubber {
  return {
    scrub: vi.fn((text: string) => ({
      scrubbed: text,
      piiDetected: false,
      detectedTypes: [],
    })),
  };
}

function createMockGenerator(batch?: Partial<GeneratedQuestionBatch>): QuestionGenerator {
  return {
    generate: vi.fn(async (ctx: QuestionGenerationContext): Promise<GeneratedQuestionBatch> => ({
      batchIndex: ctx.batchIndex,
      questions: Array.from({ length: ctx.batchSize }, (_, i) => ({
        text: `Generated Q${ctx.batchIndex}-${i}`,
        type: "OX" as const,
        dimension: "TECH_REGULATION" as const,
        polarity: 1 as const,
      })),
      ...batch,
    })),
  };
}

function createFailingGenerator(): QuestionGenerator {
  return {
    generate: vi.fn(async () => {
      throw new Error("LLM API failure");
    }),
  };
}

describe("GenerateNextBatchUseCase", () => {
  it("generates a batch of 5 questions", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    const uc = new GenerateNextBatchUseCase({
      piiScrubber: createMockPiiScrubber(),
      questionGenerator: createMockGenerator(),
      fallbackGenerator: createMockGenerator(),
    });

    const result = await uc.execute({
      bank,
      previousAnswers: [
        { questionId: "1", questionText: "Q1", answerSummary: "yes" },
      ],
    });

    expect(result.questions).toHaveLength(5);
    expect(result.batchIndex).toBe(0);
    expect(result.isComplete).toBe(false);
    expect(result.usedFallback).toBe(false);
  });

  it("scrubs PII from previous answers before sending to generator", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    const piiScrubber = createMockPiiScrubber();
    const generator = createMockGenerator();

    const uc = new GenerateNextBatchUseCase({
      piiScrubber,
      questionGenerator: generator,
      fallbackGenerator: createMockGenerator(),
    });

    await uc.execute({
      bank,
      previousAnswers: [
        { questionId: "1", questionText: "Q1", answerSummary: "John's answer" },
      ],
    });

    expect(piiScrubber.scrub).toHaveBeenCalledWith("John's answer");
  });

  it("falls back to fallback generator when primary fails", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 20);
    const fallback = createMockGenerator();

    const uc = new GenerateNextBatchUseCase({
      piiScrubber: createMockPiiScrubber(),
      questionGenerator: createFailingGenerator(),
      fallbackGenerator: fallback,
    });

    const result = await uc.execute({
      bank,
      previousAnswers: [],
    });

    expect(result.usedFallback).toBe(true);
    expect(result.questions).toHaveLength(5);
    expect(fallback.generate).toHaveBeenCalledOnce();
  });

  it("throws when bank is already complete", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 10); // target = seeds, already complete

    const uc = new GenerateNextBatchUseCase({
      piiScrubber: createMockPiiScrubber(),
      questionGenerator: createMockGenerator(),
      fallbackGenerator: createMockGenerator(),
    });

    await expect(
      uc.execute({ bank, previousAnswers: [] }),
    ).rejects.toThrow(BatchGenerationError);
  });

  it("generates correct batch size for remaining count < 5", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 13); // remaining = 3

    const generator = createMockGenerator();
    const uc = new GenerateNextBatchUseCase({
      piiScrubber: createMockPiiScrubber(),
      questionGenerator: generator,
      fallbackGenerator: createMockGenerator(),
    });

    const result = await uc.execute({ bank, previousAnswers: [] });

    expect(result.questions).toHaveLength(3);
    // Verify generator was called with batchSize=3
    expect(generator.generate).toHaveBeenCalledWith(
      expect.objectContaining({ batchSize: 3 }),
    );
  });

  it("marks complete after final batch", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 15);

    const uc = new GenerateNextBatchUseCase({
      piiScrubber: createMockPiiScrubber(),
      questionGenerator: createMockGenerator(),
      fallbackGenerator: createMockGenerator(),
    });

    const result = await uc.execute({ bank, previousAnswers: [] });

    expect(result.questions).toHaveLength(5);
    expect(result.isComplete).toBe(true);
  });

  it("increments batchIndex for successive batches", async () => {
    const bank = DynamicQuestionBank.create(SEEDS, 25);
    const uc = new GenerateNextBatchUseCase({
      piiScrubber: createMockPiiScrubber(),
      questionGenerator: createMockGenerator(),
      fallbackGenerator: createMockGenerator(),
    });

    const r1 = await uc.execute({ bank, previousAnswers: [] });
    const r2 = await uc.execute({ bank, previousAnswers: [] });
    const r3 = await uc.execute({ bank, previousAnswers: [] });

    expect(r1.batchIndex).toBe(0);
    expect(r2.batchIndex).toBe(1);
    expect(r3.batchIndex).toBe(2);
    expect(r3.isComplete).toBe(true);
  });
});
