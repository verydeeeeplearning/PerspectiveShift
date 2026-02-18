import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEnv, hasSupabaseConfig, hasOpenAiConfig } from "@/infrastructure/config/env";

describe("Environment validation", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates with default values when optional vars absent", () => {
    const env = validateEnv();
    expect(env.LANGCHAIN_PROJECT).toBe("perspectiveshift");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("hasSupabaseConfig returns false without env vars", () => {
    expect(hasSupabaseConfig()).toBe(false);
  });

  it("hasSupabaseConfig returns true with env vars", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    expect(hasSupabaseConfig()).toBe(true);
  });

  it("hasOpenAiConfig returns false without key", () => {
    expect(hasOpenAiConfig()).toBe(false);
  });

  it("hasOpenAiConfig returns true with key", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-123");
    expect(hasOpenAiConfig()).toBe(true);
  });
});
