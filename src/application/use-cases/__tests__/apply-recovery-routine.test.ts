import { describe, it, expect } from "vitest";
import { ApplyRecoveryRoutineUseCase } from "../apply-recovery-routine";
import { RecoveryRoutine } from "@/domain/entities/recovery-routine";

describe("ApplyRecoveryRoutineUseCase", () => {
  const uc = new ApplyRecoveryRoutineUseCase();

  it("returns recovery params for bad experience", () => {
    const r = uc.execute({ dialogueId: "d-1" });
    expect(r.topicLevel).toBe(0);
    expect(r.distanceBandMin).toBe(0.2);
    expect(r.distanceBandMax).toBe(0.3);
    expect(r.facilitatorIntensity).toBe(1.0);
    expect(r.dialogueExcluded).toBe(true);
    expect(r.recoveryMode).toBe(true);
    expect(r.promises).toHaveLength(3);
  });

  it("includes empathy messages", () => {
    const r = uc.execute({ dialogueId: "d-2" });
    expect(r.messages.length).toBeGreaterThan(0);
    expect(r.messages.some((m) => m.includes("불편했다니"))).toBe(true);
  });

  it("filters promises by selected types", () => {
    const r = uc.execute({
      dialogueId: "d-3",
      selectedPromiseTypes: ["topic_change", "time_reduce"],
    });

    expect(r.promises).toHaveLength(2);
    expect(r.promises.map((promise) => promise.type)).toEqual([
      "topic_change",
      "time_reduce",
    ]);
  });

  it("releases recovery mode when feel heard threshold is met", () => {
    const routine = RecoveryRoutine.create("d-4");
    const released = uc.checkRelease({
      routine,
      feelHeardScore: 3,
    });

    expect(released.recoveryMode).toBe(false);
  });
});
