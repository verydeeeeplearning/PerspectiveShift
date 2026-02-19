import { describe, it, expect } from "vitest";
import { StanceDrift } from "../stance-drift";

describe("StanceDrift", () => {
  it("identifies significant drifts >= 0.2", () => {
    const sd = StanceDrift.create({
      userId: "u-1", dialogueCount: 5,
      driftByAxis: [
        { axis: "경제", previousValue: 0.3, currentValue: 0.6, drift: 0.3 },
        { axis: "안보", previousValue: 0.5, currentValue: 0.55, drift: 0.05 },
      ],
      lastNotifiedAt: null,
    });
    expect(sd.significantDrifts.length).toBe(1);
    expect(sd.significantDrifts[0].axis).toBe("경제");
  });

  it("requires 4+ dialogues", () => {
    const sd = StanceDrift.create({
      userId: "u-1", dialogueCount: 3,
      driftByAxis: [{ axis: "a", previousValue: 0, currentValue: 0.5, drift: 0.5 }],
      lastNotifiedAt: null,
    });
    expect(sd.hasEnoughDialogues).toBe(false);
    expect(sd.canNotify).toBe(false);
  });

  it("canNotify true when all conditions met", () => {
    const sd = StanceDrift.create({
      userId: "u-1", dialogueCount: 5,
      driftByAxis: [{ axis: "a", previousValue: 0, currentValue: 0.3, drift: 0.3 }],
      lastNotifiedAt: null,
    });
    expect(sd.canNotify).toBe(true);
  });

  it("blocks notification within 30 days of last", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const sd = StanceDrift.create({
      userId: "u-1", dialogueCount: 5,
      driftByAxis: [{ axis: "a", previousValue: 0, currentValue: 0.3, drift: 0.3 }],
      lastNotifiedAt: recent,
    });
    expect(sd.canNotify).toBe(false);
  });
});
