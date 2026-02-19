import { describe, it, expect } from "vitest";
import { RequestNotificationPermissionUseCase } from "../request-notification-permission";

describe("RequestNotificationPermissionUseCase", () => {
  const uc = new RequestNotificationPermissionUseCase();
  const now = new Date("2026-02-20T10:00:00.000Z");

  it("returns eligible after good dialogue experience", () => {
    const result = uc.execute({
      hasCompletedDialogue: true,
      feelHeardScore: 4,
      now,
    });

    expect(result.shouldRequest).toBe(true);
    expect(result.reason).toBe("eligible");
  });

  it("blocks request when experience is insufficient", () => {
    const result = uc.execute({
      hasCompletedDialogue: true,
      feelHeardScore: 2,
      now,
    });

    expect(result.shouldRequest).toBe(false);
    expect(result.reason).toBe("insufficient_experience");
  });

  it("blocks request during cooldown window", () => {
    const result = uc.execute({
      hasCompletedDialogue: true,
      feelHeardScore: 4,
      lastPromptedAt: new Date("2026-02-18T10:00:00.000Z"),
      now,
    });

    expect(result.shouldRequest).toBe(false);
    expect(result.reason).toBe("cooldown");
    expect(result.earliestNextPromptAt).not.toBeNull();
  });
});
