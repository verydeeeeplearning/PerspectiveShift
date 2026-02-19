import { describe, it, expect } from "vitest";
import { NextStepAction } from "../next-step-action";

describe("NextStepAction", () => {
  it("returns find-match as primary CTA", () => {
    const actions = NextStepAction.determine({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    expect(actions.primary.id).toBe("find-match");
    expect(actions.primary.label).toContain("대화 상대");
  });

  it("always returns find-match as primary regardless of state", () => {
    const actions = NextStepAction.determine({
      hasCompletedOnboarding: true,
      precisionLevel: 95,
      hasActiveDialogue: true,
    });

    expect(actions.primary.id).toBe("find-match");
  });

  it("includes precision-upgrade as secondary when precision < 80", () => {
    const actions = NextStepAction.determine({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    const secondaryIds = actions.secondary.map((a) => a.id);
    expect(secondaryIds).toContain("precision-upgrade");
  });

  it("excludes precision-upgrade when precision >= 80", () => {
    const actions = NextStepAction.determine({
      hasCompletedOnboarding: true,
      precisionLevel: 95,
      hasActiveDialogue: false,
    });

    const secondaryIds = actions.secondary.map((a) => a.id);
    expect(secondaryIds).not.toContain("precision-upgrade");
  });

  it("includes estimated time in secondary actions", () => {
    const actions = NextStepAction.determine({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    for (const action of actions.secondary) {
      expect(action.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("returns secondary actions sorted by priority", () => {
    const actions = NextStepAction.determine({
      hasCompletedOnboarding: true,
      precisionLevel: 62,
      hasActiveDialogue: false,
    });

    expect(actions.secondary.length).toBeGreaterThanOrEqual(1);
  });
});
