import { describe, it, expect } from "vitest";
import { GenerateReplayCardUseCase } from "../generate-replay-card";

describe("GenerateReplayCardUseCase", () => {
  const uc = new GenerateReplayCardUseCase();

  it("generates replay card", () => {
    const r = uc.execute({ opponentKeyStatement: "핵심 발언", topic: "에너지", dialogueId: "d-1" });
    expect(r.opponentKeyStatement).toBe("핵심 발언");
    expect(r.topic).toBe("에너지");
  });
});
