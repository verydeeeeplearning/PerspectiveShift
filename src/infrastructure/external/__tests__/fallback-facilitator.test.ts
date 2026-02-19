import { describe, it, expect } from "vitest";
import { FallbackFacilitator } from "../fallback-facilitator";

describe("FallbackFacilitator", () => {
  const facilitator = new FallbackFacilitator();

  it("checkTone always passes", async () => {
    const result = await facilitator.checkTone("any content");
    expect(result.passed).toBe(true);
    expect(result.suggestion).toBeNull();
  });

  it("checkDrift never drifts", async () => {
    const result = await facilitator.checkDrift("any content", "original");
    expect(result.drifted).toBe(false);
    expect(result.suggestion).toBeNull();
  });
});
