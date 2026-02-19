import { describe, it, expect } from "vitest";
import { DetermineReflectionPolicyUseCase } from "../determine-reflection-policy";

describe("DetermineReflectionPolicyUseCase", () => {
  const uc = new DetermineReflectionPolicyUseCase();

  it("returns steelman optional for first 3 dialogues", () => {
    const result = uc.execute({ dialogueCount: 2, understandingScore: 30 });
    expect(result.isSteelmanForced).toBe(false);
  });

  it("forces steelman after 3 dialogues with low score", () => {
    const result = uc.execute({ dialogueCount: 5, understandingScore: 30 });
    expect(result.isSteelmanForced).toBe(true);
  });

  it("steelman optional after 3 dialogues with high score", () => {
    const result = uc.execute({ dialogueCount: 5, understandingScore: 70 });
    expect(result.isSteelmanForced).toBe(false);
  });

  it("returns all step requirements", () => {
    const result = uc.execute({ dialogueCount: 1, understandingScore: 50 });
    expect(result).toHaveProperty("isQuizRequired");
    expect(result).toHaveProperty("isVerificationRequired");
    expect(result).toHaveProperty("isSteelmanForced");
    expect(result).toHaveProperty("isCommonGroundRequired");
  });

  it("quiz and verification are always required", () => {
    const result = uc.execute({ dialogueCount: 1, understandingScore: 80 });
    expect(result.isQuizRequired).toBe(true);
    expect(result.isVerificationRequired).toBe(true);
  });
});
