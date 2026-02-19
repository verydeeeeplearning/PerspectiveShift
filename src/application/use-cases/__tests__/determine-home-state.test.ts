import { describe, it, expect } from "vitest";
import { DetermineHomeStateUseCase } from "../determine-home-state";

describe("DetermineHomeStateUseCase", () => {
  const uc = new DetermineHomeStateUseCase();

  it("returns FIRST_VISIT for new user", () => {
    const r = uc.execute({
      hasThoughtMap: false, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 0, lastVisitAt: new Date(),
    });
    expect(r.state).toBe("FIRST_VISIT");
  });

  it("returns MAP_COMPLETED after thought map", () => {
    const r = uc.execute({
      hasThoughtMap: true, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 0, lastVisitAt: new Date(),
    });
    expect(r.state).toBe("MAP_COMPLETED");
  });

  it("returns RETURNING_AFTER_14D for dormant user", () => {
    const r = uc.execute({
      hasThoughtMap: true, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 0,
      lastVisitAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    });
    expect(r.state).toBe("RETURNING_AFTER_14D");
  });
});
