import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import { MisperceptionResult } from "@/domain/value-objects/misperception-result";
import type { MisperceptionInput } from "../dtos/misperception-input";
import type { MisperceptionOutput } from "../dtos/misperception-output";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

export interface CalculateMisperceptionDeps {
  baselineProvider: BaselineProvider;
}

export class CalculateMisperceptionUseCase {
  constructor(private readonly deps: CalculateMisperceptionDeps) {}

  async execute(input: MisperceptionInput): Promise<MisperceptionOutput> {
    const dimension = input.dimension as StanceDimension;
    const actualBaseline = this.deps.baselineProvider.getOppositeDistribution(
      dimension,
      input.prediction,
    );

    const result = MisperceptionResult.create(
      dimension,
      input.prediction,
      actualBaseline,
    );

    return {
      dimension: result.dimension,
      userPrediction: result.userPrediction,
      actualBaseline: result.actualBaseline,
      gap: result.gap,
      gapPercentage: result.gapPercentage,
      isAccurate: result.isAccurate,
    };
  }
}
