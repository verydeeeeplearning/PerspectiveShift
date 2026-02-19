interface SubmitQuizInput {
  selectedIndex: number;
  correctIndex: number;
  openEndedText: string | null;
}

interface SubmitQuizResult {
  isCorrect: boolean;
  openEndedText: string | null;
  shouldPromptOpenEnded: boolean;
}

export class SubmitQuizAnswerAndTextUseCase {
  execute(input: SubmitQuizInput): SubmitQuizResult {
    const isCorrect = input.selectedIndex === input.correctIndex;
    return {
      isCorrect,
      openEndedText: input.openEndedText?.trim() || null,
      shouldPromptOpenEnded: input.openEndedText === null,
    };
  }
}
