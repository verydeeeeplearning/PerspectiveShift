import { describe, it, expect } from "vitest";
import { SubmitSelfAffirmationInputSchema } from "../self-affirmation-input";

describe("SubmitSelfAffirmationInputSchema", () => {
  it("validates valid input with coreValue only", () => {
    const result = SubmitSelfAffirmationInputSchema.safeParse({
      sessionId: "sess-1",
      coreValue: "FAIRNESS",
    });
    expect(result.success).toBe(true);
  });

  it("validates valid input with coreValue and experience", () => {
    const result = SubmitSelfAffirmationInputSchema.safeParse({
      sessionId: "sess-1",
      coreValue: "CARING",
      experience: "팀원이 힘들어할 때 먼저 다가간 경험",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid coreValue", () => {
    const result = SubmitSelfAffirmationInputSchema.safeParse({
      sessionId: "sess-1",
      coreValue: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty sessionId", () => {
    const result = SubmitSelfAffirmationInputSchema.safeParse({
      sessionId: "",
      coreValue: "TRUTH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects experience longer than 500 characters", () => {
    const result = SubmitSelfAffirmationInputSchema.safeParse({
      sessionId: "sess-1",
      coreValue: "GROWTH",
      experience: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts all 8 valid core values", () => {
    const values = [
      "FAIRNESS", "FREEDOM", "CARING", "ACHIEVEMENT",
      "SAFETY", "TRUTH", "RESPONSIBILITY", "GROWTH",
    ];
    for (const v of values) {
      const result = SubmitSelfAffirmationInputSchema.safeParse({
        sessionId: "sess-1",
        coreValue: v,
      });
      expect(result.success).toBe(true);
    }
  });
});
