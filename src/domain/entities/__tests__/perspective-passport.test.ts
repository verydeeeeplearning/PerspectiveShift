import { describe, it, expect } from "vitest";
import { PerspectivePassport } from "../perspective-passport";

describe("PerspectivePassport", () => {
  it("creates empty passport", () => {
    const p = PerspectivePassport.empty();
    expect(p.weeklyExploredCount).toBe(0);
    expect(p.totalExploredCount).toBe(0);
    expect(p.discoveredConcepts).toEqual([]);
  });

  it("addDiscovery increments counts", () => {
    const p = PerspectivePassport.empty().addDiscovery("외부 비용");
    expect(p.weeklyExploredCount).toBe(1);
    expect(p.totalExploredCount).toBe(1);
    expect(p.discoveredConcepts).toEqual(["외부 비용"]);
  });

  it("accumulates multiple discoveries", () => {
    const p = PerspectivePassport.empty()
      .addDiscovery("a")
      .addDiscovery("b");
    expect(p.totalExploredCount).toBe(2);
    expect(p.discoveredConcepts).toEqual(["a", "b"]);
  });
});
