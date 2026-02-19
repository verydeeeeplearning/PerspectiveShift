const MAX_LENGTH = 200;

interface NextQuestionSaveProps {
  questionText: string;
  linkedToDialogueId: string;
}

export class NextQuestionSave {
  readonly questionText: string;
  readonly linkedToDialogueId: string;

  private constructor(props: NextQuestionSaveProps) {
    this.questionText = props.questionText;
    this.linkedToDialogueId = props.linkedToDialogueId;
  }

  static create(props: NextQuestionSaveProps): NextQuestionSave {
    const trimmed = props.questionText.trim();
    if (!trimmed) throw new Error("questionText must not be empty");
    if (trimmed.length > MAX_LENGTH)
      throw new Error(`questionText must be ${MAX_LENGTH} chars or less`);
    return new NextQuestionSave({
      questionText: trimmed,
      linkedToDialogueId: props.linkedToDialogueId,
    });
  }
}
