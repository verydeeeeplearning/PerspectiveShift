import { describe, it, expect } from "vitest";
import { validateFacilitatorInput, BLOCKED_KEYWORDS } from "../facilitator-safety";

describe("FacilitatorSafety", () => {
  it("accepts clean input", () => {
    expect(() =>
      validateFacilitatorInput("Please suggest a receptive phrasing for this response"),
    ).not.toThrow();
  });

  it("rejects input containing stance_vector", () => {
    expect(() =>
      validateFacilitatorInput("The user's stance_vector is [0.5, -0.3]"),
    ).toThrow(/stance/i);
  });

  it("rejects input containing demographic data", () => {
    expect(() =>
      validateFacilitatorInput("User demographic: age 25, gender male"),
    ).toThrow(/demographic/i);
  });

  it("rejects input containing political_orientation", () => {
    expect(() =>
      validateFacilitatorInput("The user's political_orientation is progressive"),
    ).toThrow(/political_orientation/i);
  });

  it("has comprehensive blocked keyword list", () => {
    expect(BLOCKED_KEYWORDS).toContain("stance_vector");
    expect(BLOCKED_KEYWORDS).toContain("demographic");
    expect(BLOCKED_KEYWORDS).toContain("political_orientation");
    expect(BLOCKED_KEYWORDS).toContain("reasoning_tags");
  });
});
