import { describe, it, expect } from "vitest";
import { RecoveryRoutine } from "../recovery-routine";

describe("RecoveryRoutine", () => {
  it("creates with default recovery action", () => {
    const r = RecoveryRoutine.create("d-1");
    expect(r.dialogueId).toBe("d-1");
    expect(r.action.topicLevel).toBe(0);
    expect(r.action.dialogueExcluded).toBe(true);
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
});
