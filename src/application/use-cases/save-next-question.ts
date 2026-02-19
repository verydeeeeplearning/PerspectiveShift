import { NextQuestionSave } from "@/domain/value-objects/next-question-save";

interface SaveNextQuestionInput {
  questionText: string;
  linkedToDialogueId: string;
}

interface SaveNextQuestionResult {
  questionText: string;
  linkedToDialogueId: string;
}

export class SaveNextQuestionUseCase {
  execute(input: SaveNextQuestionInput): SaveNextQuestionResult {
    const nq = NextQuestionSave.create({
      questionText: input.questionText,
      linkedToDialogueId: input.linkedToDialogueId,
    });
    return {
      questionText: nq.questionText,
      linkedToDialogueId: nq.linkedToDialogueId,
    };
  }
}
