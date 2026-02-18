import type { StanceDimension } from "../value-objects/stance-dimension";
import { ALL_DIMENSIONS } from "../value-objects/stance-dimension";
import { StanceVector } from "./stance-vector";
import type { Answer, RubricValue } from "./answer";
import type { Question } from "./question";
import { InsufficientAnswersError } from "../errors/domain-errors";

interface DimensionAccumulator {
  sum: number;
  count: number;
}

export class StanceCalculator {
  static calculateFromAnswers(
    answers: Answer[],
    questions: Question[],
  ): StanceVector {
    const coreQuestions = questions.filter((q) => q.isCore());
    const coreAnswers = answers.filter((a) =>
      coreQuestions.some((q) => q.id === a.questionId),
    );

    if (coreAnswers.length < coreQuestions.length) {
      throw new InsufficientAnswersError(
        coreQuestions.length,
        coreAnswers.length,
      );
    }

    const accumulators = this.buildAccumulators();

    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;
      if (answer.isOpenEnded()) continue;

      const normalized = this.normalizeAnswer(answer, question);
      accumulators[question.dimension].sum += normalized;
      accumulators[question.dimension].count += 1;
    }

    return this.accumulatorsToVector(accumulators);
  }

  static mergeWithLlmAxes(
    codeVector: StanceVector,
    llmAxes: Partial<Record<StanceDimension, number>>,
    weight: number = 0.3,
  ): StanceVector {
    const values = codeVector.toValues();
    for (const [dim, llmValue] of Object.entries(llmAxes)) {
      const d = dim as StanceDimension;
      if (llmValue !== undefined) {
        values[d] = values[d] * (1 - weight) + llmValue * weight;
      }
    }
    return StanceVector.fromValues(values);
  }

  private static normalizeAnswer(
    answer: Answer,
    question: Question,
  ): number {
    if (answer.isOx()) {
      return (answer.value as boolean)
        ? 1.0 * question.polarity
        : -1.0 * question.polarity;
    }

    if (answer.isRubric()) {
      const score = answer.value as RubricValue;
      const normalized = (score - 3) / 2;
      return normalized * question.polarity;
    }

    return 0;
  }

  private static buildAccumulators(): Record<
    StanceDimension,
    DimensionAccumulator
  > {
    const acc = {} as Record<StanceDimension, DimensionAccumulator>;
    for (const dim of ALL_DIMENSIONS) {
      acc[dim] = { sum: 0, count: 0 };
    }
    return acc;
  }

  private static accumulatorsToVector(
    acc: Record<StanceDimension, DimensionAccumulator>,
  ): StanceVector {
    const values = {} as Record<StanceDimension, number>;
    for (const dim of ALL_DIMENSIONS) {
      const { sum, count } = acc[dim];
      values[dim] = count > 0 ? Math.max(-1, Math.min(1, sum / count)) : 0;
    }
    return StanceVector.fromValues(values);
  }
}
