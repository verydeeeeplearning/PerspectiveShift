import { AnchorAttribute } from "@/domain/value-objects/anchor-attribute";
import type { AnchorType } from "@/domain/value-objects/anchor-type";
import { DifferenceLevel } from "@/domain/value-objects/difference-level";
import type { EnergyLevelKey } from "@/domain/value-objects/energy-level";

interface CandidateProfile {
  userId: string;
  attributes: { type: AnchorType; value: string }[];
  stanceDistance: number;
}

interface ApplyAnchorFilterInput {
  anchorType: AnchorType;
  anchorValue: string;
  differenceLevel: number; // 0-1: 0=매우 비슷, 1=매우 다름
  energyLevel: EnergyLevelKey;
  candidates: CandidateProfile[];
}

interface FilteredCandidate {
  userId: string;
  stanceDistance: number;
  anchorMatched: boolean;
}

export interface ApplyAnchorFilterResult {
  filtered: FilteredCandidate[];
  totalBefore: number;
  totalAfter: number;
  appliedRange: { min: number; max: number };
}

function getEnergyDifferenceCap(energyLevel: EnergyLevelKey): number {
  if (energyLevel === "LOW") return 0.4;
  if (energyLevel === "NORMAL") return 0.7;
  return 1.0;
}

export class ApplyAnchorFilterUseCase {
  execute(input: ApplyAnchorFilterInput): ApplyAnchorFilterResult {
    const userAnchor = AnchorAttribute.create(input.anchorType, input.anchorValue);
    const difference = DifferenceLevel.create(input.differenceLevel);
    const rangeCap = getEnergyDifferenceCap(input.energyLevel);
    const range = difference.toDistanceRange(rangeCap);
    const appliedRange =
      range.min === range.max
        ? { min: Math.max(0, Math.round((range.max - 0.2) * 1000) / 1000), max: range.max }
        : range;

    const filtered: FilteredCandidate[] = input.candidates
      .map((c) => {
        const candidateAttr = c.attributes.find((a) => a.type === input.anchorType);
        const anchorMatched = candidateAttr
          ? userAnchor.matches(AnchorAttribute.create(candidateAttr.type, candidateAttr.value))
          : false;

        return {
          userId: c.userId,
          stanceDistance: c.stanceDistance,
          anchorMatched,
        };
      })
      .filter(
        (c) =>
          c.anchorMatched &&
          c.stanceDistance >= appliedRange.min &&
          c.stanceDistance <= appliedRange.max,
      );

    return {
      filtered,
      totalBefore: input.candidates.length,
      totalAfter: filtered.length,
      appliedRange,
    };
  }
}
