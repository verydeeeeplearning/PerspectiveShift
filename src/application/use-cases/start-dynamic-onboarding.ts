import { QuestionBank } from "@/domain/entities/question-bank";
import {
  DynamicQuestionBank,
  type SeedQuestion,
} from "@/domain/entities/dynamic-question-bank";
import {
  QUESTION_PRECISION_CONFIG,
  type QuestionPrecision,
} from "@/domain/value-objects/question-precision";
import type { QuestionType } from "@/domain/value-objects/question-type";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

export interface StartDynamicOnboardingDeps {
  questionBank: QuestionBank;
}

export interface DynamicOnboardingStartResult {
  precision: QuestionPrecision;
  seedQuestions: SeedQuestion[];
  targetTotal: number;
  bank: DynamicQuestionBank;
}

const SEED_COUNT = 10;

export class StartDynamicOnboardingUseCase {
  constructor(private readonly deps: StartDynamicOnboardingDeps) {}

  execute(precision: QuestionPrecision): DynamicOnboardingStartResult {
    const targetTotal = QUESTION_PRECISION_CONFIG[precision].totalQuestions;
    const seedItems = this.deps.questionBank.getSeedQuestions(SEED_COUNT);

    const seeds: SeedQuestion[] = seedItems.map((item) => ({
      id: Number(item.id),
      text: item.text,
      type: item.type as QuestionType,
      dimension: item.axis as StanceDimension,
      polarity: 1,
    }));

    const bank = DynamicQuestionBank.create(seeds, targetTotal);

    return {
      precision,
      seedQuestions: seeds,
      targetTotal,
      bank,
    };
  }
}
