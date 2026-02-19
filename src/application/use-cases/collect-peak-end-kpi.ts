import { PeakEndKPI } from "@/domain/value-objects/peak-end-kpi";

interface CollectPeakEndKPIInput {
  feelHeardSlider: number;
  rematchIntentSlider: number;
  trailerAccuracySlider?: number;
}

interface CollectPeakEndKPIResult {
  feelHeardSlider: number;
  rematchIntentSlider: number;
  trailerAccuracySlider: number;
  affectiveWarmth: number;
  isBadExperience: boolean;
  isTrailerLowQuality: boolean;
}

export class CollectPeakEndKPIUseCase {
  execute(input: CollectPeakEndKPIInput): CollectPeakEndKPIResult {
    const kpi = PeakEndKPI.create({
      feelHeardSlider: input.feelHeardSlider,
      rematchIntentSlider: input.rematchIntentSlider,
      trailerAccuracySlider: input.trailerAccuracySlider,
    });
    return {
      feelHeardSlider: kpi.feelHeardSlider,
      rematchIntentSlider: kpi.rematchIntentSlider,
      trailerAccuracySlider: kpi.trailerAccuracySlider,
      affectiveWarmth: kpi.affectiveWarmth,
      isBadExperience: kpi.isBadExperience,
      isTrailerLowQuality: kpi.isTrailerLowQuality,
    };
  }
}
