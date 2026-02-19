import { describe, it, expect } from "vitest";
import { SelectEnergyLevelUseCase } from "../select-energy-level";

describe("SelectEnergyLevelUseCase", () => {
  const uc = new SelectEnergyLevelUseCase();

  it("returns NORMAL level details", () => {
    const result = uc.execute("NORMAL");
    expect(result.key).toBe("NORMAL");
    expect(result.adjustment.distanceDelta).toBe(0);
  });

  it("returns LOW level with distance adjustment", () => {
    const result = uc.execute("LOW");
    expect(result.key).toBe("LOW");
    expect(result.adjustment.distanceDelta).toBe(-0.1);
    expect(result.adjustment.levelDelta).toBe(-1);
  });

  it("returns HIGH level details", () => {
    const result = uc.execute("HIGH");
    expect(result.key).toBe("HIGH");
    expect(result.adjustment.distanceDelta).toBe(0);
  });

  it("includes emoji and label", () => {
    const result = uc.execute("LOW");
    expect(result.emoji).toBeDefined();
    expect(result.label).toBeDefined();
  });

  it("throws for invalid level", () => {
    expect(() => uc.execute("INVALID" as never)).toThrow();
  });
});
