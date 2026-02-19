import { describe, it, expect } from "vitest";
import { BlindSpotDiscovery } from "../blind-spot-discovery";

describe("BlindSpotDiscovery", () => {
  it("creates with discovered concept", () => {
    const bs = BlindSpotDiscovery.create({ discoveredConcept: "기회비용 개념", dialogueId: "d-1" });
    expect(bs.discoveredConcept).toBe("기회비용 개념");
  });

  it("throws for empty concept", () => {
    expect(() => BlindSpotDiscovery.create({ discoveredConcept: "", dialogueId: "d-1" })).toThrow();
  });

  it("trims whitespace", () => {
    const bs = BlindSpotDiscovery.create({ discoveredConcept: "  개념  ", dialogueId: "d-1" });
    expect(bs.discoveredConcept).toBe("개념");
  });

  it("stores dialogueId", () => {
    const bs = BlindSpotDiscovery.create({ discoveredConcept: "c", dialogueId: "d-42" });
    expect(bs.dialogueId).toBe("d-42");
  });
});
