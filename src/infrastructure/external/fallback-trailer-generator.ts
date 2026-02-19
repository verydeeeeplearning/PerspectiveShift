import type { TrailerGenerator } from "@/domain/interfaces/trailer-generator";
import type { StanceVector } from "@/domain/entities/stance-vector";
import { ConversationTrailer } from "@/domain/value-objects/conversation-trailer";
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  DIMENSION_POLES,
  type StanceDimension,
} from "@/domain/value-objects/stance-dimension";

export class FallbackTrailerGenerator implements TrailerGenerator {
  async generate(
    opponentStance: StanceVector,
    myStance: StanceVector,
    _topic: string,
  ): Promise<ConversationTrailer> {
    // Find dimension with largest absolute difference
    let maxDiff = 0;
    let maxDim: StanceDimension = ALL_DIMENSIONS[0];

    for (const dim of ALL_DIMENSIONS) {
      const diff = Math.abs(
        opponentStance.get(dim).value - myStance.get(dim).value,
      );
      if (diff > maxDiff) {
        maxDiff = diff;
        maxDim = dim;
      }
    }

    // Find the second most different dimension (excluding maxDim)
    let secondDiff = 0;
    let secondDim: StanceDimension = ALL_DIMENSIONS[0];

    for (const dim of ALL_DIMENSIONS) {
      if (dim === maxDim) continue;
      const diff = Math.abs(
        opponentStance.get(dim).value - myStance.get(dim).value,
      );
      if (diff > secondDiff) {
        secondDiff = diff;
        secondDim = dim;
      }
    }

    // Determine direction for line 1
    const opponentValue = opponentStance.get(maxDim).value;
    const poles = DIMENSION_POLES[maxDim];
    const direction = opponentValue >= 0 ? poles.high : poles.low;

    const maxLabel = DIMENSION_LABELS[maxDim];
    const secondLabel = DIMENSION_LABELS[secondDim];

    // Build lines
    const line1 = `${maxLabel}에 대해 ${direction} 쪽이지만,`;
    const line2 = `${secondLabel}에서는 열린 시각을 가져요.`;

    const lines = [line1, line2];

    // Optional line 3 when max diff > 0.5
    if (maxDiff > 0.5) {
      lines.push(`${maxLabel} 포인트가 나올 수 있어요.`);
    }

    const text = lines.join("\n");
    return ConversationTrailer.create(text);
  }
}
