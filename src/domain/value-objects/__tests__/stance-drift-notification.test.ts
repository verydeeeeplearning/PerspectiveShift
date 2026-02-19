import { describe, it, expect } from "vitest";
import { StanceDriftNotification } from "../stance-drift-notification";

describe("StanceDriftNotification", () => {
  it("generates correct message", () => {
    const n = StanceDriftNotification.create({
      axis: "기술 규제",
      direction: "중도",
      periodWeeks: 4,
    });
    expect(n.message).toBe("4주 전보다 기술 규제 이슈에서 당신의 입장이 중도에 가까워졌어요.");
  });
});
