import { describe, it, expect } from "vitest";
import { ChatMessage } from "../chat-message";

describe("ChatMessage", () => {
  function createMessage(overrides: Partial<import("../chat-message").ChatMessageProps> = {}) {
    return ChatMessage.create({
      id: "msg-1",
      friendshipId: "friendship-1",
      senderId: "user-1",
      content: "Hello!",
      piiScrubbed: false,
      createdAt: new Date("2026-02-19T00:00:00Z"),
      ...overrides,
    });
  }

  it("creates a message with all properties", () => {
    const msg = createMessage();
    expect(msg.id).toBe("msg-1");
    expect(msg.friendshipId).toBe("friendship-1");
    expect(msg.senderId).toBe("user-1");
    expect(msg.content).toBe("Hello!");
    expect(msg.piiScrubbed).toBe(false);
    expect(msg.createdAt).toEqual(new Date("2026-02-19T00:00:00Z"));
  });

  it("creates a PII-scrubbed message", () => {
    const msg = createMessage({ piiScrubbed: true, content: "Hi [REDACTED]!" });
    expect(msg.piiScrubbed).toBe(true);
    expect(msg.content).toBe("Hi [REDACTED]!");
  });

  it("preserves all readonly fields", () => {
    const msg = createMessage();
    expect(msg.id).toBe("msg-1");
    expect(msg.friendshipId).toBe("friendship-1");
    expect(msg.senderId).toBe("user-1");
  });
});
