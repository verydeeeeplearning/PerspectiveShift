import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetContainer } from "../di-container";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  })),
}));

describe("DI Container", () => {
  beforeEach(() => {
    resetContainer();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
  });

  it("creates container with all dependencies", async () => {
    const { getContainer } = await import("../di-container");
    const container = getContainer();

    expect(container.piiScrubber).toBeDefined();
    expect(container.llmExtractor).toBeDefined();
    expect(container.baselineProvider).toBeDefined();
    expect(container.stanceRepository).toBeDefined();
    expect(container.questions).toHaveLength(20);
    expect(container.submitAnswerUseCase).toBeDefined();
    expect(container.extractStanceUseCase).toBeDefined();
    expect(container.generateThoughtMapUseCase).toBeDefined();
  });

  it("returns fallback extractor when no OpenAI key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const { getContainer } = await import("../di-container");
    resetContainer();
    const container = getContainer();

    const result = await container.llmExtractor.extract([
      { questionId: 9, scrubbedText: "test" },
    ]);
    expect(result.axes).toEqual({});
    expect(result.readiness).toBe(0.5);
  });

  it("loads all 20 questions from JSON", async () => {
    const { getContainer } = await import("../di-container");
    const container = getContainer();

    expect(container.questions).toHaveLength(20);
    expect(container.questions[0].id).toBe(1);
    expect(container.questions[19].id).toBe(20);
  });
});
