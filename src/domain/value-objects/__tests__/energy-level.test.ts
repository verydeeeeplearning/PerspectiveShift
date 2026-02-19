import { describe, it, expect } from "vitest";
import { EnergyLevel } from "../energy-level";

describe("EnergyLevel", () => {
  it("creates HIGH level", () => {
    const level = EnergyLevel.create("HIGH");
    expect(level.key).toBe("HIGH");
    expect(level.emoji).toBe("🔋🔋🔋");
  });

  it("creates NORMAL level (default)", () => {
    const level = EnergyLevel.create("NORMAL");
    expect(level.key).toBe("NORMAL");
    expect(level.emoji).toBe("🔋🔋");
  });

  it("creates LOW level", () => {
    const level = EnergyLevel.create("LOW");
    expect(level.key).toBe("LOW");
    expect(level.emoji).toBe("🔋");
  });

  it("LOW adjusts distance by -0.1", () => {
    const level = EnergyLevel.create("LOW");
    const adjustment = level.matchAdjustment;
    expect(adjustment.distanceDelta).toBe(-0.1);
  });

  it("LOW adjusts level by -1", () => {
    const level = EnergyLevel.create("LOW");
    const adjustment = level.matchAdjustment;
    expect(adjustment.levelDelta).toBe(-1);
  });

  it("NORMAL has zero adjustments", () => {
    const level = EnergyLevel.create("NORMAL");
    const adjustment = level.matchAdjustment;
    expect(adjustment.distanceDelta).toBe(0);
    expect(adjustment.levelDelta).toBe(0);
  });

  it("HIGH has zero adjustments", () => {
    const level = EnergyLevel.create("HIGH");
    expect(level.matchAdjustment.distanceDelta).toBe(0);
  });

  it("LOW has custom description text", () => {
    const level = EnergyLevel.create("LOW");
    expect(level.label).toContain("가볍게");
  });

  it("returns matching params for HIGH", () => {
    const level = EnergyLevel.create("HIGH");
    const params = level.getMatchingParams();

    expect(params.timeBudgetMinutes).toBe(15);
    expect(params.difficultyRange).toEqual([2, 3]);
    expect(params.scaffoldingLevel).toBe("minimal");
  });

  it("returns matching params for NORMAL", () => {
    const level = EnergyLevel.create("NORMAL");
    const params = level.getMatchingParams();

    expect(params.timeBudgetMinutes).toBe(10);
    expect(params.distanceBand).toEqual([0.2, 0.5]);
    expect(params.scaffoldingLevel).toBe("moderate");
  });

  it("returns matching params for LOW", () => {
    const level = EnergyLevel.create("LOW");
    const params = level.getMatchingParams();

    expect(params.timeBudgetMinutes).toBe(5);
    expect(params.difficultyRange).toEqual([0, 1]);
    expect(params.scaffoldingLevel).toBe("high");
  });

  it("throws for invalid level", () => {
    expect(() => EnergyLevel.create("INVALID" as never)).toThrow();
  });
});
