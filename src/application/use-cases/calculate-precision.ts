import {
  PrecisionScore,
  type PrecisionMilestone,
} from "@/domain/value-objects/precision-score";

export interface CalculatePrecisionResult {
  precision: number;
  displayText: string;
  label: string;
  nextMilestone: PrecisionMilestone | null;
}

export class CalculatePrecisionUseCase {
  execute(
    answeredCount: number,
    consistencyScore: number,
  ): CalculatePrecisionResult {
    const score = PrecisionScore.calculate(answeredCount, consistencyScore);

    return {
      precision: score.value,
      displayText: score.displayText,
      label: score.label,
      nextMilestone: score.nextMilestone(),
    };
  }
}
