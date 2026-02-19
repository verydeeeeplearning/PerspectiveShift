import { describe, it, expect } from "vitest";
import { StanceDriftPreference } from "../stance-drift-preference";

describe("StanceDriftPreference", () => {
  it("defaults to opted out", () => {
    const p = StanceDriftPreference.createDefault();
    expect(p.optedIn).toBe(false);
  });

  it("opt in and out", () => {
    const p = StanceDriftPreference.createDefault().optIn();
    expect(p.optedIn).toBe(true);
    const p2 = p.optOut();
    expect(p2.optedIn).toBe(false);
  });
});
