import type { TuringSide } from "@/domain/entities/turing-guess";

export type TuringRewardType =
  | "observer_badge"
  | "sharp_observer"
  | "impressive_view"
  | "unexpected_view";

interface TuringRewardProps {
  type: TuringRewardType;
  message: string;
}

export class TuringReward {
  readonly type: TuringRewardType;
  readonly message: string;

  private constructor(props: TuringRewardProps) {
    this.type = props.type;
    this.message = props.message;
  }

  static create(type: TuringRewardType): TuringReward {
    const messageMap: Record<TuringRewardType, string> = {
      observer_badge: "관찰자 뱃지를 획득했어요.",
      sharp_observer: "3연속 정답! 날카로운 관찰자예요.",
      impressive_view: "AI를 사람으로 봤어요. 인상적인 관점이에요.",
      unexpected_view: "사람을 AI로 봤어요. 의외의 시각이에요.",
    };
    return new TuringReward({
      type,
      message: messageMap[type],
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
    rewards.push(TuringReward.create("observer_badge"));
    if (input.streak >= 3) {
      rewards.push(TuringReward.create("sharp_observer"));
    }
    return rewards;
  }

  if (input.guess === "human" && input.actual === "ai") {
    rewards.push(TuringReward.create("impressive_view"));
  } else if (input.guess === "ai" && input.actual === "human") {
    rewards.push(TuringReward.create("unexpected_view"));
  }

  return rewards;
}
