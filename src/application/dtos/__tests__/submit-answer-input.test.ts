import { describe, it, expect } from "vitest";
import { SubmitAnswerInputSchema, SubmitBatchInputSchema } from "../submit-answer-input";

describe("SubmitAnswerInputSchema", () => {
  it("validates OX answer", () => {
    const result = SubmitAnswerInputSchema.parse({
      questionId: 1,
      type: "OX",
      value: true,
    });
    expect(result.type).toBe("OX");
    expect(result.value).toBe(true);
  });

  it("validates RUBRIC answer", () => {
    const result = SubmitAnswerInputSchema.parse({
      questionId: 4,
      type: "RUBRIC",
      value: 3,
    });
    expect(result.type).toBe("RUBRIC");
    expect(result.value).toBe(3);
  });

  it("validates OPEN_ENDED answer", () => {
    const result = SubmitAnswerInputSchema.parse({
      questionId: 9,
      type: "OPEN_ENDED",
      value: "한국 사회에서 가장 중요한 것은...",
    });
    expect(result.type).toBe("OPEN_ENDED");
  });

  it("rejects invalid question ID", () => {
    expect(() =>
      SubmitAnswerInputSchema.parse({
        questionId: 0,
        type: "OX",
        value: true,
      }),
    ).toThrow();
  });

  it("rejects rubric score out of range", () => {
    expect(() =>
      SubmitAnswerInputSchema.parse({
        questionId: 4,
        type: "RUBRIC",
        value: 6,
      }),
    ).toThrow();
  });

  it("rejects empty open-ended text", () => {
    expect(() =>
      SubmitAnswerInputSchema.parse({
        questionId: 9,
        type: "OPEN_ENDED",
        value: "",
      }),
    ).toThrow();
  });

  it("rejects unknown type", () => {
    expect(() =>
      SubmitAnswerInputSchema.parse({
        questionId: 1,
        type: "UNKNOWN",
        value: true,
      }),
    ).toThrow();
  });
});

describe("SubmitBatchInputSchema", () => {
  it("validates batch of mixed answers", () => {
    const result = SubmitBatchInputSchema.parse({
      sessionId: "sess-123",
      answers: [
        { questionId: 1, type: "OX", value: true },
        { questionId: 4, type: "RUBRIC", value: 4 },
      ],
    });
    expect(result.answers).toHaveLength(2);
    expect(result.sessionId).toBe("sess-123");
  });

  it("rejects empty session ID", () => {
    expect(() =>
      SubmitBatchInputSchema.parse({
        sessionId: "",
        answers: [{ questionId: 1, type: "OX", value: true }],
      }),
    ).toThrow();
  });

  it("rejects empty answers array", () => {
    expect(() =>
      SubmitBatchInputSchema.parse({
        sessionId: "sess-123",
        answers: [],
      }),
    ).toThrow();
  });
});
