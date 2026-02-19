import { RecoveryAction } from "@/domain/value-objects/recovery-action";
import { RecoveryPromise } from "@/domain/value-objects/recovery-promise";

interface RecoveryRoutineProps {
  dialogueId: string;
  action: RecoveryAction;
  promises: readonly RecoveryPromise[];
  recoveryMode: boolean;
  recoveryBadge?: string;
  autoReleaseCount: number;
}

export class RecoveryRoutine {
  readonly dialogueId: string;
  readonly action: RecoveryAction;
  readonly messages: readonly string[];
  readonly promises: readonly RecoveryPromise[];
  readonly recoveryMode: boolean;
  readonly recoveryBadge?: string;
  readonly autoReleaseCount: number;

  private constructor(props: RecoveryRoutineProps & { messages: string[] }) {
    this.dialogueId = props.dialogueId;
    this.action = props.action;
    this.messages = Object.freeze(props.messages);
    this.promises = Object.freeze([...props.promises]);
    this.recoveryMode = props.recoveryMode;
    this.recoveryBadge = props.recoveryBadge;
    this.autoReleaseCount = props.autoReleaseCount;
  }

  static create(
    dialogueId: string,
    promises: readonly RecoveryPromise[] = RecoveryPromise.defaultSet(),
  ): RecoveryRoutine {
    const action = RecoveryAction.createDefault();
    const messages = [
      "오늘 대화가 불편했다니 속상하네요.",
      "이번 대화는 기록에서 치울게요.",
      "다음에는 가벼운 주제로, 꼼꼼히 확인하며 진행할게요.",
      "지금 당장 새로 시작할 필요 없어요.",
    ];
    return new RecoveryRoutine({
      dialogueId,
      action,
      messages,
      promises,
      recoveryMode: true,
      recoveryBadge: "복구 모드",
      autoReleaseCount: 0,
    });
  }

  advanceRecovery(feelHeardScore: number): RecoveryRoutine {
    const nextCount = this.autoReleaseCount + 1;
    const shouldRelease = feelHeardScore >= 3 || nextCount >= 3;
    if (shouldRelease) {
      return this.release(nextCount);
    }
    return new RecoveryRoutine({
      dialogueId: this.dialogueId,
      action: this.action,
      messages: [...this.messages],
      promises: this.promises,
      recoveryMode: true,
      recoveryBadge: this.recoveryBadge,
      autoReleaseCount: nextCount,
    });
  }

  releaseManually(): RecoveryRoutine {
    return this.release(this.autoReleaseCount);
  }

  private release(autoReleaseCount: number): RecoveryRoutine {
    return new RecoveryRoutine({
      dialogueId: this.dialogueId,
      action: this.action,
      messages: [...this.messages],
      promises: this.promises,
      recoveryMode: false,
      recoveryBadge: undefined,
      autoReleaseCount,
    });
  }
}
