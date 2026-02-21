import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type {
  QuestionGenerator,
  PreviousAnswer,
} from "@/domain/interfaces/question-generator";
import type { DynamicQuestionBank } from "@/domain/entities/dynamic-question-bank";
import { GeneratedQuestion } from "@/domain/value-objects/generated-question";
import { BatchGenerationError } from "@/domain/errors/domain-errors";

export interface GenerateNextBatchDeps {
  piiScrubber: PiiScrubber;
  questionGenerator: QuestionGenerator;
  fallbackGenerator: QuestionGenerator;
}

export interface GenerateNextBatchInput {
  bank: DynamicQuestionBank;
  previousAnswers: PreviousAnswer[];
}

export interface GenerateNextBatchResult {
  questions: GeneratedQuestion[];
  batchIndex: number;
  isComplete: boolean;
  usedFallback: boolean;
}

const BATCH_SIZE = 5;

export class GenerateNextBatchUseCase {
  constructor(private readonly deps: GenerateNextBatchDeps) {}

  async execute(input: GenerateNextBatchInput): Promise<GenerateNextBatchResult> {
    const { bank, previousAnswers } = input;

    if (bank.isComplete()) {
      throw new BatchGenerationError("Target question count already reached");
    }

    const batchIndex = bank.batchCount;
    const remaining = bank.remainingCount;
    const batchSize = Math.min(BATCH_SIZE, remaining);
    const targetDimensions = bank.getUncoveredDimensions();
    const excludeIds = bank.getAllQuestionIds();

    // PII scrub answer texts
    const scrubbedAnswers: PreviousAnswer[] = previousAnswers.map((a) => ({
      questionId: a.questionId,
      questionText: a.questionText,
      answerSummary: this.deps.piiScrubber.scrub(a.answerSummary).scrubbed,
    }));

    const context = {
      previousAnswers: scrubbedAnswers,
      targetDimensions,
      excludeQuestionIds: excludeIds,
      batchSize,
      batchIndex,
    };

    let usedFallback = false;
    let batch;

    try {
      batch = await this.deps.questionGenerator.generate(context);
    } catch {
      usedFallback = true;
      batch = await this.deps.fallbackGenerator.generate(context);
    }

    const generatedQuestions = batch.questions.map((q, i) =>
      GeneratedQuestion.create({
        index: i,
        batchIndex,
        text: q.text,
        type: q.type,
        dimension: q.dimension,
        polarity: q.polarity,
      }),
    );

    bank.addBatch(generatedQuestions);

    return {
      questions: generatedQuestions,
      batchIndex,
      isComplete: bank.isComplete(),
      usedFallback,
    };
  }
}
