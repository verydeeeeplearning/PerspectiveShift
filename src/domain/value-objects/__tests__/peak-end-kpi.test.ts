import { describe, it, expect } from "vitest";
import { PeakEndKPI } from "../peak-end-kpi";

describe("PeakEndKPI", () => {
  it("creates with slider values", () => {
    const kpi = PeakEndKPI.create({ feelHeardSlider: 80, rematchIntentSlider: 60 });
    expect(kpi.feelHeardSlider).toBe(80);
    expect(kpi.rematchIntentSlider).toBe(60);
  });

  it("clamps values to 0-100", () => {
    const kpi = PeakEndKPI.create({ feelHeardSlider: -10, rematchIntentSlider: 200 });
    expect(kpi.feelHeardSlider).toBe(0);
    expect(kpi.rematchIntentSlider).toBe(100);
  });

  it("affectiveWarmth proxied from rematchIntent", () => {
    const kpi = PeakEndKPI.create({ feelHeardSlider: 50, rematchIntentSlider: 70 });
    expect(kpi.affectiveWarmth).toBe(70);
  });

  it("isBadExperience when feelHeard < 20", () => {
    const kpi = PeakEndKPI.create({ feelHeardSlider: 15, rematchIntentSlider: 50 });
    expect(kpi.isBadExperience).toBe(true);
  });

  it("not badExperience when feelHeard >= 20", () => {
    const kpi = PeakEndKPI.create({ feelHeardSlider: 50, rematchIntentSlider: 50 });
    expect(kpi.isBadExperience).toBe(false);
  });
});
