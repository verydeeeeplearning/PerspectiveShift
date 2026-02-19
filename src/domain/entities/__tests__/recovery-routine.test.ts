import { describe, it, expect } from "vitest";
import { RecoveryRoutine } from "../recovery-routine";

describe("RecoveryRoutine", () => {
  it("creates with default recovery action", () => {
    const r = RecoveryRoutine.create("d-1");
    expect(r.dialogueId).toBe("d-1");
    expect(r.action.topicLevel).toBe(0);
    expect(r.action.dialogueExcluded).toBe(true);
    expect(r.recoveryMode).toBe(true);
    expect(r.promises).toHaveLength(3);
  });

  it("includes empathy messages without apology", () => {
    const r = RecoveryRoutine.create("d-1");
    expect(r.messages.length).toBeGreaterThan(0);
    expect(r.messages.some((m) => m.includes("불편했다니"))).toBe(true);
    expect(r.messages.every((m) => !m.includes("죄송") && !m.includes("사과"))).toBe(true);
  });

  it("includes no-pressure restart message", () => {
    const r = RecoveryRoutine.create("d-1");
    expect(r.messages.some((m) => m.includes("당장 새로 시작할 필요 없어요"))).toBe(true);
  });

  it("auto-releases when feel heard is 3 or higher", () => {
    const r = RecoveryRoutine.create("d-1");
    const next = r.advanceRecovery(3);
    expect(next.recoveryMode).toBe(false);
    expect(next.recoveryBadge).toBeUndefined();
  });

  it("auto-releases after 3 recovery dialogues", () => {
    let r = RecoveryRoutine.create("d-1");
    r = r.advanceRecovery(2);
    r = r.advanceRecovery(2);
    r = r.advanceRecovery(2);
    expect(r.recoveryMode).toBe(false);
    expect(r.autoReleaseCount).toBe(3);
  });

  it("supports manual release", () => {
    const r = RecoveryRoutine.create("d-1");
    const released = r.releaseManually();
    expect(released.recoveryMode).toBe(false);
  });
});
