/**
 * LangSmith tracing configuration.
 *
 * Reads env vars to enable/disable LangSmith monitoring:
 *   LANGCHAIN_TRACING_V2 = "true"
 *   LANGCHAIN_API_KEY    = "ls-..."
 *   LANGCHAIN_PROJECT    = "PerspectiveShift" (optional, defaults to project name)
 *
 * LangChain/LangGraph automatically picks up these env vars at runtime,
 * so this module only validates and logs the configuration status.
 */

export interface LangSmithConfig {
  enabled: boolean;
  apiKey: string | null;
  project: string;
  endpoint: string;
}

const DEFAULT_PROJECT = "PerspectiveShift";
const DEFAULT_ENDPOINT = "https://api.smith.langchain.com";

/**
 * Reads environment variables and returns the current LangSmith configuration.
 * Does NOT set env vars — they should already be in .env.local.
 */
export function getLangSmithConfig(): LangSmithConfig {
  const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === "true";
  const apiKey = process.env.LANGCHAIN_API_KEY ?? null;
  const project = process.env.LANGCHAIN_PROJECT ?? DEFAULT_PROJECT;
  const endpoint = process.env.LANGCHAIN_ENDPOINT ?? DEFAULT_ENDPOINT;

  const hasValidKey = apiKey !== null && apiKey.startsWith("ls-") && apiKey.length > 10;

  return {
    enabled: tracingEnabled && hasValidKey,
    apiKey: hasValidKey ? apiKey : null,
    project,
    endpoint,
  };
}

/**
 * Ensures required env vars are set for LangSmith tracing.
 * Call once at app startup (e.g., in DI container initialization).
 * Returns a human-readable status string.
 */
export function initLangSmithTracing(): string {
  const config = getLangSmithConfig();

  if (!config.enabled) {
    return "LangSmith tracing: disabled (LANGCHAIN_TRACING_V2 not set or invalid API key)";
  }

  // Ensure project name is propagated
  if (!process.env.LANGCHAIN_PROJECT) {
    process.env.LANGCHAIN_PROJECT = config.project;
  }

  return `LangSmith tracing: enabled (project=${config.project})`;
}
