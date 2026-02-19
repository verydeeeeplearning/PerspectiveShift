export const RECOVERY_PROMISE_TYPES = [
  "topic_change",
  "difficulty_down",
  "time_reduce",
] as const;

export type RecoveryPromiseType = (typeof RECOVERY_PROMISE_TYPES)[number];

export interface RecoveryPromiseProps {
  id: string;
  text: string;
  type: RecoveryPromiseType;
}

export class RecoveryPromise {
  readonly id: string;
  readonly text: string;
  readonly type: RecoveryPromiseType;

  private constructor(props: RecoveryPromiseProps) {
    this.id = props.id;
    this.text = props.text;
    this.type = props.type;
  }

  static create(props: RecoveryPromiseProps): RecoveryPromise {
    if (!props.id.trim()) {
      throw new Error("RecoveryPromise id must not be empty");
    }
    if (!props.text.trim()) {
      throw new Error("RecoveryPromise text must not be empty");
    }
    return new RecoveryPromise(props);
  }

  static defaultSet(): readonly RecoveryPromise[] {
    return [
      RecoveryPromise.create({
        id: "topic-change",
        text: "주제를 더 가벼운 것으로 바꿀게요",
        type: "topic_change",
      }),
      RecoveryPromise.create({
        id: "difficulty-down",
        text: "질문 난이도를 낮춰서 진행할게요",
        type: "difficulty_down",
      }),
      RecoveryPromise.create({
        id: "time-reduce",
        text: "대화 시간을 짧게 조정할게요",
        type: "time_reduce",
      }),
    ];
  }
}
