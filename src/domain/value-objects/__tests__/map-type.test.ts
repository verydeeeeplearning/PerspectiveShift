import { describe, it, expect } from "vitest";
import {
  MapTypeName,
  classifyMapType,
  getMapTypeInfo,
} from "../map-type";
import { StanceAxis } from "../stance-axis";
import type { StanceDimension } from "../stance-dimension";

function makeAxes(
  values: Record<StanceDimension, number>,
): Record<StanceDimension, StanceAxis> {
  const axes = {} as Record<StanceDimension, StanceAxis>;
  for (const [k, v] of Object.entries(values)) {
    axes[k as StanceDimension] = StanceAxis.create(v);
  }
  return axes;
}

describe("classifyMapType", () => {
  it("returns BALANCE_SEEKER when all axes near zero", () => {
    const axes = makeAxes({
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: -0.1,
      WORK_LIFE: 0.2,
      MERITOCRACY: 0.0,
      TECH_OPTIMISM: -0.2,
      OPPORTUNITY_EQUALITY: 0.15,
    });
    expect(classifyMapType(axes)).toBe(MapTypeName.BALANCE_SEEKER);
  });

  it("returns LIBERTY_INNOVATOR for low regulation, low redistribution, high tech optimism", () => {
    const axes = makeAxes({
      TECH_REGULATION: -0.8,
      REDISTRIBUTION: -0.7,
      WORK_LIFE: -0.3,
      MERITOCRACY: 0.6,
      TECH_OPTIMISM: 0.9,
      OPPORTUNITY_EQUALITY: -0.4,
    });
    expect(classifyMapType(axes)).toBe(MapTypeName.LIBERTY_INNOVATOR);
  });

  it("returns FAIRNESS_GUARDIAN for high redistribution and opportunity equality", () => {
    const axes = makeAxes({
      TECH_REGULATION: 0.3,
      REDISTRIBUTION: 0.8,
      WORK_LIFE: 0.5,
      MERITOCRACY: -0.7,
      TECH_OPTIMISM: 0.0,
      OPPORTUNITY_EQUALITY: 0.9,
    });
    expect(classifyMapType(axes)).toBe(MapTypeName.FAIRNESS_GUARDIAN);
  });

  it("returns TRADITION_STABILIZER for conservative positions", () => {
    const axes = makeAxes({
      TECH_REGULATION: -0.5,
      REDISTRIBUTION: -0.8,
      WORK_LIFE: -0.4,
      MERITOCRACY: 0.9,
      TECH_OPTIMISM: -0.3,
      OPPORTUNITY_EQUALITY: -0.7,
    });
    expect(classifyMapType(axes)).toBe(
      MapTypeName.TRADITION_STABILIZER,
    );
  });

  it("returns PRAGMATIC_MEDIATOR for mixed positions without strong opinions", () => {
    const axes = makeAxes({
      TECH_REGULATION: 0.4,
      REDISTRIBUTION: -0.4,
      WORK_LIFE: 0.5,
      MERITOCRACY: -0.3,
      TECH_OPTIMISM: 0.4,
      OPPORTUNITY_EQUALITY: -0.5,
    });
    expect(classifyMapType(axes)).toBe(
      MapTypeName.PRAGMATIC_MEDIATOR,
    );
  });
});

describe("getMapTypeInfo", () => {
  it("returns alias and emoji for each type", () => {
    for (const name of Object.values(MapTypeName)) {
      const info = getMapTypeInfo(name);
      expect(info.name).toBe(name);
      expect(info.alias).toBeDefined();
      expect(info.emoji).toBeDefined();
      expect(info.description).toBeDefined();
    }
  });

  it("returns Korean alias for BALANCE_SEEKER", () => {
    const info = getMapTypeInfo(MapTypeName.BALANCE_SEEKER);
    expect(info.alias).toBe("균형 탐색가");
  });
});
