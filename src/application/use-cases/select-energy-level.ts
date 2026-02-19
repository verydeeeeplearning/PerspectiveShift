import {
  EnergyLevel,
  type EnergyLevelKey,
  type MatchAdjustment,
  type MatchingParams,
} from "@/domain/value-objects/energy-level";

export interface EnergyLevelResult {
  key: EnergyLevelKey;
  emoji: string;
  label: string;
  adjustment: MatchAdjustment;
  matchingParams: MatchingParams;
}

export class SelectEnergyLevelUseCase {
  execute(key: EnergyLevelKey): EnergyLevelResult {
    const level = EnergyLevel.create(key);

    return {
      key: level.key,
      emoji: level.emoji,
      label: level.label,
      adjustment: level.matchAdjustment,
      matchingParams: level.getMatchingParams(),
    };
  }
}
