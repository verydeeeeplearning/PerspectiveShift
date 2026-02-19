import { describe, it, expect } from "vitest";
import { DisclosureLevel, DISCLOSURE_LEVEL_LABELS } from "../disclosure-level";
import { InvalidDisclosureLevelError } from "../../errors/domain-errors";

describe("DisclosureLevel", () => {
  it("creates valid level 0", () => {
    const level = DisclosureLevel.create(0);
    expect(level.value).toBe(0);
  });

  it("creates valid level 1", () => {
    const level = DisclosureLevel.create(1);
    expect(level.value).toBe(1);
  });

  it("creates valid level 2", () => {
    const level = DisclosureLevel.create(2);
    expect(level.value).toBe(2);
  });

  it("creates valid level 3", () => {
    const level = DisclosureLevel.create(3);
    expect(level.value).toBe(3);
  });

  it("throws for negative value", () => {
    expect(() => DisclosureLevel.create(-1)).toThrow(
      InvalidDisclosureLevelError,
    );
  });

  it("throws for value > 3", () => {
    expect(() => DisclosureLevel.create(4)).toThrow(
      InvalidDisclosureLevelError,
    );
  });

  it("throws for non-integer value", () => {
    expect(() => DisclosureLevel.create(1.5)).toThrow(
      InvalidDisclosureLevelError,
    );
  });

  describe("label", () => {
    it("returns 익명 for level 0", () => {
      expect(DisclosureLevel.create(0).label).toBe("익명");
    });

    it("returns 유형 공개 for level 1", () => {
      expect(DisclosureLevel.create(1).label).toBe("유형 공개");
    });

    it("returns 스탠스 공개 for level 2", () => {
      expect(DisclosureLevel.create(2).label).toBe("스탠스 공개");
    });

    it("returns 이름 공개 for level 3", () => {
      expect(DisclosureLevel.create(3).label).toBe("이름 공개");
    });
  });

  describe("canEscalateTo", () => {
    it("returns true when target is higher", () => {
      const level0 = DisclosureLevel.create(0);
      const level1 = DisclosureLevel.create(1);
      expect(level0.canEscalateTo(level1)).toBe(true);
    });

    it("returns true when escalating from 1 to 3", () => {
      const level1 = DisclosureLevel.create(1);
      const level3 = DisclosureLevel.create(3);
      expect(level1.canEscalateTo(level3)).toBe(true);
    });

    it("returns false when target is same", () => {
      const level1a = DisclosureLevel.create(1);
      const level1b = DisclosureLevel.create(1);
      expect(level1a.canEscalateTo(level1b)).toBe(false);
    });

    it("returns false when target is lower", () => {
      const level2 = DisclosureLevel.create(2);
      const level1 = DisclosureLevel.create(1);
      expect(level2.canEscalateTo(level1)).toBe(false);
    });
  });

  describe("equals", () => {
    it("returns true for same value", () => {
      const a = DisclosureLevel.create(2);
      const b = DisclosureLevel.create(2);
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different values", () => {
      const a = DisclosureLevel.create(1);
      const b = DisclosureLevel.create(2);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("isHigherThan", () => {
    it("returns true when higher", () => {
      const level2 = DisclosureLevel.create(2);
      const level1 = DisclosureLevel.create(1);
      expect(level2.isHigherThan(level1)).toBe(true);
    });

    it("returns false when equal", () => {
      const a = DisclosureLevel.create(1);
      const b = DisclosureLevel.create(1);
      expect(a.isHigherThan(b)).toBe(false);
    });

    it("returns false when lower", () => {
      const level0 = DisclosureLevel.create(0);
      const level3 = DisclosureLevel.create(3);
      expect(level0.isHigherThan(level3)).toBe(false);
    });
  });

  describe("DISCLOSURE_LEVEL_LABELS", () => {
    it("has labels for all 4 levels", () => {
      expect(Object.keys(DISCLOSURE_LEVEL_LABELS)).toHaveLength(4);
    });
  });
});
