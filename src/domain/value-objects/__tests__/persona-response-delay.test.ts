import { describe, it, expect } from "vitest";
import { PersonaResponseDelay } from "../persona-response-delay";

describe("PersonaResponseDelay", () => {
  describe("calculate", () => {
    it("returns delay within 2000-17000ms range", () => {
      for (let i = 0; i < 50; i++) {
        const delay = PersonaResponseDelay.calculate(100);
        expect(delay.delayMs).toBeGreaterThanOrEqual(2000);
        expect(delay.delayMs).toBeLessThanOrEqual(17000);
      }
    });

    it("returns integer delayMs", () => {
      const delay = PersonaResponseDelay.calculate(50);
      expect(Number.isInteger(delay.delayMs)).toBe(true);
    });

    it("longer responses produce longer delays on average", () => {
      const trials = 200;
      let shortTotal = 0;
      let longTotal = 0;

      for (let i = 0; i < trials; i++) {
        shortTotal += PersonaResponseDelay.calculate(10).delayMs;
        longTotal += PersonaResponseDelay.calculate(200).delayMs;
      }

      const shortAvg = shortTotal / trials;
      const longAvg = longTotal / trials;

      expect(longAvg).toBeGreaterThan(shortAvg);
    });

    it("clamps very short responses to minimum 2000ms", () => {
      for (let i = 0; i < 30; i++) {
        const delay = PersonaResponseDelay.calculate(0);
        expect(delay.delayMs).toBeGreaterThanOrEqual(2000);
      }
    });

    it("clamps very long responses to maximum 17000ms", () => {
      for (let i = 0; i < 30; i++) {
        const delay = PersonaResponseDelay.calculate(10000);
        expect(delay.delayMs).toBeLessThanOrEqual(17000);
      }
    });
  });

  describe("seconds getter", () => {
    it("returns delayMs divided by 1000", () => {
      const delay = PersonaResponseDelay.calculate(50);
      expect(delay.seconds).toBe(delay.delayMs / 1000);
    });
  });
});
