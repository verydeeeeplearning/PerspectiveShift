interface ExcludeDialogueInput {
  dialogueId: string;
}

interface ExcludeDialogueResult {
  dialogueId: string;
  excluded: boolean;
}

export class ExcludeDialogueFromRecordUseCase {
  execute(input: ExcludeDialogueInput): ExcludeDialogueResult {
    return { dialogueId: input.dialogueId, excluded: true };
  }
}
