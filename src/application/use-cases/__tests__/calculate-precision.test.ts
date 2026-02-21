import { describe, it, expect } from "vitest";
import { CalculatePrecisionUseCase } from "../calculate-precision";

describe("CalculatePrecisionUseCase", () => {
  const uc = new CalculatePrecisionUseCase();

  it("calculates precision for answered questions", () => {
    const result = uc.execute(5, 1.0);

    expect(result.precision).toBeGreaterThan(0);
    expect(result.displayText).toMatch(/\d+%/);
    expect(result.label).toBeDefined();
  });

  it("returns next milestone info when available", () => {
    const result = uc.execute(5, 1.0);

    expect(result.nextMilestone).not.toBeNull();
    expect(result.nextMilestone!.additionalQuestions).toBeGreaterThan(0);
    expect(result.nextMilestone!.estimatedMinutes).toBeGreaterThan(0);
  });

  it("returns null milestone at max precision", () => {
    const result = uc.execute(50, 1.0);

    expect(result.nextMilestone).toBeNull();
  });

  it("precision increases with more answers", () => {
    const r5 = uc.execute(5, 1.0);
    const r10 = uc.execute(10, 1.0);
    const r20 = uc.execute(20, 1.0);

    expect(r10.precision).toBeGreaterThan(r5.precision);
    expect(r20.precision).toBeGreaterThan(r10.precision);
  });
});
