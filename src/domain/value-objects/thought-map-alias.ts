import type { StanceVector } from "../entities/stance-vector";
import { ALL_DIMENSIONS } from "./stance-dimension";

export const THOUGHT_MAP_ALIASES = {
  CAREFUL_SCALE: {
    label: "신중한 저울",
    emoji: "\u2696\uFE0F",
    description: "여러 관점을 차분하게 저울질하며, 극단보다 균형을 선호합니다.",
  },
  HOT_DEBATER: {
    label: "뜨거운 논객",
    emoji: "\uD83D\uDD25",
    description: "확신이 강하고 분명한 입장을 가지고 있어, 토론에서 빛을 발합니다.",
  },
  COMPASSLESS_EXPLORER: {
    label: "나침반 없는 탐험가",
    emoji: "\uD83E\uDDED",
    description: "주제마다 다른 시각으로 접근하며, 예측 불가능한 관점을 제시합니다.",
  },
  UNSHAKABLE_MOUNTAIN: {
    label: "흔들리지 않는 산",
    emoji: "\u26F0\uFE0F",
    description: "핵심 가치에 일관된 입장을 유지하며, 확고한 신념을 가지고 있습니다.",
  },
  FLEXIBLE_WAVE: {
    label: "유연한 물결",
    emoji: "\uD83C\uDF0A",
    description: "상황에 따라 유연하게 생각을 조율하며, 다양한 맥락을 고려합니다.",
  },
} as const;

export type ThoughtMapAliasKey = keyof typeof THOUGHT_MAP_ALIASES;

export interface ThoughtMapAliasInfo {
  key: ThoughtMapAliasKey;
  label: string;
  emoji: string;
  description: string;
}

export function getAliasInfo(key: ThoughtMapAliasKey): ThoughtMapAliasInfo {
  return { key, ...THOUGHT_MAP_ALIASES[key] };
}

export function assignAlias(vector: StanceVector): ThoughtMapAliasKey {
  const values = vector.toValues();
  const absValues = ALL_DIMENSIONS.map((d) => Math.abs(values[d]));

  const allNearZero = absValues.every((v) => v <= 0.25);
  if (allNearZero) return "CAREFUL_SCALE";

  const strongCount = absValues.filter((v) => v >= 0.6).length;
  if (strongCount >= 3) return "HOT_DEBATER";

  const positiveCount = ALL_DIMENSIONS.filter((d) => values[d] > 0.2).length;
  const negativeCount = ALL_DIMENSIONS.filter((d) => values[d] < -0.2).length;
  const hasMixed = positiveCount >= 2 && negativeCount >= 2;
  if (hasMixed) return "COMPASSLESS_EXPLORER";

  const mean =
    ALL_DIMENSIONS.reduce((sum, d) => sum + values[d], 0) /
    ALL_DIMENSIONS.length;
  const variance =
    ALL_DIMENSIONS.reduce(
      (sum, d) => sum + (values[d] - mean) ** 2,
      0,
    ) / ALL_DIMENSIONS.length;

  if (variance < 0.1 && strongCount >= 1) return "UNSHAKABLE_MOUNTAIN";

  return "FLEXIBLE_WAVE";
}
