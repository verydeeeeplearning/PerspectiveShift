import { describe, it, expect } from "vitest";
import { RecoveryPromise } from "../recovery-promise";

describe("RecoveryPromise", () => {
  it("creates valid promise", () => {
    const promise = RecoveryPromise.create({
      id: "topic-change",
      text: "주제를 바꿀게요",
      type: "topic_change",
    });

    expect(promise.id).toBe("topic-change");
    expect(promise.type).toBe("topic_change");
  });

  it("provides default 3 promises", () => {
    const defaults = RecoveryPromise.defaultSet();
    expect(defaults).toHaveLength(3);
  });

  it("throws on empty id or text", () => {
    expect(() =>
      RecoveryPromise.create({
        id: "",
        text: "text",
        type: "topic_change",
      }),
    ).toThrow();
    expect(() =>
      RecoveryPromise.create({
        id: "id",
        text: "",
        type: "topic_change",
      }),
    ).toThrow();
  });
});
