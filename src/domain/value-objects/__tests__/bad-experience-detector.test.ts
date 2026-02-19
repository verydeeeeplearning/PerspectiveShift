import { describe, it, expect } from "vitest";
import { BadExperienceDetector } from "../bad-experience-detector";

describe("BadExperienceDetector", () => {
  it("triggers when feelHeardScore < 20", () => {
    expect(BadExperienceDetector.shouldTrigger(15, false)).toBe(true);
  });

  it("triggers when emotional checkin is negative", () => {
    expect(BadExperienceDetector.shouldTrigger(80, true)).toBe(true);
  });

  it("does not trigger for normal experience", () => {
    expect(BadExperienceDetector.shouldTrigger(50, false)).toBe(false);
  });

  it("instance triggered property works", () => {
    const d1 = BadExperienceDetector.create({ feelHeardScore: 10, emotionalCheckinNegative: false });
    expect(d1.triggered).toBe(true);
    const d2 = BadExperienceDetector.create({ feelHeardScore: 50, emotionalCheckinNegative: false });
    expect(d2.triggered).toBe(false);
  });
});
