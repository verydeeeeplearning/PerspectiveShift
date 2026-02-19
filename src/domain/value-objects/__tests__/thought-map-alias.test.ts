import { describe, it, expect } from "vitest";
import {
  THOUGHT_MAP_ALIASES,
  assignAlias,
  getAliasInfo,
} from "../thought-map-alias";
import { StanceVector } from "../../entities/stance-vector";

describe("ThoughtMapAlias", () => {
  it("has 5 alias types", () => {
    expect(Object.keys(THOUGHT_MAP_ALIASES)).toHaveLength(5);
  });

  it("each alias has label, emoji, and description", () => {
    for (const [, info] of Object.entries(THOUGHT_MAP_ALIASES)) {
      expect(info.label).toBeTruthy();
      expect(info.emoji).toBeTruthy();
      expect(info.description).toBeTruthy();
    }
  });

  it("getAliasInfo returns correct info", () => {
    const info = getAliasInfo("CAREFUL_SCALE");
    expect(info.key).toBe("CAREFUL_SCALE");
    expect(info.label).toBe("신중한 저울");
  });
});

describe("assignAlias", () => {
  it("assigns CAREFUL_SCALE when all axes near zero", () => {
    const vector = StanceVector.fromValues({
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: -0.1,
      WORK_LIFE: 0.2,
      MERITOCRACY: 0.0,
      TECH_OPTIMISM: -0.15,
      OPPORTUNITY_EQUALITY: 0.1,
    });
    expect(assignAlias(vector)).toBe("CAREFUL_SCALE");
  });

  it("assigns HOT_DEBATER when many strong positions", () => {
    const vector = StanceVector.fromValues({
      TECH_REGULATION: 0.8,
      REDISTRIBUTION: -0.7,
      WORK_LIFE: 0.9,
      MERITOCRACY: 0.6,
      TECH_OPTIMISM: -0.8,
      OPPORTUNITY_EQUALITY: 0.7,
    });
    expect(assignAlias(vector)).toBe("HOT_DEBATER");
  });

  it("assigns COMPASSLESS_EXPLORER when mixed positions", () => {
    const vector = StanceVector.fromValues({
      TECH_REGULATION: 0.5,
      REDISTRIBUTION: -0.4,
      WORK_LIFE: 0.3,
      MERITOCRACY: -0.5,
      TECH_OPTIMISM: 0.4,
      OPPORTUNITY_EQUALITY: -0.3,
    });
    expect(assignAlias(vector)).toBe("COMPASSLESS_EXPLORER");
  });

  it("assigns UNSHAKABLE_MOUNTAIN when consistent direction", () => {
    const vector = StanceVector.fromValues({
      TECH_REGULATION: 0.6,
      REDISTRIBUTION: 0.5,
      WORK_LIFE: 0.5,
      MERITOCRACY: 0.4,
      TECH_OPTIMISM: 0.5,
      OPPORTUNITY_EQUALITY: 0.5,
    });
    expect(assignAlias(vector)).toBe("UNSHAKABLE_MOUNTAIN");
  });

  it("assigns FLEXIBLE_WAVE as default/flexible case", () => {
    const vector = StanceVector.fromValues({
      TECH_REGULATION: 0.3,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.4,
      MERITOCRACY: 0.1,
      TECH_OPTIMISM: -0.3,
      OPPORTUNITY_EQUALITY: 0.2,
    });
    expect(assignAlias(vector)).toBe("FLEXIBLE_WAVE");
  });
});
