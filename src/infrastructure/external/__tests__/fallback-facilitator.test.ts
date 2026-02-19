import { describe, it, expect } from "vitest";
import { FallbackFacilitator } from "../fallback-facilitator";

describe("FallbackFacilitator", () => {
  const facilitator = new FallbackFacilitator();

  it("checkTone always passes with empty alternatives", async () => {
    const result = await facilitator.checkTone("any content");
    expect(result.passed).toBe(true);
    expect(result.suggestion).toBeNull();
    expect(result.alternatives).toEqual([]);
  });

  it("checkDrift never drifts", async () => {
    const result = await facilitator.checkDrift("any content", "original");
    expect(result.drifted).toBe(false);
    expect(result.suggestion).toBeNull();
  });
});
