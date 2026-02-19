import { describe, it, expect } from "vitest";
import { FeatureFlag } from "../feature-flag";

describe("FeatureFlag", () => {
  it("creates enabled flag with variant", () => {
    const f = FeatureFlag.create({ name: "new-ui", enabled: true, variant: "B" });
    expect(f.name).toBe("new-ui");
    expect(f.enabled).toBe(true);
    expect(f.variant).toBe("B");
  });

  it("disabled flag returns false for all users", () => {
    const f = FeatureFlag.create({ name: "off", enabled: false });
    expect(f.isEnabledForUser(42)).toBe(false);
  });

  it("rollout percentage gates users", () => {
    const f = FeatureFlag.create({ name: "partial", enabled: true, rolloutPercentage: 50 });
    expect(f.isEnabledForUser(25)).toBe(true);
    expect(f.isEnabledForUser(75)).toBe(false);
  });

  it("defaults rollout to 100%", () => {
    const f = FeatureFlag.create({ name: "full", enabled: true });
    expect(f.rolloutPercentage).toBe(100);
  });
});
