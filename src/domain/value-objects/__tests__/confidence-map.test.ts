import { describe, it, expect } from "vitest";
import { ConfidenceMap } from "../confidence-map";
import { ConfidenceLevel } from "../confidence-level";
import { ALL_DIMENSIONS } from "../stance-dimension";

describe("ConfidenceMap", () => {
  it("creates default map with all MEDIUM", () => {
    const map = ConfidenceMap.default();

    for (const dim of ALL_DIMENSIONS) {
      expect(map.get(dim).value).toBe("MEDIUM");
    }
  });

  it("covers all 6 dimensions", () => {
    const map = ConfidenceMap.default();
    expect(ALL_DIMENSIONS).toHaveLength(6);

    for (const dim of ALL_DIMENSIONS) {
      expect(map.get(dim)).toBeDefined();
    }
  });

  it("updates a specific dimension", () => {
    const map = ConfidenceMap.default();
    const updated = map.update("TECH_REGULATION", ConfidenceLevel.create("HIGH"));

    expect(updated.get("TECH_REGULATION").value).toBe("HIGH");
    // Other dimensions unchanged
    expect(updated.get("REDISTRIBUTION").value).toBe("MEDIUM");
  });

  it("is immutable — update returns new instance", () => {
    const original = ConfidenceMap.default();
    const updated = original.update("WORK_LIFE", ConfidenceLevel.create("LOW"));

    expect(original.get("WORK_LIFE").value).toBe("MEDIUM");
    expect(updated.get("WORK_LIFE").value).toBe("LOW");
  });

  it("creates from partial entries", () => {
    const map = ConfidenceMap.fromEntries({
      TECH_REGULATION: "HIGH",
      MERITOCRACY: "LOW",
    });

    expect(map.get("TECH_REGULATION").value).toBe("HIGH");
    expect(map.get("MERITOCRACY").value).toBe("LOW");
    // Unspecified defaults to MEDIUM
    expect(map.get("REDISTRIBUTION").value).toBe("MEDIUM");
  });

  it("toRecord returns plain object", () => {
    const map = ConfidenceMap.default();
    const record = map.toRecord();

    expect(Object.keys(record)).toHaveLength(6);
    for (const dim of ALL_DIMENSIONS) {
      expect(record[dim]).toBe("MEDIUM");
    }
  });
});
