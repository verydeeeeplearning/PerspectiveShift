import { describe, it, expect } from "vitest";
import { CollectPeakEndKPIUseCase } from "../collect-peak-end-kpi";

describe("CollectPeakEndKPIUseCase", () => {
  const uc = new CollectPeakEndKPIUseCase();

  it("collects KPI and computes derived fields", () => {
    const result = uc.execute({ feelHeardSlider: 80, rematchIntentSlider: 70 });
    expect(result.feelHeardSlider).toBe(80);
    expect(result.rematchIntentSlider).toBe(70);
    expect(result.affectiveWarmth).toBe(70);
    expect(result.isBadExperience).toBe(false);
  });

  it("detects bad experience when feelHeard < 20", () => {
    const result = uc.execute({ feelHeardSlider: 15, rematchIntentSlider: 50 });
    expect(result.isBadExperience).toBe(true);
  });

  it("clamps values to 0-100 range", () => {
    const result = uc.execute({ feelHeardSlider: -10, rematchIntentSlider: 150 });
    expect(result.feelHeardSlider).toBe(0);
    expect(result.rematchIntentSlider).toBe(100);
  });
});
