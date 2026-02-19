import { describe, it, expect } from "vitest";
import { SubmitConfidenceInputSchema } from "../confidence-input";

describe("SubmitConfidenceInputSchema", () => {
  it("validates valid input with dimensions", () => {
    const result = SubmitConfidenceInputSchema.safeParse({
      sessionId: "sess-1",
      highConfidenceDimensions: ["TECH_REGULATION", "MERITOCRACY"],
    });
    expect(result.success).toBe(true);
  });

  it("validates empty dimensions array", () => {
    const result = SubmitConfidenceInputSchema.safeParse({
      sessionId: "sess-1",
      highConfidenceDimensions: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid dimension", () => {
    const result = SubmitConfidenceInputSchema.safeParse({
      sessionId: "sess-1",
      highConfidenceDimensions: ["INVALID"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty sessionId", () => {
    const result = SubmitConfidenceInputSchema.safeParse({
      sessionId: "",
      highConfidenceDimensions: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts all 6 dimensions", () => {
    const result = SubmitConfidenceInputSchema.safeParse({
      sessionId: "sess-1",
      highConfidenceDimensions: [
        "TECH_REGULATION",
        "REDISTRIBUTION",
        "WORK_LIFE",
        "MERITOCRACY",
        "TECH_OPTIMISM",
        "OPPORTUNITY_EQUALITY",
      ],
    });
    expect(result.success).toBe(true);
  });
});
