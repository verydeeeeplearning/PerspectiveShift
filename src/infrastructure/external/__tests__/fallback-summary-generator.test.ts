import { describe, it, expect } from "vitest";
import { FallbackSummaryGenerator } from "../fallback-summary-generator";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";

describe("FallbackSummaryGenerator", () => {
  const generator = new FallbackSummaryGenerator();

  it("generateSummary returns template-based response", async () => {
    const turns = [
      DialogueTurn.create({
        id: "t-1",
        sessionId: "s-1",
        step: "POSITION",
        participantId: "alice",
        content: "AI should be regulated",
        createdAt: new Date(),
      }),
      DialogueTurn.create({
        id: "t-2",
        sessionId: "s-1",
        step: "POSITION",
        participantId: "bob",
        content: "Innovation needs freedom",
        createdAt: new Date(),
      }),
    ];

    const result = await generator.generateSummary(turns, "alice", "bob");
    expect(result.keyArguments.participantA).toHaveLength(1);
    expect(result.keyArguments.participantB).toHaveLength(1);
    expect(result.commonGround).toHaveLength(1);
  });

  it("evaluateUnderstanding returns default 0.5", async () => {
    const result = await generator.evaluateUnderstanding("reflection", []);
    expect(result.score).toBe(0.5);
  });
});
