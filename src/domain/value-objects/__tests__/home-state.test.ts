import { describe, it, expect } from "vitest";
import { HomeState } from "../home-state";

describe("HomeState", () => {
  it("returns FIRST_VISIT when no thought map", () => {
    const s = HomeState.determine({
      hasThoughtMap: false, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 0, lastVisitAt: new Date(),
    });
    expect(s.state).toBe("FIRST_VISIT");
  });

  it("returns RETURNING_AFTER_14D when 14+ days since last visit", () => {
    const past = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const s = HomeState.determine({
      hasThoughtMap: true, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 0, lastVisitAt: past,
    });
    expect(s.state).toBe("RETURNING_AFTER_14D");
  });

  it("returns POST_DIALOGUE_D1 within 1 day of dialogue", () => {
    const recent = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const s = HomeState.determine({
      hasThoughtMap: true, hasActiveMatch: false,
      lastDialogueCompletedAt: recent, friendCount: 0, lastVisitAt: new Date(),
    });
    expect(s.state).toBe("POST_DIALOGUE_D1");
  });

  it("returns HAS_FRIENDS when friends exist", () => {
    const s = HomeState.determine({
      hasThoughtMap: true, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 2, lastVisitAt: new Date(),
    });
    expect(s.state).toBe("HAS_FRIENDS");
  });

  it("returns WAITING_MATCH when actively matching", () => {
    const s = HomeState.determine({
      hasThoughtMap: true, hasActiveMatch: true,
      lastDialogueCompletedAt: null, friendCount: 0, lastVisitAt: new Date(),
    });
    expect(s.state).toBe("WAITING_MATCH");
  });

  it("returns MAP_COMPLETED as fallback", () => {
    const s = HomeState.determine({
      hasThoughtMap: true, hasActiveMatch: false,
      lastDialogueCompletedAt: null, friendCount: 0, lastVisitAt: new Date(),
    });
    expect(s.state).toBe("MAP_COMPLETED");
  });
});
