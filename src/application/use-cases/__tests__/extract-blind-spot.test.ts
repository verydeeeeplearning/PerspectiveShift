import { describe, it, expect } from "vitest";
import { ExtractBlindSpotUseCase } from "../extract-blind-spot";

describe("ExtractBlindSpotUseCase", () => {
  const uc = new ExtractBlindSpotUseCase();

  it("extracts blind spot concept", () => {
    const result = uc.execute({
      discoveredConcept: "외부 비용 내재화",
      dialogueId: "d-1",
    });
    expect(result.discoveredConcept).toBe("외부 비용 내재화");
    expect(result.dialogueId).toBe("d-1");
  });

  it("trims whitespace", () => {
    const result = uc.execute({
      discoveredConcept: "  개념  ",
      dialogueId: "d-2",
    });
    expect(result.discoveredConcept).toBe("개념");
  });

  it("throws on empty concept", () => {
    expect(() =>
      uc.execute({ discoveredConcept: " ", dialogueId: "d-3" }),
    ).toThrow();
  });
});
