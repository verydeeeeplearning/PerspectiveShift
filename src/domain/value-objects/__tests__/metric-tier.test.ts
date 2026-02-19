import { describe, it, expect } from "vitest";
import { MetricTier, METRIC_MAPPINGS, getMetricTier } from "../metric-tier";

describe("MetricTier", () => {
  it("has three tiers", () => {
    expect(MetricTier.EXPERIENCE).toBe("EXPERIENCE");
    expect(MetricTier.COGNITIVE).toBe("COGNITIVE");
    expect(MetricTier.AFFECTIVE).toBe("AFFECTIVE");
  });

  it("maps satisfaction to EXPERIENCE tier", () => {
    expect(getMetricTier("satisfaction")).toBe(MetricTier.EXPERIENCE);
  });

  it("maps feelHeardScore to EXPERIENCE tier", () => {
    expect(getMetricTier("feelHeardScore")).toBe(MetricTier.EXPERIENCE);
  });

  it("maps understandingScore to COGNITIVE tier", () => {
    expect(getMetricTier("understandingScore")).toBe(MetricTier.COGNITIVE);
  });

  it("maps receptiveness to COGNITIVE tier", () => {
    expect(getMetricTier("receptiveness")).toBe(MetricTier.COGNITIVE);
  });

  it("maps affectiveWarmth to AFFECTIVE tier", () => {
    expect(getMetricTier("affectiveWarmth")).toBe(MetricTier.AFFECTIVE);
  });

  it("maps avoidanceReduction to AFFECTIVE tier", () => {
    expect(getMetricTier("avoidanceReduction")).toBe(MetricTier.AFFECTIVE);
  });

  it("has complete mappings for all known metrics", () => {
    expect(Object.keys(METRIC_MAPPINGS).length).toBeGreaterThanOrEqual(6);
  });
});
