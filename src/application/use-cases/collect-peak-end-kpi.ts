import { PeakEndKPI } from "@/domain/value-objects/peak-end-kpi";

interface CollectPeakEndKPIInput {
  feelHeardSlider: number;
  rematchIntentSlider: number;
}

interface CollectPeakEndKPIResult {
  feelHeardSlider: number;
  rematchIntentSlider: number;
  affectiveWarmth: number;
  isBadExperience: boolean;
}

export class CollectPeakEndKPIUseCase {
  execute(input: CollectPeakEndKPIInput): CollectPeakEndKPIResult {
    const kpi = PeakEndKPI.create({
      feelHeardSlider: input.feelHeardSlider,
      rematchIntentSlider: input.rematchIntentSlider,
    });
    return {
      feelHeardSlider: kpi.feelHeardSlider,
      rematchIntentSlider: kpi.rematchIntentSlider,
      affectiveWarmth: kpi.affectiveWarmth,
      isBadExperience: kpi.isBadExperience,
    };
  }
}
