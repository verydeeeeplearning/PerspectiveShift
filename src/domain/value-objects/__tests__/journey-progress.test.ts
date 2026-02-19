import { describe, it, expect } from "vitest";
import { JourneyProgress } from "../journey-progress";

describe("JourneyProgress", () => {
  it("shows first phase when empty", () => {
    const j = JourneyProgress.create([]);
    expect(j.currentPhaseIndex).toBe(0);
    expect(j.nextAction).toBe("내 생각 지도 만들기");
    expect(j.isComplete).toBe(false);
    expect(j.progress).toBe(0);
  });

  it("advances with completed phases", () => {
    const j = JourneyProgress.create(["THOUGHT_MAP"]);
    expect(j.currentPhaseIndex).toBe(1);
    expect(j.nextAction).toBe("1번 대화 완료");
    expect(j.progress).toBeCloseTo(1 / 3);
  });

  it("complete when all phases done", () => {
    const j = JourneyProgress.create(["THOUGHT_MAP", "FIRST_DIALOGUE", "SAVE_PARTNER"]);
    expect(j.isComplete).toBe(true);
    expect(j.nextAction).toBeNull();
    expect(j.progress).toBe(1);
  });
});
