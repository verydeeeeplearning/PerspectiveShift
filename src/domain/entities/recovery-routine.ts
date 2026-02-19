import { RecoveryAction } from "@/domain/value-objects/recovery-action";

interface RecoveryRoutineProps {
  dialogueId: string;
  action: RecoveryAction;
}

export class RecoveryRoutine {
  readonly dialogueId: string;
  readonly action: RecoveryAction;
  readonly messages: readonly string[];

  private constructor(props: RecoveryRoutineProps & { messages: string[] }) {
    this.dialogueId = props.dialogueId;
    this.action = props.action;
    this.messages = Object.freeze(props.messages);
  }

  static create(dialogueId: string): RecoveryRoutine {
    const action = RecoveryAction.createDefault();
    const messages = [
      "오늘 대화가 불편했다니 속상하네요.",
      "이번 대화는 기록에서 치울게요.",
      "다음에는 가벼운 주제로, 꼼꼼히 확인하며 진행할게요.",
      "지금 당장 새로 시작할 필요 없어요.",
    ];
    return new RecoveryRoutine({ dialogueId, action, messages });
  }
}
