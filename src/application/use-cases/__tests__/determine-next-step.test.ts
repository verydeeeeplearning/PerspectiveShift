import { describe, it, expect } from "vitest";
import { DetermineNextStepUseCase } from "../determine-next-step";

describe("DetermineNextStepUseCase", () => {
  const uc = new DetermineNextStepUseCase();

  it("returns find-match as primary CTA", () => {
    const result = uc.execute({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    expect(result.primary.id).toBe("find-match");
    expect(result.primary.label).toContain("대화 상대");
    expect(result.primary.href).toBe("/matching");
  });

  it("includes precision-upgrade in secondary when low precision", () => {
    const result = uc.execute({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    const ids = result.secondary.map((a) => a.id);
    expect(ids).toContain("precision-upgrade");
  });

  it("excludes precision-upgrade when high precision", () => {
    const result = uc.execute({
      hasCompletedOnboarding: true,
      precisionLevel: 95,
      hasActiveDialogue: false,
    });

    const ids = result.secondary.map((a) => a.id);
    expect(ids).not.toContain("precision-upgrade");
  });

  it("includes ai-analysis in secondary", () => {
    const result = uc.execute({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    const ids = result.secondary.map((a) => a.id);
    expect(ids).toContain("ai-analysis");
  });

  it("all secondary actions have estimated time", () => {
    const result = uc.execute({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    for (const action of result.secondary) {
      expect(action.estimatedMinutes).toBeGreaterThan(0);
    }
  });
});
