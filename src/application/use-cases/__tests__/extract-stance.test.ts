import { describe, it, expect, vi } from "vitest";
import { ExtractStanceUseCase } from "../extract-stance";
import { Answer } from "@/domain/entities/answer";
import { Question } from "@/domain/entities/question";
import { QuestionType } from "@/domain/value-objects/question-type";
import { StanceDimension } from "@/domain/value-objects/stance-dimension";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";

const QUESTIONS = [
  Question.create({
    id: 1,
    text: "Q1",
    type: QuestionType.OX,
    dimension: StanceDimension.TECH_REGULATION,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 2,
    text: "Q2",
    type: QuestionType.OX,
    dimension: StanceDimension.REDISTRIBUTION,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 3,
    text: "Q3",
    type: QuestionType.OX,
    dimension: StanceDimension.MERITOCRACY,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 4,
    text: "Q4",
    type: QuestionType.RUBRIC,
    dimension: StanceDimension.WORK_LIFE,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 5,
    text: "Q5",
    type: QuestionType.RUBRIC,
    dimension: StanceDimension.TECH_OPTIMISM,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 9,
    text: "Q9",
    type: QuestionType.OPEN_ENDED,
    dimension: StanceDimension.TECH_REGULATION,
    phase: "extended",
    polarity: 1,
  }),
];

function mockPiiScrubber(): PiiScrubber {
  return {
    scrub: vi.fn((text: string) => ({
      scrubbed: text,
      piiDetected: false,
      detectedTypes: [],
    })),
  };
}

function mockLlmExtractor(): LlmStanceExtractor {
  return {
    extract: vi.fn().mockResolvedValue({
      axes: { TECH_REGULATION: -0.5 },
      reasoning: "분석 결과",
      readiness: 0.8,
    }),
  };
}

describe("ExtractStanceUseCase", () => {
  it("extracts stance from core answers only (no LLM)", async () => {
    const piiScrubber = mockPiiScrubber();
    const llmExtractor = mockLlmExtractor();

    const useCase = new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor,
      questions: QUESTIONS,
    });

    const answers = [
      Answer.ox(1, true),
      Answer.ox(2, true),
      Answer.ox(3, false),
      Answer.rubric(4, 5),
      Answer.rubric(5, 4),
    ];

    const result = await useCase.execute("sess-1", answers);

    expect(result.sessionId).toBe("sess-1");
    expect(result.precision).toBe("initial");
    expect(result.vector.TECH_REGULATION).toBe(1);
    expect(result.vector.REDISTRIBUTION).toBe(1);
    expect(result.reasoning).toBeNull();
    expect(llmExtractor.extract).not.toHaveBeenCalled();
  });

  it("uses PII scrubber before LLM for open-ended answers", async () => {
    const piiScrubber = mockPiiScrubber();
    const llmExtractor = mockLlmExtractor();

    const useCase = new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor,
      questions: QUESTIONS,
    });

    const answers = [
      Answer.ox(1, true),
      Answer.ox(2, true),
      Answer.ox(3, false),
      Answer.rubric(4, 5),
      Answer.rubric(5, 4),
      Answer.openEnded(9, "개인정보가 포함된 답변"),
    ];

    const result = await useCase.execute("sess-1", answers);

    expect(piiScrubber.scrub).toHaveBeenCalledWith(
      "개인정보가 포함된 답변",
    );
    expect(llmExtractor.extract).toHaveBeenCalledWith([
      { questionId: 9, scrubbedText: "개인정보가 포함된 답변" },
    ]);
    expect(result.precision).toBe("refined");
    expect(result.reasoning).toBe("분석 결과");
    expect(result.readiness).toBe(0.8);
  });

  it("PII scrubber is called BEFORE LLM extractor", async () => {
    const callOrder: string[] = [];

    const piiScrubber: PiiScrubber = {
      scrub: vi.fn((text: string) => {
        callOrder.push("pii");
        return { scrubbed: text, piiDetected: false, detectedTypes: [] };
      }),
    };

    const llmExtractor: LlmStanceExtractor = {
      extract: vi.fn().mockImplementation(() => {
        callOrder.push("llm");
        return Promise.resolve({
          axes: {},
          reasoning: "",
          readiness: 0.5,
        });
      }),
    };

    const useCase = new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor,
      questions: QUESTIONS,
    });

    const answers = [
      Answer.ox(1, true),
      Answer.ox(2, true),
      Answer.ox(3, true),
      Answer.rubric(4, 3),
      Answer.rubric(5, 3),
      Answer.openEnded(9, "test"),
    ];

    await useCase.execute("sess-1", answers);

    expect(callOrder).toEqual(["pii", "llm"]);
  });

  it("merges LLM axes with code-calculated vector", async () => {
    const piiScrubber = mockPiiScrubber();
    const llmExtractor: LlmStanceExtractor = {
      extract: vi.fn().mockResolvedValue({
        axes: { TECH_REGULATION: -1.0 },
        reasoning: "LLM analysis",
        readiness: 0.7,
      }),
    };

    const useCase = new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor,
      questions: QUESTIONS,
    });

    const answers = [
      Answer.ox(1, true),
      Answer.ox(2, true),
      Answer.ox(3, true),
      Answer.rubric(4, 3),
      Answer.rubric(5, 3),
      Answer.openEnded(9, "서술형 답변"),
    ];

    const result = await useCase.execute("sess-1", answers);

    expect(result.vector.TECH_REGULATION).toBeCloseTo(
      1.0 * 0.7 + -1.0 * 0.3,
      2,
    );
  });
});
