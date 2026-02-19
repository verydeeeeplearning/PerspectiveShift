import { describe, it, expect } from "vitest";
import { RoleplaySteelman } from "../roleplay-steelman";

describe("RoleplaySteelman", () => {
  it("creates with prompt", () => {
    const rs = RoleplaySteelman.create({
      oppositeRolePrompt: "AI 일자리 감소 우려론자라면, 내 주장의 가장 약한 부분은:",
    });
    expect(rs.oppositeRolePrompt).toContain("우려론자");
    expect(rs.isSkipped).toBe(false);
    expect(rs.userResponse).toBeNull();
  });

  it("records user response", () => {
    const rs = RoleplaySteelman.create({
      oppositeRolePrompt: "prompt",
    });
    const completed = rs.complete("상대 입장에서 보면 기술 변화가 무섭겠죠");
    expect(completed.userResponse).toContain("기술 변화");
    expect(completed.isSkipped).toBe(false);
  });

  it("can be skipped", () => {
    const rs = RoleplaySteelman.create({ oppositeRolePrompt: "prompt" });
    const skipped = rs.skip();
    expect(skipped.isSkipped).toBe(true);
    expect(skipped.userResponse).toBeNull();
  });

  it("determines if force required based on dialogue count and score", () => {
    // First 3: always optional (can skip)
    expect(RoleplaySteelman.isForceRequired(1, 50)).toBe(false);
    expect(RoleplaySteelman.isForceRequired(3, 50)).toBe(false);
    // After 3: depends on Understanding Score
    expect(RoleplaySteelman.isForceRequired(4, 40)).toBe(true); // low score → force
    expect(RoleplaySteelman.isForceRequired(4, 70)).toBe(false); // high score → optional
  });

  it("throws if prompt is empty", () => {
    expect(() => RoleplaySteelman.create({ oppositeRolePrompt: "" })).toThrow();
  });

  it("throws if completing with empty response", () => {
    const rs = RoleplaySteelman.create({ oppositeRolePrompt: "prompt" });
    expect(() => rs.complete("")).toThrow();
  });

  it("force threshold is at Understanding Score 50", () => {
    expect(RoleplaySteelman.isForceRequired(5, 49)).toBe(true);
    expect(RoleplaySteelman.isForceRequired(5, 50)).toBe(false);
  });
});
