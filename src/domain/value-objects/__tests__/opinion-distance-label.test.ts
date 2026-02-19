import { describe, it, expect } from "vitest";
import { OpinionDistanceLabel } from "../opinion-distance-label";

describe("OpinionDistanceLabel", () => {
  it("returns SLIGHT for 0.1~0.2", () => {
    const label = OpinionDistanceLabel.fromDistance(0.15);
    expect(label.level).toBe("SLIGHT");
    expect(label.emoji).toBe("🌱");
    expect(label.shortText).toContain("살짝");
  });

  it("returns MODERATE for 0.2~0.4", () => {
    const label = OpinionDistanceLabel.fromDistance(0.3);
    expect(label.level).toBe("MODERATE");
    expect(label.emoji).toBe("🌊");
  });

  it("returns MEANINGFUL for 0.4~0.6", () => {
    const label = OpinionDistanceLabel.fromDistance(0.5);
    expect(label.level).toBe("MEANINGFUL");
    expect(label.emoji).toBe("⛰️");
  });

  it("returns CHALLENGING for 0.6~0.8", () => {
    const label = OpinionDistanceLabel.fromDistance(0.7);
    expect(label.level).toBe("CHALLENGING");
    expect(label.emoji).toBe("🌋");
  });

  it("returns DISABLED for 0.8~1.0", () => {
    const label = OpinionDistanceLabel.fromDistance(0.9);
    expect(label.level).toBe("DISABLED");
    expect(label.isDisabled).toBe(true);
  });

  it("returns SLIGHT for very small distance (< 0.1)", () => {
    const label = OpinionDistanceLabel.fromDistance(0.05);
    expect(label.level).toBe("SLIGHT");
  });

  it("has description text for each level", () => {
    const label = OpinionDistanceLabel.fromDistance(0.3);
    expect(label.description).toBeDefined();
    expect(label.description.length).toBeGreaterThan(0);
  });

  it("DISABLED level is marked as disabled", () => {
    const label = OpinionDistanceLabel.fromDistance(0.85);
    expect(label.isDisabled).toBe(true);
  });

  it("non-DISABLED levels are not disabled", () => {
    const label = OpinionDistanceLabel.fromDistance(0.5);
    expect(label.isDisabled).toBe(false);
  });

  it("clamps distance to 0~1 range", () => {
    const low = OpinionDistanceLabel.fromDistance(-0.1);
    expect(low.level).toBe("SLIGHT");

    const high = OpinionDistanceLabel.fromDistance(1.5);
    expect(high.level).toBe("DISABLED");
  });
});
