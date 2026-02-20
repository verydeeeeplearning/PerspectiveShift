import { describe, it, expect } from "vitest";
import { EvaluateJitaiRulesUseCase } from "../evaluate-jitai-rules";

describe("EvaluateJitaiRulesUseCase", () => {
  const uc = new EvaluateJitaiRulesUseCase();

  it("evaluates rules in defined priority order", () => {
    const result = uc.execute({
      energy: 25,
      idleSeconds: 100,
      deleteCount: 2,
      consecutiveToneChecks: 2,
      feelHeardScore: 1,
      highlightCount: 0,
      quoteCount: 0,
      hasReport: false,
      turnCount: 5,
      currentStep: "POSITION",
    });

    expect(result.map((action) => action.type)).toEqual([
      "break_suggest",
      "recovery",
      "downshift",
      "recovery",
      "coach_highlight",
      "nudge_highlight",
    ]);
  });

  it("returns empty when no rule matches", () => {
    const result = uc.execute({
      energy: 70,
      idleSeconds: 10,
      deleteCount: 0,
      consecutiveToneChecks: 0,
      feelHeardScore: 4,
      highlightCount: 1,
      quoteCount: 1,
      hasReport: false,
      turnCount: 3,
      currentStep: "QUESTION",
    });

    expect(result).toHaveLength(0);
  });

  it("triggers distress when user report exists", () => {
    const result = uc.execute({
      energy: 80,
      idleSeconds: 0,
      deleteCount: 0,
      consecutiveToneChecks: 0,
      feelHeardScore: 5,
      highlightCount: 1,
      quoteCount: 1,
      hasReport: true,
      turnCount: 4,
      currentStep: "REFLECTION",
    });

    expect(result[0]?.type).toBe("break_suggest");
  });
});
