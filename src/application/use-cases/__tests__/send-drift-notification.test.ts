import { describe, it, expect } from "vitest";
import { SendDriftNotificationUseCase } from "../send-drift-notification";

describe("SendDriftNotificationUseCase", () => {
  const uc = new SendDriftNotificationUseCase();

  it("generates notification message", () => {
    const r = uc.execute({ axis: "기술 규제", direction: "중도", periodWeeks: 4 });
    expect(r.message).toContain("기술 규제");
    expect(r.message).toContain("중도");
    expect(r.axis).toBe("기술 규제");
  });
});
