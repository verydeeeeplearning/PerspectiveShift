const PRECISION_UPGRADE_THRESHOLD = 80;

export interface ActionItem {
  id: string;
  label: string;
  href: string;
  estimatedMinutes?: number;
}

export interface NextStepResult {
  primary: ActionItem;
  secondary: ActionItem[];
}

interface UserState {
  hasCompletedOnboarding: boolean;
  precisionLevel: number;
  hasActiveDialogue: boolean;
}

export class NextStepAction {
  static determine(state: UserState): NextStepResult {
    const primary: ActionItem = {
      id: "find-match",
      label: "대화 상대 찾기",
      href: "/matching",
    };

    const secondary: ActionItem[] = [];

    if (state.precisionLevel < PRECISION_UPGRADE_THRESHOLD) {
      secondary.push({
        id: "precision-upgrade",
        label: "정밀도 올리기",
        href: "/onboarding?upgrade=true",
        estimatedMinutes: 2,
      });
    }

    secondary.push({
      id: "ai-analysis",
      label: "AI 심층 분석",
      href: "/onboarding/result?analysis=deep",
      estimatedMinutes: 7,
    });

    return { primary, secondary };
  }
}
