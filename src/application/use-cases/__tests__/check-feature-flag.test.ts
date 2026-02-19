import { describe, it, expect } from "vitest";
import { CheckFeatureFlagUseCase } from "../check-feature-flag";

describe("CheckFeatureFlagUseCase", () => {
  const uc = new CheckFeatureFlagUseCase();

  it("enabled flag returns true for user in rollout", () => {
    const r = uc.execute({ name: "new-ui", enabled: true, rolloutPercentage: 50, userHash: 25 });
    expect(r.isEnabled).toBe(true);
  });

  it("disabled flag returns false", () => {
    const r = uc.execute({ name: "off", enabled: false, userHash: 10 });
    expect(r.isEnabled).toBe(false);
  });
});
