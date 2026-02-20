export type FinalCTAType =
  | "FIND_NEXT_DIALOGUE"
  | "BECOME_FRIENDS"
  | "REST_FOR_TODAY";

export interface FinalCTAContext {
  isAgentDialogue: boolean;
  feelHeardScore: number; // 0-100 slider value
  hasHumanMatch: boolean;
  energyLevel: "HIGH" | "NORMAL" | "LOW";
}

export function determineFinalCTA(ctx: FinalCTAContext): FinalCTAType {
  if (ctx.energyLevel === "LOW") return "REST_FOR_TODAY";
  if (!ctx.isAgentDialogue && ctx.feelHeardScore >= 80) {
    return "BECOME_FRIENDS"; // feelHeard 4+/5 = 80+/100
  }
  return "FIND_NEXT_DIALOGUE";
}

export function getCTALabel(cta: FinalCTAType): string {
  const labels: Record<FinalCTAType, string> = {
    FIND_NEXT_DIALOGUE: "다음 대화 찾기",
    BECOME_FRIENDS: "친구 되기",
    REST_FOR_TODAY: "오늘은 여기까지",
  };
  return labels[cta];
}
