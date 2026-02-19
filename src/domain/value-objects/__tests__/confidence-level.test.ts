import { describe, it, expect } from "vitest";
import { ConfidenceLevel, CONFIDENCE_LEVELS } from "../confidence-level";
import { InvalidConfidenceLevelError } from "../../errors/domain-errors";

describe("ConfidenceLevel", () => {
  it("creates LOW level", () => {
    const cl = ConfidenceLevel.create("LOW");
    expect(cl.value).toBe("LOW");
    expect(cl.label).toBe("약");
  });

  it("creates MEDIUM level", () => {
    const cl = ConfidenceLevel.create("MEDIUM");
    expect(cl.value).toBe("MEDIUM");
    expect(cl.label).toBe("중");
  });

  it("creates HIGH level", () => {
    const cl = ConfidenceLevel.create("HIGH");
    expect(cl.value).toBe("HIGH");
    expect(cl.label).toBe("강");
  });

  it("throws for invalid value", () => {
    expect(() => ConfidenceLevel.create("INVALID")).toThrow(
      InvalidConfidenceLevelError,
    );
  });

  it("has 3 levels", () => {
    expect(Object.keys(CONFIDENCE_LEVELS)).toHaveLength(3);
  });

  it("equals compares values", () => {
    const a = ConfidenceLevel.create("HIGH");
    const b = ConfidenceLevel.create("HIGH");
    const c = ConfidenceLevel.create("LOW");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("numericValue returns correct ordering", () => {
    expect(ConfidenceLevel.create("LOW").numericValue).toBe(1);
    expect(ConfidenceLevel.create("MEDIUM").numericValue).toBe(2);
    expect(ConfidenceLevel.create("HIGH").numericValue).toBe(3);
  });
});
