import { describe, it, expect } from "vitest";
import { ManageNotificationPreferenceUseCase } from "../manage-notification-preference";

describe("ManageNotificationPreferenceUseCase", () => {
  const uc = new ManageNotificationPreferenceUseCase();

  it("sets frequency and returns enabled status", () => {
    const r = uc.execute({ frequency: "ESSENTIAL" });
    expect(r.frequency).toBe("ESSENTIAL");
    expect(r.isEnabled).toBe(true);
  });

  it("disabled when OFF", () => {
    const r = uc.execute({ frequency: "OFF" });
    expect(r.isEnabled).toBe(false);
  });
});
