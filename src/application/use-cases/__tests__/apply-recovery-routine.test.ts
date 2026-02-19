import { describe, it, expect } from "vitest";
import { ApplyRecoveryRoutineUseCase } from "../apply-recovery-routine";

describe("ApplyRecoveryRoutineUseCase", () => {
  const uc = new ApplyRecoveryRoutineUseCase();

  it("returns recovery params for bad experience", () => {
    const r = uc.execute({ dialogueId: "d-1" });
    expect(r.topicLevel).toBe(0);
    expect(r.distanceBandMin).toBe(0.2);
    expect(r.distanceBandMax).toBe(0.3);
    expect(r.facilitatorIntensity).toBe(1.0);
    expect(r.dialogueExcluded).toBe(true);
  });

  it("includes empathy messages", () => {
    const r = uc.execute({ dialogueId: "d-2" });
    expect(r.messages.length).toBeGreaterThan(0);
    expect(r.messages.some((m) => m.includes("불편했다니"))).toBe(true);
  });
});
