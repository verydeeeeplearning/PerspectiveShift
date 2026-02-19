import { describe, it, expect } from "vitest";
import { AntiAbusePolicy } from "../anti-abuse-policy";

describe("AntiAbusePolicy", () => {
  describe("canRetake", () => {
    it("allows first retake of the day", () => {
      const policy = AntiAbusePolicy.create();
      const result = policy.canRetake(0, new Date());
      expect(result.allowed).toBe(true);
    });

    it("allows retake if last retake was yesterday", () => {
      const policy = AntiAbusePolicy.create();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = policy.canRetake(1, yesterday);
      expect(result.allowed).toBe(true);
    });

    it("disallows retake if already retaken today", () => {
      const policy = AntiAbusePolicy.create();
      const now = new Date();
      const result = policy.canRetake(1, now);
      expect(result.allowed).toBe(false);
      expect(result.message).toContain("내일");
    });

    it("warns on excessive retakes (3+) regardless of date", () => {
      const policy = AntiAbusePolicy.create();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = policy.canRetake(3, yesterday);
      expect(result.allowed).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe("dailyRetakeLimit", () => {
    it("default limit is 1 per day", () => {
      const policy = AntiAbusePolicy.create();
      expect(policy.dailyRetakeLimit).toBe(1);
    });
  });

  describe("isSameDay", () => {
    it("correctly identifies same calendar day", () => {
      const now = new Date("2026-02-19T10:00:00");
      const earlier = new Date("2026-02-19T02:00:00");
      const result = AntiAbusePolicy.create().canRetake(1, earlier, now);
      expect(result.allowed).toBe(false);
    });

    it("correctly identifies different calendar day", () => {
      const now = new Date("2026-02-19T01:00:00");
      const lastNight = new Date("2026-02-18T23:00:00");
      const result = AntiAbusePolicy.create().canRetake(1, lastNight, now);
      expect(result.allowed).toBe(true);
    });
  });
});
