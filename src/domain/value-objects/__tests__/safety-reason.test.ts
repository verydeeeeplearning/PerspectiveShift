import { describe, it, expect } from "vitest";
import { SAFETY_REASONS, isValidSafetyReason } from "../safety-reason";
import type { SafetyReason } from "../safety-reason";

describe("SafetyReason", () => {
  it("defines all expected safety reasons", () => {
    expect(SAFETY_REASONS).toEqual([
      "HARASSMENT",
      "THREAT",
      "PII_REQUEST",
      "IMPERSONATION",
      "OTHER",
    ]);
  });

  it("has exactly 5 safety reasons", () => {
    expect(SAFETY_REASONS).toHaveLength(5);
  });

  describe("isValidSafetyReason", () => {
    it("returns true for valid safety reasons", () => {
      for (const reason of SAFETY_REASONS) {
        expect(isValidSafetyReason(reason)).toBe(true);
      }
    });

    it("returns false for invalid string", () => {
      expect(isValidSafetyReason("SPAM")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isValidSafetyReason("")).toBe(false);
    });

    it("returns false for lowercase variant", () => {
      expect(isValidSafetyReason("harassment")).toBe(false);
    });
  });

  it("satisfies SafetyReason type for each constant", () => {
    const reason: SafetyReason = SAFETY_REASONS[0];
    expect(reason).toBe("HARASSMENT");
  });
});
