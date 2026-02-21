import type { QuestionType } from "../value-objects/question-type";
import type { StanceDimension } from "../value-objects/stance-dimension";

export interface PreviousAnswer {
  questionId: string;
  questionText: string;
  answerSummary: string;
}

export interface QuestionGenerationContext {
  previousAnswers: PreviousAnswer[];
  targetDimensions: StanceDimension[];
  excludeQuestionIds: string[];
  batchSize: number;
  batchIndex: number;
}

export interface GeneratedQuestionData {
  text: string;
  type: QuestionType;
  dimension: StanceDimension;
  polarity: 1 | -1;
}

export interface GeneratedQuestionBatch {
  questions: GeneratedQuestionData[];
  batchIndex: number;
}

export interface QuestionGenerator {
  generate(context: QuestionGenerationContext): Promise<GeneratedQuestionBatch>;
}
