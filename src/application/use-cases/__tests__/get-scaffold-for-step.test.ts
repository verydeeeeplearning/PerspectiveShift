import { describe, it, expect } from "vitest";
import { GetScaffoldForStepUseCase } from "../get-scaffold-for-step";

describe("GetScaffoldForStepUseCase", () => {
  const uc = new GetScaffoldForStepUseCase();

  it("returns scaffold for POSITION step", () => {
    const result = uc.execute("POSITION");
    expect(result.step).toBe("POSITION");
    expect(result.placeholder).toContain("____");
  });

  it("returns scaffold for QUESTION step", () => {
    const result = uc.execute("QUESTION");
    expect(result.step).toBe("QUESTION");
    expect(result.placeholder.length).toBeGreaterThan(0);
  });

  it("returns empty scaffold for AFFIRMATION", () => {
    const result = uc.execute("AFFIRMATION");
    expect(result.placeholder).toBe("");
  });

  it("returns step and placeholder fields", () => {
    const result = uc.execute("ANSWER");
    expect(result).toHaveProperty("step");
    expect(result).toHaveProperty("placeholder");
  });
});
