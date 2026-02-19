export const THOUGHT_CHANGE_OPTIONS = [
  "여전히 잘 모르겠어요",
  "좀 더 생각하게 됐어요",
  "내 생각이 조금 바뀌었어요",
] as const;

export type ThoughtChangeOption = (typeof THOUGHT_CHANGE_OPTIONS)[number];

interface DialogueReplayCardProps {
  opponentKeyStatement: string;
  topic: string;
  dialogueId: string;
}

export class DialogueReplayCard {
  readonly opponentKeyStatement: string;
  readonly topic: string;
  readonly dialogueId: string;
  readonly userThoughtChange: ThoughtChangeOption | null;

  private constructor(
    props: DialogueReplayCardProps & { userThoughtChange: ThoughtChangeOption | null },
  ) {
    this.opponentKeyStatement = props.opponentKeyStatement;
    this.topic = props.topic;
    this.dialogueId = props.dialogueId;
    this.userThoughtChange = props.userThoughtChange;
  }

  static create(props: DialogueReplayCardProps): DialogueReplayCard {
    return new DialogueReplayCard({ ...props, userThoughtChange: null });
  }

  respond(choice: ThoughtChangeOption): DialogueReplayCard {
    return new DialogueReplayCard({
      opponentKeyStatement: this.opponentKeyStatement,
      topic: this.topic,
      dialogueId: this.dialogueId,
      userThoughtChange: choice,
    });
  }

  get shouldPromptReMeasurement(): boolean {
    return this.userThoughtChange === "내 생각이 조금 바뀌었어요";
  }
}
