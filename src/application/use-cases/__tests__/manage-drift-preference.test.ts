import { describe, it, expect } from "vitest";
import { ManageDriftPreferenceUseCase } from "../manage-drift-preference";

describe("ManageDriftPreferenceUseCase", () => {
  const uc = new ManageDriftPreferenceUseCase();

  it("opts in", () => {
    expect(uc.execute({ optIn: true }).optedIn).toBe(true);
  });

  it("opts out", () => {
    expect(uc.execute({ optIn: false }).optedIn).toBe(false);
  });
});
