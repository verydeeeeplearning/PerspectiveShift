import { describe, it, expect } from "vitest";
import { CoreValue, CORE_VALUES } from "../core-value";
import { InvalidCoreValueError } from "../../errors/domain-errors";

describe("CoreValue", () => {
  it("creates from valid value key", () => {
    const cv = CoreValue.create("FAIRNESS");
    expect(cv.value).toBe("FAIRNESS");
    expect(cv.label).toBe("공정");
  });

  it("creates all 8 valid core values", () => {
    const keys = Object.keys(CORE_VALUES);
    expect(keys).toHaveLength(8);

    for (const key of keys) {
      const cv = CoreValue.create(key);
      expect(cv.value).toBe(key);
      expect(cv.label).toBeTruthy();
    }
  });

  it("provides correct Korean labels", () => {
    expect(CoreValue.create("FAIRNESS").label).toBe("공정");
    expect(CoreValue.create("FREEDOM").label).toBe("자유");
    expect(CoreValue.create("CARING").label).toBe("배려");
    expect(CoreValue.create("ACHIEVEMENT").label).toBe("성취");
    expect(CoreValue.create("SAFETY").label).toBe("안전");
    expect(CoreValue.create("TRUTH").label).toBe("진실");
    expect(CoreValue.create("RESPONSIBILITY").label).toBe("책임");
    expect(CoreValue.create("GROWTH").label).toBe("성장");
  });

  it("throws for invalid value", () => {
    expect(() => CoreValue.create("INVALID")).toThrow(InvalidCoreValueError);
  });

  it("throws for empty string", () => {
    expect(() => CoreValue.create("")).toThrow(InvalidCoreValueError);
  });

  it("equals compares values", () => {
    const a = CoreValue.create("FAIRNESS");
    const b = CoreValue.create("FAIRNESS");
    const c = CoreValue.create("FREEDOM");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("allValues returns all 8 core values", () => {
    const all = CoreValue.allValues();
    expect(all).toHaveLength(8);
    expect(all.every((cv) => cv instanceof CoreValue)).toBe(true);
  });
});
