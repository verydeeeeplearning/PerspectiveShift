import { describe, it, expect } from "vitest";
import { CalculateStanceDriftUseCase } from "../calculate-stance-drift";

describe("CalculateStanceDriftUseCase", () => {
  const uc = new CalculateStanceDriftUseCase();

  it("detects significant drift", () => {
    const r = uc.execute({
      userId: "u-1", dialogueCount: 5,
      axes: [{ axis: "경제", previousValue: 0.3, currentValue: 0.6 }],
      lastNotifiedAt: null,
    });
    expect(r.significantAxes).toEqual(["경제"]);
    expect(r.canNotify).toBe(true);
  });

  it("blocks notification with fewer than 4 dialogues", () => {
    const r = uc.execute({
      userId: "u-1", dialogueCount: 2,
      axes: [{ axis: "경제", previousValue: 0.3, currentValue: 0.6 }],
      lastNotifiedAt: null,
    });
    expect(r.canNotify).toBe(false);
  });
});
