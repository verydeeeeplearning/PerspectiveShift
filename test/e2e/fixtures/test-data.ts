import type { Page, Route } from "@playwright/test";

// ─── Mock IDs ─────────────────────────────────────────────
export const TEST_SESSION_ID = "e2e-session-001";
export const TEST_DIALOGUE_ID = "e2e-dialogue-001";
export const TEST_DIALOGUE_COMPLETED_ID = "e2e-dialogue-002";
export const TEST_FRIENDSHIP_ID = "e2e-friendship-001";
export const TEST_PROPOSAL_ID = "e2e-proposal-001";
export const TEST_FRIEND_USER_ID = "e2e-user-002";
export const TEST_PERSONA_ID = "persona-realist";

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

export const MOCK_PERSONAS = {
  personas: [
    {
      personaId: TEST_PERSONA_ID,
      name: "현실주의 직장인",
      description: "실용적인 관점에서 대화합니다",
      style: "PRAGMATIC",
    },
    {
      personaId: "persona-educator",
      name: "공감하는 교육자",
      description: "교육적 관점에서 접근합니다",
      style: "EMPATHETIC",
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
      id: TEST_DIALOGUE_COMPLETED_ID,
      status: "COMPLETED",
      currentStep: "JOINT_SUMMARY",
      updatedAt: new Date().toISOString(),
    },
  ],
};

