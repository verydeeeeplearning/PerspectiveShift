import { describe, it, expect } from "vitest";
import { NotificationTemplate, NotificationPreference } from "../notification-template";

describe("NotificationTemplate", () => {
  it("creates template with type, title, body", () => {
    const t = NotificationTemplate.create({
      type: "INSIGHT",
      title: "새로운 통계",
      body: "다른 사용자의 63%가...",
    });
    expect(t.type).toBe("INSIGHT");
    expect(t.title).toBe("새로운 통계");
  });
});

describe("NotificationPreference", () => {
  it("defaults to ESSENTIAL", () => {
    const p = NotificationPreference.createDefault();
    expect(p.frequency).toBe("ESSENTIAL");
    expect(p.isEnabled).toBe(true);
  });

  it("ESSENTIAL allows INSIGHT and ACTION, blocks CURIOSITY", () => {
    const p = NotificationPreference.createDefault();
    expect(p.shouldSend("INSIGHT")).toBe(true);
    expect(p.shouldSend("ACTION")).toBe(true);
    expect(p.shouldSend("CURIOSITY")).toBe(false);
  });

  it("ALL allows everything", () => {
    const p = NotificationPreference.create("ALL");
    expect(p.shouldSend("INSIGHT")).toBe(true);
    expect(p.shouldSend("CURIOSITY")).toBe(true);
    expect(p.shouldSend("ACTION")).toBe(true);
  });

  it("OFF blocks everything", () => {
    const p = NotificationPreference.create("OFF");
    expect(p.isEnabled).toBe(false);
    expect(p.shouldSend("INSIGHT")).toBe(false);
  });
});
