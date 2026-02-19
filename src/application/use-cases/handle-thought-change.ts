import { DialogueReplayCard, type ThoughtChangeOption } from "@/domain/value-objects/dialogue-replay-card";

interface HandleThoughtChangeInput {
  opponentKeyStatement: string;
  topic: string;
  dialogueId: string;
  choice: ThoughtChangeOption;
}

interface HandleThoughtChangeResult {
  choice: ThoughtChangeOption;
  shouldPromptReMeasurement: boolean;
}

export class HandleThoughtChangeUseCase {
  execute(input: HandleThoughtChangeInput): HandleThoughtChangeResult {
    const card = DialogueReplayCard.create({
      opponentKeyStatement: input.opponentKeyStatement,
      topic: input.topic,
      dialogueId: input.dialogueId,
    }).respond(input.choice);

    return {
      choice: card.userThoughtChange!,
      shouldPromptReMeasurement: card.shouldPromptReMeasurement,
    };
  }
}
