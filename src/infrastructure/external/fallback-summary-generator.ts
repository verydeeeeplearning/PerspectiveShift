import type {
  SummaryGenerator,
  SummaryResult,
  UnderstandingResult,
} from "@/domain/interfaces/summary-generator";
import type { DialogueTurn } from "@/domain/entities/dialogue-turn";

export class FallbackSummaryGenerator implements SummaryGenerator {
  async generateSummary(
    turns: DialogueTurn[],
    participantA: string,
    participantB: string,
  ): Promise<SummaryResult> {
    const aTurns = turns.filter((t) => t.participantId === participantA);
    const bTurns = turns.filter((t) => t.participantId === participantB);

    return {
      keyArguments: {
        participantA: aTurns
          .filter((t) => t.step === "POSITION")
          .map((t) => t.content.slice(0, 100)),
        participantB: bTurns
          .filter((t) => t.step === "POSITION")
          .map((t) => t.content.slice(0, 100)),
      },
      commonGround: ["(요약 생성에 LLM이 필요합니다)"],
      unresolvedQuestions: ["(요약 생성에 LLM이 필요합니다)"],
      blindSpots: [],
    };
  }

  async evaluateUnderstanding(
    _reflectionContent: string,
    _opponentTurns: DialogueTurn[],
  ): Promise<UnderstandingResult> {
    return {
      score: 0.5,
      evaluation: "LLM 없이 이해도 평가 불가. 기본값 0.5 적용.",
    };
  }
}
