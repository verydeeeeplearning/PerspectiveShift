import { describe, it, expect } from "vitest";
import { RecoveryAction } from "../recovery-action";

describe("RecoveryAction", () => {
  it("createDefault sets Level 0, distance 0.2-0.3, max facilitator, excluded", () => {
    const a = RecoveryAction.createDefault();
    expect(a.topicLevel).toBe(0);
    expect(a.distanceBandMin).toBe(0.2);
    expect(a.distanceBandMax).toBe(0.3);
    expect(a.facilitatorIntensity).toBe(1.0);
    expect(a.dialogueExcluded).toBe(true);
  });

  it("create with custom props", () => {
    const a = RecoveryAction.create({ topicLevel: 1, dialogueExcluded: false });
    expect(a.topicLevel).toBe(1);
    expect(a.dialogueExcluded).toBe(false);
    expect(a.distanceBandMin).toBe(0.2);
  });
});
