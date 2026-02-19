import { describe, it, expect } from "vitest";
import {
  EffortGrade,
  EFFORT_GRADES,
  type EffortGradeKey,
} from "../effort-grade";

describe("EffortGrade", () => {
  it("creates QUICK grade (5분)", () => {
    const grade = EffortGrade.create("QUICK");
    expect(grade.key).toBe("QUICK");
    expect(grade.label).toBe("가볍게");
    expect(grade.durationMinutes).toBe(5);
    expect(grade.stepCount).toBe(3);
  });

  it("creates STRUCTURED grade (15분)", () => {
    const grade = EffortGrade.create("STRUCTURED");
    expect(grade.key).toBe("STRUCTURED");
    expect(grade.label).toBe("체계적으로");
    expect(grade.durationMinutes).toBe(15);
    expect(grade.stepCount).toBe(5);
  });

  it("creates DEEP grade (30분+)", () => {
    const grade = EffortGrade.create("DEEP");
    expect(grade.key).toBe("DEEP");
    expect(grade.label).toBe("깊이 있게");
    expect(grade.durationMinutes).toBe(30);
    expect(grade.stepCount).toBe(7);
  });

  it("throws for invalid grade", () => {
    expect(() => EffortGrade.create("INVALID" as EffortGradeKey)).toThrow();
  });

  it("has all 3 grades defined", () => {
    expect(Object.keys(EFFORT_GRADES)).toHaveLength(3);
  });

  it("equals works", () => {
    const a = EffortGrade.create("QUICK");
    const b = EffortGrade.create("QUICK");
    const c = EffortGrade.create("DEEP");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
