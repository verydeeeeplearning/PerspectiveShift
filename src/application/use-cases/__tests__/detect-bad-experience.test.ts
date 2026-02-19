import { describe, it, expect } from "vitest";
import { DetectBadExperienceUseCase } from "../detect-bad-experience";

describe("DetectBadExperienceUseCase", () => {
  const uc = new DetectBadExperienceUseCase();

  it("triggers on low feelHeard", () => {
    const r = uc.execute({ feelHeardScore: 10, emotionalCheckinNegative: false });
    expect(r.triggered).toBe(true);
  });

  it("triggers on negative emotional checkin", () => {
    const r = uc.execute({ feelHeardScore: 80, emotionalCheckinNegative: true });
    expect(r.triggered).toBe(true);
  });

  it("does not trigger for normal experience", () => {
    const r = uc.execute({ feelHeardScore: 60, emotionalCheckinNegative: false });
    expect(r.triggered).toBe(false);
  });
});
