import { QuestionBank } from "@/domain/entities/question-bank";
import {
  QUESTION_PRECISION_CONFIG,
  type QuestionPrecision,
} from "@/domain/value-objects/question-precision";

export interface ChangePrecisionMidwayDeps {
  questionBank: QuestionBank;
}

export interface ChangePrecisionMidwayInput {
  currentPrecision: QuestionPrecision;
  nextPrecision: QuestionPrecision;
  activeQuestionIds: ReadonlyArray<string>;
  answeredCount: number;
}

export interface ChangePrecisionMidwayResult {
  precision: QuestionPrecision;
  questionIds: string[];
  targetQuestionCount: number;
  answeredCount: number;
  remainingCount: number;
  isCompleted: boolean;
}

export class ChangePrecisionMidwayUseCase {
  constructor(private readonly deps: ChangePrecisionMidwayDeps) {}

  async execute(
    input: ChangePrecisionMidwayInput,
  ): Promise<ChangePrecisionMidwayResult> {
    const targetCount = QUESTION_PRECISION_CONFIG[input.nextPrecision].totalQuestions;
    const answeredCount = Math.max(
      0,
      Math.min(input.answeredCount, input.activeQuestionIds.length),
    );

    let nextIds = [...input.activeQuestionIds];

    if (targetCount > nextIds.length) {
      const extension = this.deps.questionBank.sampleExtension(
        targetCount - nextIds.length,
        new Set(nextIds),
      );
      nextIds = [...nextIds, ...extension.map((question) => question.id)];
    } else if (targetCount < nextIds.length) {
      nextIds = nextIds.slice(0, targetCount);
    }

    const effectiveAnsweredCount = Math.min(answeredCount, nextIds.length);
    const remainingCount = Math.max(0, nextIds.length - effectiveAnsweredCount);

    return {
      precision: input.nextPrecision,
      questionIds: nextIds,
      targetQuestionCount: nextIds.length,
      answeredCount: effectiveAnsweredCount,
      remainingCount,
      isCompleted: remainingCount === 0,
    };
  }
}
