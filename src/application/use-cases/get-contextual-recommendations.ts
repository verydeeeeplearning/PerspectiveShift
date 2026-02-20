import { ContextualRecommendation } from "@/domain/value-objects/contextual-recommendation";

export interface GetContextualRecommendationsInput {
  isLowPrecision: boolean;
  hasHumanMatchPool: boolean;
  hasMisperceptionTarget: boolean;
}

export class GetContextualRecommendationsUseCase {
  execute(
    input: GetContextualRecommendationsInput,
  ): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];

    if (input.isLowPrecision) {
      recommendations.push(
        new ContextualRecommendation("precision_upsell", "정밀도 높이기", 100),
      );
    }

    if (!input.hasHumanMatchPool) {
      recommendations.push(
        new ContextualRecommendation("ai_practice", "AI 대화", 90),
      );
    }

    if (input.hasMisperceptionTarget) {
      recommendations.push(
        new ContextualRecommendation("misperception", "오해 교정 보기", 80),
      );
    }

    recommendations.push(
      new ContextualRecommendation("share_card", "유형 카드 공유", 70),
    );

    return recommendations.sort((a, b) => b.priority - a.priority);
  }
}
