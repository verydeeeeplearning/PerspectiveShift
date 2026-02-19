import { describe, it, expect } from "vitest";
import { springSoft, springSnappy, springGentle, reducedMotion } from "../motion";

describe("motion presets", () => {
  it("springSoft has correct spring parameters", () => {
    expect(springSoft).toEqual({
      type: "spring",
      stiffness: 260,
      damping: 28,
      mass: 0.9,
    });
  });

  it("springSnappy is snappier than springSoft", () => {
    expect(springSnappy.stiffness).toBeGreaterThan(springSoft.stiffness);
    expect(springSnappy.mass).toBeLessThan(springSoft.mass);
  });

  it("springGentle is gentler than springSoft", () => {
    expect(springGentle.stiffness).toBeLessThan(springSoft.stiffness);
    expect(springGentle.mass).toBeGreaterThanOrEqual(springSoft.mass);
  });

  it("reducedMotion disables floating and uses instant numbers", () => {
    expect(reducedMotion.floating).toBe(false);
    expect(reducedMotion.number).toBe("instant");
    expect(reducedMotion.sheet).toEqual({ opacity: 1, y: 0 });
  });

  it("all spring presets have type spring", () => {
    for (const preset of [springSoft, springSnappy, springGentle]) {
      expect(preset.type).toBe("spring");
    }
  });
});
