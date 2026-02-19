export type ReviewChoice = "changed" | "unsure" | "same";
export type ReviewNextAction = "suggest_stance_update" | "recommend_level0" | "recommend_new_topic";

interface ActionConfig {
  action: ReviewNextAction;
  label: string;
  description: string;
}

const RESPONSE_ACTION_MAP: Record<ReviewChoice, ActionConfig> = {
  changed: {
    action: "suggest_stance_update",
    label: "입장 업데이트",
    description: "생각 지도에서 바뀐 부분을 업데이트해보세요",
  },
  unsure: {
    action: "recommend_level0",
    label: "가벼운 대화 추천",
    description: "비슷한 주제로 가벼운 Level 0 대화를 추천해드릴게요",
  },
  same: {
    action: "recommend_new_topic",
    label: "새로운 주제 추천",
    description: "다른 주제로 새로운 관점을 탐색해보세요",
  },
};

export class ReviewResponse {
  readonly choice: ReviewChoice;
  readonly nextAction: ReviewNextAction;
  readonly actionLabel: string;
  readonly actionDescription: string;

  private constructor(choice: ReviewChoice, config: ActionConfig) {
    this.choice = choice;
    this.nextAction = config.action;
    this.actionLabel = config.label;
    this.actionDescription = config.description;
  }

  static from(choice: ReviewChoice): ReviewResponse {
    const config = RESPONSE_ACTION_MAP[choice];
    return new ReviewResponse(choice, config);
  }
}
