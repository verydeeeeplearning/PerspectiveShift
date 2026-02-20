import type { TuringSide } from "@/domain/entities/turing-guess";

export type TuringRewardType =
  | "correct_human"
  | "correct_ai"
  | "streak_3"
  | "wrong_human_for_ai"
  | "wrong_ai_for_human";

interface TuringRewardProps {
  type: TuringRewardType;
  message: string;
  score: number;
}

export class TuringReward {
  readonly type: TuringRewardType;
  readonly message: string;
  readonly score: number;

  private constructor(props: TuringRewardProps) {
    this.type = props.type;
    this.message = props.message;
    this.score = props.score;
  }

  static create(type: TuringRewardType): TuringReward {
    const rewardMap: Record<TuringRewardType, { message: string; score: number }> = {
      correct_human: {
        message: "사람을 정확히 알아봤어요.",
        score: 10,
      },
      correct_ai: {
        message: "AI를 정확히 알아봤어요.",
        score: 10,
      },
      streak_3: {
        message: "3연속 정답! 날카로운 관찰자예요.",
        score: 20,
      },
      wrong_human_for_ai: {
        message: "AI를 사람으로 봤어요. 인상적인 관점이에요.",
        score: 4,
      },
      wrong_ai_for_human: {
        message: "사람을 AI로 봤어요. 의외의 시각이에요.",
        score: 4,
      },
    };
    const selected = rewardMap[type];
    return new TuringReward({
      type,
      message: selected.message,
      score: selected.score,
    });
  }
}

export function evaluateTuringRewards(input: {
  isCorrect: boolean;
  guess: TuringSide;
  actual: TuringSide;
  streak: number;
}): TuringReward[] {
  const rewards: TuringReward[] = [];

  if (input.isCorrect) {
    rewards.push(
      TuringReward.create(input.actual === "human" ? "correct_human" : "correct_ai"),
    );
    if (input.streak >= 3) {
      rewards.push(TuringReward.create("streak_3"));
    }
    return rewards;
  }

  if (input.guess === "human" && input.actual === "ai") {
    rewards.push(TuringReward.create("wrong_human_for_ai"));
  } else if (input.guess === "ai" && input.actual === "human") {
    rewards.push(TuringReward.create("wrong_ai_for_human"));
  }

  return rewards;
}
