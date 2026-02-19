import { DialogueReplayCard } from "@/domain/value-objects/dialogue-replay-card";

interface GenerateReplayCardInput {
  opponentKeyStatement: string;
  topic: string;
  dialogueId: string;
}

interface GenerateReplayCardResult {
  opponentKeyStatement: string;
  topic: string;
  dialogueId: string;
}

export class GenerateReplayCardUseCase {
  execute(input: GenerateReplayCardInput): GenerateReplayCardResult {
    const card = DialogueReplayCard.create(input);
    return {
      opponentKeyStatement: card.opponentKeyStatement,
      topic: card.topic,
      dialogueId: card.dialogueId,
    };
  }
}
