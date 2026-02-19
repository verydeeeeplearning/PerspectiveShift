import { describe, it, expect } from "vitest";
import { Microcopy } from "../microcopy";

describe("Microcopy", () => {
  it("returns copy for context with deterministic index", () => {
    const mc = Microcopy.forContext("loading", 0);
    expect(mc.text).toBe("설득이 아니라, 이해가 목표예요.");
    expect(mc.tone).toBe("safety");
    expect(mc.context).toBe("loading");
  });

  it("wraps around pool with index", () => {
    const mc = Microcopy.forContext("waiting", 6);
    expect(mc.text).toBe("설득이 아니라, 이해가 목표예요.");
  });

  it("allCopies returns 6 predefined entries", () => {
    expect(Microcopy.allCopies().length).toBe(6);
  });

  it("all tones are valid", () => {
    const validTones = ["safety", "autonomy", "curiosity", "competence"];
    Microcopy.allCopies().forEach((c) => {
      expect(validTones).toContain(c.tone);
    });
  });
});
