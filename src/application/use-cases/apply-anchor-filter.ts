import { AnchorAttribute } from "@/domain/value-objects/anchor-attribute";
import type { AnchorType } from "@/domain/value-objects/anchor-type";

interface CandidateProfile {
  userId: string;
  attributes: { type: AnchorType; value: string }[];
  stanceDistance: number;
}

interface ApplyAnchorFilterInput {
  anchorType: AnchorType;
  anchorValue: string;
  differenceSlider: number; // 0-100: 0=매우 비슷, 100=매우 다름
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
}

export class ApplyAnchorFilterUseCase {
  execute(input: ApplyAnchorFilterInput): ApplyAnchorFilterResult {
    const userAnchor = AnchorAttribute.create(input.anchorType, input.anchorValue);
    const differenceThreshold = input.differenceSlider / 100;

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
      .filter((c) => {
        // 앵커 일치 후보 우선, 다름 슬라이더에 따라 stance distance 필터
        if (differenceThreshold < 0.3) {
          // 비슷한 상대 선호: 앵커 일치 + 낮은 stance distance
          return c.anchorMatched && c.stanceDistance <= 0.5;
        } else if (differenceThreshold > 0.7) {
          // 다른 상대 선호: 앵커 일치 불문 + 높은 stance distance
          return c.stanceDistance >= 0.3;
        }
        // 중간: 앵커 일치 우선, 적당한 stance distance
        return c.anchorMatched || c.stanceDistance >= 0.2;
      });

    return {
      filtered,
      totalBefore: input.candidates.length,
      totalAfter: filtered.length,
    };
  }
}
