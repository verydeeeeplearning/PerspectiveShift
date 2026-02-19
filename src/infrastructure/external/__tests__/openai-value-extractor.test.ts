import { describe, it, expect, vi } from "vitest";
import { FallbackValueExtractor } from "../fallback-value-extractor";

// Mock openai module before importing OpenAIValueExtractor
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => mockClient),
  };
});

let mockClient: {
  chat: { completions: { create: ReturnType<typeof vi.fn> } };
};

// Dynamic import after mock
const { OpenAIValueExtractor } = await import("../openai-value-extractor");

describe("OpenAIValueExtractor", () => {
  function setupMock(response: string) {
    mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: response } }],
          }),
        },
      },
    };
  }

  it("extracts value priority keywords from text", async () => {
    setupMock(JSON.stringify({ keywords: ["성장", "도전", "학습"] }));
    const extractor = new OpenAIValueExtractor("test-key");

    const result = await extractor.extractValuePriority(
      "꾸준히 공부하고 새로운 도전을 하는 것이 중요합니다",
    );

    expect(result).toEqual(["성장", "도전", "학습"]);
    expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    );
  });

  it("returns empty array on empty response", async () => {
    setupMock(JSON.stringify({ keywords: [] }));
    const extractor = new OpenAIValueExtractor("test-key");

    const result = await extractor.extractValuePriority("짧은 텍스트");
    expect(result).toEqual([]);
  });

  it("returns empty array on malformed JSON", async () => {
    setupMock("not json");
    const extractor = new OpenAIValueExtractor("test-key");

    const result = await extractor.extractValuePriority("텍스트");
    expect(result).toEqual([]);
  });
});

describe("FallbackValueExtractor", () => {
  it("always returns empty array", async () => {
    const extractor = new FallbackValueExtractor();

    const result = await extractor.extractValuePriority("any text here");
    expect(result).toEqual([]);
  });
});
