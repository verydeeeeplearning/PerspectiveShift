import { JointSummaryCard } from "@/domain/entities/joint-summary-card";

interface BuildJointSummaryCardInput {
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestion?: string | null;
  dialogueId: string;
  // v4 P0-D2 enhanced fields
  topic?: string;
  date?: string;
  myKeyPoint?: string;
  opponentKeyPoint?: string;
  commonGround?: string | null;
  newDiscovery?: string | null;
  understandingScore?: number;
  feelHeardScore?: number;
  autoSaved?: boolean;
}

interface BuildJointSummaryCardResult {
  agreedPoints: readonly string[];
  disagreedPoints: readonly string[];
  sharedQuestion: string | null;
  dialogueId: string;
  // v4 P0-D2 enhanced fields
  topic: string;
  date: string;
  myKeyPoint: string;
  opponentKeyPoint: string;
  commonGround: string | null;
  newDiscovery: string | null;
  understandingScore: number;
  feelHeardScore: number;
  autoSaved: boolean;
}

export class BuildJointSummaryCardUseCase {
  execute(input: BuildJointSummaryCardInput): BuildJointSummaryCardResult {
    const card = JointSummaryCard.create({
      agreedPoints: input.agreedPoints,
      disagreedPoints: input.disagreedPoints,
      sharedQuestion: input.sharedQuestion ?? null,
      dialogueId: input.dialogueId,
      topic: input.topic,
      date: input.date,
      myKeyPoint: input.myKeyPoint,
      opponentKeyPoint: input.opponentKeyPoint,
      commonGround: input.commonGround,
      newDiscovery: input.newDiscovery,
      understandingScore: input.understandingScore,
      feelHeardScore: input.feelHeardScore,
      autoSaved: input.autoSaved,
    });
    return {
      agreedPoints: card.agreedPoints,
      disagreedPoints: card.disagreedPoints,
      sharedQuestion: card.sharedQuestion,
      dialogueId: card.dialogueId,
      topic: card.topic,
      date: card.date,
      myKeyPoint: card.myKeyPoint,
      opponentKeyPoint: card.opponentKeyPoint,
      commonGround: card.commonGround,
      newDiscovery: card.newDiscovery,
      understandingScore: card.understandingScore,
      feelHeardScore: card.feelHeardScore,
      autoSaved: card.autoSaved,
    };
  }
}
