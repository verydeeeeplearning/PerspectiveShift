import { describe, it, expect } from "vitest";
import { GenerateReflectionQuizUseCase } from "../generate-reflection-quiz";

describe("GenerateReflectionQuizUseCase", () => {
  const uc = new GenerateReflectionQuizUseCase();

  it("generates quiz with 4 options", async () => {
    const result = await uc.execute({ dialogueId: "d-1", opponentKeyPoint: "AI가 일자리를 대체한다" });
    expect(result.options).toHaveLength(4);
    expect(result.correctIndex).toBeGreaterThanOrEqual(0);
    expect(result.correctIndex).toBeLessThan(4);
  });

  it("includes dialogue ID in result", async () => {
    const result = await uc.execute({ dialogueId: "d-99", opponentKeyPoint: "포인트" });
    expect(result.dialogueId).toBe("d-99");
  });

  it("correct option contains opponent key point", async () => {
    const keyPoint = "기술 발전이 불평등을 심화";
    const result = await uc.execute({ dialogueId: "d-1", opponentKeyPoint: keyPoint });
    expect(result.options[result.correctIndex]).toContain(keyPoint);
  });
});
