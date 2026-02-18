import { headers } from "next/headers";

const SESSION_HEADER = "x-session-id";

export async function getSessionId(): Promise<string | null> {
  const headerStore = await headers();
  return headerStore.get(SESSION_HEADER);
}

export function requireSessionId(sessionId: string | null): string {
  if (!sessionId) {
    throw new Error(
      "Missing X-Session-Id header. Anonymous session required.",
    );
  }
  return sessionId;
}
