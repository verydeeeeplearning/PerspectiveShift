import { describe, it, expect } from "vitest";
import { UpdatePerspectivePassportUseCase } from "../update-perspective-passport";

describe("UpdatePerspectivePassportUseCase", () => {
  const uc = new UpdatePerspectivePassportUseCase();

  it("adds discovery and increments counts", () => {
    const r = uc.execute({
      weeklyExploredCount: 2, totalExploredCount: 10,
      discoveredConcepts: ["a", "b"], newConcept: "c",
    });
    expect(r.weeklyExploredCount).toBe(3);
    expect(r.totalExploredCount).toBe(11);
    expect(r.discoveredConcepts).toEqual(["a", "b", "c"]);
  });
});
