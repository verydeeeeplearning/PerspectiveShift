import { describe, it, expect } from "vitest";
import { MicroCheckinScheduler } from "../micro-checkin-scheduler";

describe("MicroCheckinScheduler", () => {
  const scheduler = new MicroCheckinScheduler();
  const chatStart = new Date("2026-01-01T10:00:00Z");

  it("returns null before 20 minutes", () => {
    const now = new Date("2026-01-01T10:15:00Z");
    const result = scheduler.generateCheckin("f-1", chatStart, now);
    expect(result).toBeNull();
  });

  it("returns first checkin after 20 minutes", () => {
    const now = new Date("2026-01-01T10:21:00Z");
    const result = scheduler.generateCheckin("f-1", chatStart, now);
    expect(result).not.toBeNull();
    expect(result!.friendshipId).toBe("f-1");
    expect(result!.prompt).toBeTruthy();
    expect(result!.intervalMinutes).toBe(20);
  });

  it("returns different prompt for second interval", () => {
    const firstCheckin = scheduler.generateCheckin(
      "f-1",
      chatStart,
      new Date("2026-01-01T10:21:00Z"),
    );
    const secondCheckin = scheduler.generateCheckin(
      "f-1",
      chatStart,
      new Date("2026-01-01T10:41:00Z"),
    );
    expect(firstCheckin!.prompt).not.toBe(secondCheckin!.prompt);
  });

  it("cycles through prompts after exhausting all", () => {
    // 5 prompts total, checking 6th interval (index 5) wraps to index 0
    const now = new Date(chatStart.getTime() + 6 * 20 * 60 * 1000 + 1000);
    const result = scheduler.generateCheckin("f-1", chatStart, now);
    const firstResult = scheduler.generateCheckin(
      "f-1",
      chatStart,
      new Date("2026-01-01T10:21:00Z"),
    );
    expect(result!.prompt).toBe(firstResult!.prompt);
  });

  it("getIntervalMinutes returns 20", () => {
    expect(scheduler.getIntervalMinutes()).toBe(20);
  });
});
