import { describe, it, expect } from "vitest";
import { CooldownMode } from "../cooldown-mode";

describe("CooldownMode", () => {
  it("creates active cooldown with reason", () => {
    const mode = CooldownMode.activate("FATIGUE");
    expect(mode.active).toBe(true);
    expect(mode.reason).toBe("FATIGUE");
  });

  it("inactive mode", () => {
    const mode = CooldownMode.inactive();
    expect(mode.active).toBe(false);
    expect(mode.reason).toBeNull();
  });

  it("FATIGUE reason suggests light activity", () => {
    const mode = CooldownMode.activate("FATIGUE");
    expect(mode.suggestedActivity.length).toBeGreaterThan(0);
  });

  it("DAILY_LIMIT reason has suggestion", () => {
    const mode = CooldownMode.activate("DAILY_LIMIT");
    expect(mode.reason).toBe("DAILY_LIMIT");
    expect(mode.suggestedActivity.length).toBeGreaterThan(0);
  });

  it("USER_REQUEST reason has suggestion", () => {
    const mode = CooldownMode.activate("USER_REQUEST");
    expect(mode.reason).toBe("USER_REQUEST");
    expect(mode.suggestedActivity.length).toBeGreaterThan(0);
  });
});
