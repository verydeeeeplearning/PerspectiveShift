import { describe, it, expect } from "vitest";
import { CheckMatchingPoolUseCase } from "../check-matching-pool";

describe("CheckMatchingPoolUseCase", () => {
  const uc = new CheckMatchingPoolUseCase();

  it("returns hasHumanMatch=true when candidateCount > 0", () => {
    const result = uc.execute({ userId: "user-1", candidateCount: 5 });
    expect(result.hasHumanMatch).toBe(true);
    expect(result.suggestPersona).toBe(false);
  });

  it("returns hasHumanMatch=false and suggestPersona=true when candidateCount is 0", () => {
    const result = uc.execute({ userId: "user-1", candidateCount: 0 });
    expect(result.hasHumanMatch).toBe(false);
    expect(result.suggestPersona).toBe(true);
  });

  it("returns suggestPersona=false when at least 1 candidate exists", () => {
    const result = uc.execute({ userId: "user-1", candidateCount: 1 });
    expect(result.hasHumanMatch).toBe(true);
    expect(result.suggestPersona).toBe(false);
  });

  it("handles large candidateCount", () => {
    const result = uc.execute({ userId: "user-1", candidateCount: 1000 });
    expect(result.hasHumanMatch).toBe(true);
    expect(result.suggestPersona).toBe(false);
  });
});
