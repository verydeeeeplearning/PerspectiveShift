export const COACH_METHODS = [
  "POSITION_FIRST",
  "EXPERIENCE_FIRST",
  "QUESTION_FIRST",
] as const;

export type CoachMethodKey = (typeof COACH_METHODS)[number];

interface CoachConfig {
  method: CoachMethodKey;
  label: string;
  template: string;
}

const CONFIGS: CoachConfig[] = [
  {
    method: "POSITION_FIRST",
    label: "입장부터 시작하기",
    template: "저는 이 주제에 대해 ____ 라고 생각합니다.",
  },
  {
    method: "EXPERIENCE_FIRST",
    label: "경험부터 시작하기",
    template: "제가 이런 경험을 한 적이 있는데요, ____",
  },
  {
    method: "QUESTION_FIRST",
    label: "질문부터 시작하기",
    template: "이 주제에 대해 궁금한 게 있는데, ____?",
  },
];

export class CoachSuggestion {
  readonly method: CoachMethodKey;
  readonly label: string;
  readonly template: string;

  private constructor(config: CoachConfig) {
    this.method = config.method;
    this.label = config.label;
    this.template = config.template;
  }

  static all(): CoachSuggestion[] {
    return CONFIGS.map((c) => new CoachSuggestion(c));
  }

  static forMethod(method: CoachMethodKey): CoachSuggestion {
    const config = CONFIGS.find((c) => c.method === method);
    if (!config) {
      throw new Error(`Invalid coach method: ${method}`);
    }
    return new CoachSuggestion(config);
  }
}
