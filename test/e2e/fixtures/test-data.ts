import type { Page, Route } from "@playwright/test";

// ─── Mock IDs ─────────────────────────────────────────────
export const TEST_SESSION_ID = "e2e-session-001";
export const TEST_DIALOGUE_ID = "e2e-dialogue-001";
export const TEST_FRIENDSHIP_ID = "e2e-friendship-001";
export const TEST_PROPOSAL_ID = "e2e-proposal-001";
export const TEST_FRIEND_USER_ID = "e2e-user-002";

// ─── Mock Data Payloads ──────────────────────────────────

export const MOCK_CANDIDATES = {
  candidates: [
    {
      sessionId: "session-a",
      overlapRatio: 0.65,
      gapTopics: ["교육", "환경"],
      compatibilityNote: "적절한 의견 거리를 가진 상대입니다",
      energyTag: "MEDIUM",
      declineCount: 0,
      personaLabel: "탐구자",
    },
    {
      sessionId: "session-b",
      overlapRatio: 0.45,
      gapTopics: ["경제"],
      compatibilityNote: "새로운 관점을 배울 수 있는 상대입니다",
      energyTag: "HIGH",
      declineCount: 1,
      personaLabel: "비평가",
    },
  ],
};

export const MOCK_DIALOGUE_SESSIONS = {
  sessions: [
    {
      id: TEST_DIALOGUE_ID,
      status: "ACTIVE",
      currentStep: "POSITION",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "e2e-dialogue-002",
      status: "COMPLETED",
      currentStep: "JOINT_SUMMARY",
      updatedAt: new Date().toISOString(),
    },
  ],
};

export const MOCK_DIALOGUE_DETAIL = {
  id: TEST_DIALOGUE_ID,
  status: "ACTIVE",
  currentStep: "POSITION",
  myRole: "PARTICIPANT_A",
  turns: [
    {
      id: "turn-1",
      role: "PARTICIPANT_A",
      step: "AFFIRMATION",
      content: "저는 이 주제에 대해 깊이 생각해봤습니다.",
      createdAt: new Date().toISOString(),
    },
  ],
  isMyTurn: true,
  toneCheck: null,
  facilitatorWarning: null,
};

export const MOCK_SUMMARY_CARD = {
  sessionId: TEST_DIALOGUE_ID,
  sharedInsights: ["교육에 대한 새로운 관점 공유"],
  divergencePoints: ["환경 정책의 우선순위"],
  jointStatement: "우리는 교육의 중요성에 동의하며, 환경 정책에 대해 다양한 시각이 존재함을 인정합니다.",
  satisfactionAvg: 4.2,
};

export const MOCK_FRIENDS = {
  friends: [
    {
      friendshipId: TEST_FRIENDSHIP_ID,
      friendUserId: TEST_FRIEND_USER_ID,
      dialogueCount: 3,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const MOCK_FRIEND_DETAIL = {
  friendshipId: TEST_FRIENDSHIP_ID,
  friendUserId: TEST_FRIEND_USER_ID,
  dialogueCount: 3,
  disclosureLevel: "STANCE",
  createdAt: new Date().toISOString(),
};

export const MOCK_DISCLOSURE = {
  currentLevel: "STANCE",
  availableLevels: ["STANCE", "TOPIC", "FULL"],
};

export const MOCK_CHAT_ELIGIBILITY = {
  eligible: true,
  reason: null,
};

export const MOCK_CHAT_MESSAGES = {
  messages: [
    {
      id: "msg-1",
      senderId: "e2e-user-001",
      content: "안녕하세요!",
      createdAt: new Date().toISOString(),
    },
    {
      id: "msg-2",
      senderId: TEST_FRIEND_USER_ID,
      content: "반갑습니다!",
      createdAt: new Date().toISOString(),
    },
  ],
};

export const MOCK_OFFLINE_PROPOSAL = {
  id: TEST_PROPOSAL_ID,
  friendshipId: TEST_FRIENDSHIP_ID,
  status: "PENDING",
  proposedAt: new Date().toISOString(),
  locationHint: "강남역 카페",
  safetyCheckinStatus: "NOT_STARTED",
};

// ─── Thought Map result (for onboarding result page) ─────

export const MOCK_THOUGHT_MAP = {
  sessionId: TEST_SESSION_ID,
  dominantStance: "PROGRESSIVE",
  stanceScores: {
    PROGRESSIVE: 0.7,
    MODERATE: 0.2,
    CONSERVATIVE: 0.1,
  },
  topTopics: ["교육", "환경", "경제"],
  confidenceScore: 0.85,
};

// ─── Route Mocking Helper ────────────────────────────────

type MockRoute = {
  pattern: string | RegExp;
  response: unknown;
  status?: number;
  method?: string;
};

/**
 * Sets up mock API routes on a Playwright page.
 * Call this at the start of tests that hit API endpoints.
 */
export async function setupMockRoutes(
  page: Page,
  routes: readonly MockRoute[],
): Promise<void> {
  for (const { pattern, response, status = 200, method } of routes) {
    await page.route(pattern, async (route: Route) => {
      if (method && route.request().method() !== method.toUpperCase()) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }
}

/** Pre-configured mock sets for common test scenarios */
export const MOCK_ROUTES = {
  matching: [
    { pattern: "**/api/matching/candidates", response: MOCK_CANDIDATES },
    {
      pattern: "**/api/matching/proposals",
      response: { ok: true },
      method: "POST",
    },
  ],
  dialogueList: [
    {
      pattern: "**/api/dialogue/sessions",
      response: MOCK_DIALOGUE_SESSIONS,
    },
  ],
  dialogueDetail: (id: string) => [
    {
      pattern: `**/api/dialogue/sessions/${id}`,
      response: MOCK_DIALOGUE_DETAIL,
    },
    {
      pattern: `**/api/dialogue/sessions/${id}/turns`,
      response: { ok: true },
      method: "POST",
    },
  ],
  dialogueFeedback: (id: string) => [
    {
      pattern: `**/api/dialogue/sessions/${id}/feedback`,
      response: { ok: true },
      method: "POST",
    },
  ],
  dialogueSummary: (id: string) => [
    {
      pattern: `**/api/dialogue/sessions/${id}/summary`,
      response: MOCK_SUMMARY_CARD,
    },
  ],
  friends: [
    { pattern: "**/api/relationship/friends", response: MOCK_FRIENDS },
  ],
  friendDetail: (id: string) => [
    {
      pattern: `**/api/relationship/friends/${id}`,
      response: MOCK_FRIEND_DETAIL,
    },
    {
      pattern: `**/api/relationship/disclosure?friendshipId=${id}`,
      response: MOCK_DISCLOSURE,
    },
    {
      pattern: `**/api/chat/${id}/eligibility`,
      response: MOCK_CHAT_ELIGIBILITY,
    },
  ],
  chat: (friendshipId: string) => [
    {
      pattern: `**/api/chat/${friendshipId}/messages`,
      response: MOCK_CHAT_MESSAGES,
    },
    {
      pattern: `**/api/chat/${friendshipId}/messages`,
      response: { ok: true },
      method: "POST",
    },
  ],
  offlineDetail: (id: string) => [
    {
      pattern: `**/api/offline/proposals/${id}/**`,
      response: { ok: true },
      method: "POST",
    },
  ],
  safetyReport: [
    {
      pattern: "**/api/safety/report",
      response: { ok: true },
      method: "POST",
    },
  ],
};
