import { JointSummaryCard } from "@/domain/entities/joint-summary-card";

interface BuildJointSummaryCardInput {
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestion?: string | null;
  dialogueId: string;
}

interface BuildJointSummaryCardResult {
  agreedPoints: readonly string[];
  disagreedPoints: readonly string[];
  sharedQuestion: string | null;
  dialogueId: string;
}

export class BuildJointSummaryCardUseCase {
  execute(input: BuildJointSummaryCardInput): BuildJointSummaryCardResult {
    const card = JointSummaryCard.create({
      agreedPoints: input.agreedPoints,
      disagreedPoints: input.disagreedPoints,
      sharedQuestion: input.sharedQuestion ?? null,
      dialogueId: input.dialogueId,
    });
    return {
      agreedPoints: card.agreedPoints,
      disagreedPoints: card.disagreedPoints,
      sharedQuestion: card.sharedQuestion,
      dialogueId: card.dialogueId,
    };
  }
}