export const MOCK_DIALOGUE_SESSIONS_WITH_ALL_STATUSES = {
  sessions: [
    {
      id: TEST_DIALOGUE_ID,
      status: "ACTIVE",
      currentStep: "POSITION",
      updatedAt: new Date().toISOString(),
    },
    {
      id: TEST_DIALOGUE_COMPLETED_ID,
      status: "COMPLETED",
      currentStep: "JOINT_SUMMARY",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "e2e-dialogue-003",
      status: "EXPIRED",
      currentStep: "QUESTION",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "e2e-dialogue-004",
      status: "CANCELLED",
      currentStep: "AFFIRMATION",
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

export const MOCK_DIALOGUE_COMPLETED = {
  id: TEST_DIALOGUE_COMPLETED_ID,
  status: "COMPLETED",
  currentStep: "JOINT_SUMMARY",
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
  isMyTurn: false,
  toneCheck: null,
  facilitatorWarning: null,
};

export const MOCK_DIALOGUE_WAITING = {
  ...MOCK_DIALOGUE_DETAIL,
  isMyTurn: false,
  mySubmitted: true,
};

export const MOCK_TURN_RESPONSE_OK = {
  ok: true,
  toneCheck: { passed: true, suggestion: null },
  driftCheck: { drifted: false },
  agentResponse: null,
};

export const MOCK_TURN_RESPONSE_TONE_WARNING = {
  ok: true,
  toneCheck: {
    passed: false,
    suggestion: "좀 더 부드러운 표현을 사용해 보세요.",
  },
  driftCheck: { drifted: false },
  agentResponse: null,
};

export const MOCK_TURN_RESPONSE_AGENT = {
  ok: true,
  toneCheck: { passed: true, suggestion: null },
  driftCheck: { drifted: false },
  agentResponse: {
    personaName: "현실주의 직장인",
    content: "흥미로운 관점이네요.",
    delayMs: 1000,
  },
};

export const MOCK_SUMMARY_CARD = {
  id: "summary-001",
  sessionId: TEST_DIALOGUE_ID,
  keyArguments: {
    participantA: ["교육의 공정성이 가장 중요하다"],
    participantB: ["경제적 효율성을 우선해야 한다"],
  },
  commonGround: ["교육에 대한 새로운 관점 공유"],
  unresolvedQuestions: ["환경 정책의 우선순위"],
  blindSpots: [],
  createdAt: new Date().toISOString(),
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

export const MOCK_FRIENDS_MULTI = {
  friends: [
    {
      friendshipId: TEST_FRIENDSHIP_ID,
      friendUserId: TEST_FRIEND_USER_ID,
      dialogueCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      friendshipId: "e2e-friendship-002",
      friendUserId: "e2e-user-003",
      dialogueCount: 1,
      createdAt: new Date().toISOString(),
    },
    {
      friendshipId: "e2e-friendship-003",
      friendUserId: "e2e-user-004",
      dialogueCount: 0,
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
  myLevel: 2,
  theirLevel: 1,
  currentLevel: "STANCE",
  availableLevels: ["STANCE", "TOPIC", "FULL"],
};

export const MOCK_DISCLOSURE_MAX = {
  myLevel: 3,
  theirLevel: 2,
  currentLevel: "FULL",
  availableLevels: ["STANCE", "TOPIC", "FULL"],
};

export const MOCK_CHAT_ELIGIBILITY = {
  eligible: true,
  reason: null,
};

export const MOCK_CHAT_INELIGIBLE = {
  eligible: false,
  reason: "대화 2회 이상 + 라이트 프로토콜 1회 이상 필요",
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
  hasMore: false,
};

export const MOCK_OFFLINE_PROPOSAL = {
  id: TEST_PROPOSAL_ID,
  friendshipId: TEST_FRIENDSHIP_ID,
  proposerId: "e2e-user-001",
  status: "PENDING",
  proposedAt: new Date().toISOString(),
  locationHint: "강남역 카페",
  safetyCheckinStatus: "NOT_STARTED",
  createdAt: new Date().toISOString(),
};

export const MOCK_THOUGHT_MAP = {
  sessionId: TEST_SESSION_ID,
  vector: {
    TECH_REGULATION: 0.7,
    REDISTRIBUTION: 0.6,
    WORK_LIFE: 0.4,
    MERITOCRACY: -0.3,
    TECH_OPTIMISM: 0.5,
  },
  mapType: {
    name: "BALANCE_SEEKER",
    alias: "균형 탐색자",
    emoji: "\u2696\uFE0F",
    description: "다양한 관점을 균형있게 탐색하는 유형",
  },
  alias: {
    key: "CAREFUL_SCALE",
    label: "신중한 저울",
    emoji: "\u2696\uFE0F",
    description: "여러 관점을 차분하게 저울질하며, 극단보다 균형을 선호합니다.",
  },
  percentiles: [
    { dimension: "TECH_REGULATION", label: "기술 규제", percentile: 65, value: 0.7 },
    { dimension: "REDISTRIBUTION", label: "재분배", percentile: 55, value: 0.6 },
    { dimension: "WORK_LIFE", label: "일·생활", percentile: 40, value: 0.4 },
  ],
  precision: "initial" as const,
  baselineLabel: "한국 20대 기준",
};

export const MOCK_PASSPORT = {
  weeklyExploredCount: 2,
  totalExploredCount: 7,
  badges: [
    { id: "first-dialogue", name: "첫 대화", earned: true },
    { id: "explorer", name: "탐험가", earned: false },
  ],
  discoveredConcepts: [
    "공정한 절차가 반드시 공정한 결과를 보장하지 않는다",
    "효율성과 형평성은 항상 트레이드오프 관계에 있다",
    "자유 의지와 결정론은 양립 가능하다는 시각도 있다",
  ],
  savedPersonas: [
    {
      personaId: TEST_PERSONA_ID,
      name: "현실주의 직장인",
      conversationCount: 4,
      lastConversationAt: "2026-02-19",
    },
    {
      personaId: "persona-educator",
      name: "공감하는 교육자",
      conversationCount: 2,
      lastConversationAt: "2026-02-17",
    },
  ],
};

export const MOCK_DAILY_LIMIT = {
  remaining: 2,
  limit: 3,
  isLimited: false,
};

export const MOCK_FATIGUE = {
  score: 0.3,
  cooldownMode: "NONE",
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
        // Use fallback() instead of continue() so the request falls through
        // to the next registered handler for the same pattern, rather than
        // going to the real server (which would bypass mocking).
        await route.fallback();
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

/**
 * Collects console errors during test execution.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

/**
 * Checks if any horizontal scroll exists (responsive check).
 */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

/** Pre-configured mock sets for common test scenarios */
export const MOCK_ROUTES = {
  matching: [
    { pattern: "**/api/matching/candidates", response: MOCK_CANDIDATES },
    { pattern: "**/api/matching/personas", response: MOCK_PERSONAS },
    {
      pattern: "**/api/matching/proposals",
      response: { ok: true },
      method: "POST",
    },
  ],
  matchingEmpty: [
    {
      pattern: "**/api/matching/candidates",
      response: { candidates: [] },
    },
    { pattern: "**/api/matching/personas", response: { personas: [] } },
  ],
  matchingPersonaOnly: [
    {
      pattern: "**/api/matching/candidates",
      response: { candidates: [] },
    },
    { pattern: "**/api/matching/personas", response: MOCK_PERSONAS },
  ],
  dialogueList: [
    {
      pattern: "**/api/dialogue/sessions",
      response: MOCK_DIALOGUE_SESSIONS,
    },
  ],
  dialogueListAllStatuses: [
    {
      pattern: "**/api/dialogue/sessions",
      response: MOCK_DIALOGUE_SESSIONS_WITH_ALL_STATUSES,
    },
  ],
  dialogueDetail: (id: string) => [
    {
      pattern: `**/api/dialogue/sessions/${id}?**`,
      response: MOCK_DIALOGUE_DETAIL,
    },
    {
      pattern: `**/api/dialogue/sessions/${id}`,
      response: MOCK_DIALOGUE_DETAIL,
    },
    {
      pattern: `**/api/dialogue/sessions/${id}/turns`,
      response: MOCK_TURN_RESPONSE_OK,
      method: "POST",
    },
  ],
  dialogueCompleted: (id: string) => [
    {
      pattern: `**/api/dialogue/sessions/${id}?**`,
      response: MOCK_DIALOGUE_COMPLETED,
    },
    {
      pattern: `**/api/dialogue/sessions/${id}`,
      response: MOCK_DIALOGUE_COMPLETED,
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
  friendsMulti: [
    {
      pattern: "**/api/relationship/friends",
      response: MOCK_FRIENDS_MULTI,
    },
  ],
  friendDetail: (id: string) => [
    {
      pattern: `**/api/relationship/friends/${id}`,
      response: MOCK_FRIEND_DETAIL,
    },
    {
      pattern: `**/api/relationship/disclosure**`,
      response: MOCK_DISCLOSURE,
    },
    {
      pattern: `**/api/chat/${id}/eligibility`,
      response: MOCK_CHAT_ELIGIBILITY,
    },
  ],
  friendDetailIneligible: (id: string) => [
    {
      pattern: `**/api/relationship/friends/${id}`,
      response: MOCK_FRIEND_DETAIL,
    },
    {
      pattern: `**/api/relationship/disclosure**`,
      response: MOCK_DISCLOSURE,
    },
    {
      pattern: `**/api/chat/${id}/eligibility`,
      response: MOCK_CHAT_INELIGIBLE,
    },
  ],
  chat: (friendshipId: string) => [
    {
      pattern: `**/api/chat/${friendshipId}/messages`,
      response: MOCK_CHAT_MESSAGES,
    },
    {
      pattern: `**/api/chat/${friendshipId}/messages`,
      response: { id: "msg-new", ok: true },
      status: 201,
      method: "POST",
    },
  ],
  offlineDetail: (id: string) => [
    {
      pattern: `**/api/offline/proposals/${id}`,
      response: MOCK_OFFLINE_PROPOSAL,
    },
    {
      pattern: `**/api/offline/proposals/${id}/**`,
      response: { ...MOCK_OFFLINE_PROPOSAL, status: "CONFIRMED" },
      method: "POST",
    },
  ],
  safetyReport: [
    {
      pattern: "**/api/safety/report",
      response: { ok: true },
      status: 201,
      method: "POST",
    },
  ],
  passport: [
    { pattern: "**/api/passport", response: MOCK_PASSPORT },
  ],
  settings: [
    {
      pattern: "**/api/relationship/disclosure",
      response: { ok: true },
      method: "POST",
    },
    {
      pattern: "**/api/light-protocol",
      response: { ok: true },
      method: "POST",
    },
    {
      pattern: "**/api/relationship/friends/**",
      response: { ok: true },
      method: "DELETE",
    },
  ],
};
