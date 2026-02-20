import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmitAgentDialogueTurnUseCase } from "../submit-agent-dialogue-turn";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { PersonaProfile } from "@/domain/entities/persona-profile";
import { StanceVector } from "@/domain/entities/stance-vector";

function createMockSession(participantB: string) {
  const now = new Date();
  return DialogueSession.create({
    id: "session-1",
    participantA: "user-1",
    participantB,
    currentStep: "POSITION",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
}

const mockPersona = PersonaProfile.create({
  id: "persona-educator",
  name: "공감하는 교육자",
  ageGroup: "40대",
  jobCategory: "교육직",
  stanceLabel: "사회 진보",
  description: "교육 현장의 경험을 바탕으로 사회 정책을 이야기합니다.",
  conversationStyle: "emotional",
  stanceVector: StanceVector.fromValues({
    TECH_REGULATION: 0.4,
    REDISTRIBUTION: 0.6,
    WORK_LIFE: 0.7,
    MERITOCRACY: -0.4,
    TECH_OPTIMISM: -0.1,
    OPPORTUNITY_EQUALITY: 0.8,
  }),
  experienceBank: ["20년간 중학교에서 학생들을 가르치고 있습니다."],
});

describe("SubmitAgentDialogueTurnUseCase", () => {
  let deps: {
    dialogueRepository: {
      saveSession: ReturnType<typeof vi.fn>;
      findSessionById: ReturnType<typeof vi.fn>;
      findSessionsByParticipant: ReturnType<typeof vi.fn>;
      saveTurn: ReturnType<typeof vi.fn>;
      updateSession: ReturnType<typeof vi.fn>;
      findActiveSessions: ReturnType<typeof vi.fn>;
    };
    piiScrubber: { scrub: ReturnType<typeof vi.fn> };
    facilitator: {
      checkTone: ReturnType<typeof vi.fn>;
      checkDrift: ReturnType<typeof vi.fn>;
      suggestReceptivenessTemplate: ReturnType<typeof vi.fn>;
      detectReceptiveExpressions: ReturnType<typeof vi.fn>;
    };
    personaRepository: {
      findById: ReturnType<typeof vi.fn>;
      findAll: ReturnType<typeof vi.fn>;
    };
    personaDialogueGenerator: { generateResponse: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    deps = {
      dialogueRepository: {
        saveSession: vi.fn().mockResolvedValue(undefined),
        findSessionById: vi.fn(),
        findSessionsByParticipant: vi.fn().mockResolvedValue([]),
        saveTurn: vi.fn().mockResolvedValue(undefined),
        updateSession: vi.fn().mockResolvedValue(undefined),
        findActiveSessions: vi.fn().mockResolvedValue([]),
      },
      piiScrubber: {
        scrub: vi.fn().mockReturnValue({
          scrubbed: "사용자 의견입니다",
          hasPii: false,
        }),
      },
      facilitator: {
        checkTone: vi.fn().mockResolvedValue({
          passed: true,
          suggestion: null,
        }),
        checkDrift: vi.fn().mockResolvedValue({
          drifted: false,
          suggestion: null,
        }),
        suggestReceptivenessTemplate: vi.fn(),
        detectReceptiveExpressions: vi.fn(),
      },
      personaRepository: {
        findById: vi.fn().mockResolvedValue(mockPersona),
        findAll: vi.fn().mockResolvedValue([]),
      },
      personaDialogueGenerator: {
        generateResponse: vi
          .fn()
          .mockResolvedValue("그 의견에 대해 생각해볼 점이 있어요."),
      },
    };
  });

  it("submits user turn and generates agent response for agent sessions", async () => {
    const session = createMockSession("agent:persona-educator");
    deps.dialogueRepository.findSessionById.mockResolvedValue(session);

    const useCase = new SubmitAgentDialogueTurnUseCase(deps);
    const result = await useCase.execute(
      "session-1",
      "user-1",
      "기회의 평등이 중요합니다",
    );

    // User turn saved
    expect(deps.dialogueRepository.saveTurn).toHaveBeenCalledTimes(2);

    // Agent response generated
    expect(deps.personaDialogueGenerator.generateResponse).toHaveBeenCalledWith(
      mockPersona,
      expect.any(Array),
      "사용자 의견입니다",
      expect.any(String),
    );

    // Agent response included
    expect(result.agentResponse).not.toBeNull();
    expect(result.agentResponse!.content).toBe(
      "그 의견에 대해 생각해볼 점이 있어요.",
    );
    expect(result.agentResponse!.personaName).toBe("공감하는 교육자");
    expect(result.agentResponse!.delayMs).toBeGreaterThan(0);

    // Session advanced (both submitted)
    expect(result.advanced).toBe(true);
    expect(result.newStep).toBe("QUESTION");
  });

  it("does not generate agent response for human sessions", async () => {
    const session = createMockSession("human-user-2");
    deps.dialogueRepository.findSessionById.mockResolvedValue(session);

    const useCase = new SubmitAgentDialogueTurnUseCase(deps);
    const result = await useCase.execute(
      "session-1",
      "user-1",
      "기회의 평등이 중요합니다",
    );

    // Only user turn saved
    expect(deps.dialogueRepository.saveTurn).toHaveBeenCalledTimes(1);

    // No agent response
    expect(result.agentResponse).toBeNull();

    // Session did not advance (only 1 participant submitted)
    expect(result.advanced).toBe(false);
    expect(result.newStep).toBe("POSITION");
  });

  it("throws when session not found", async () => {
    deps.dialogueRepository.findSessionById.mockResolvedValue(null);

    const useCase = new SubmitAgentDialogueTurnUseCase(deps);
    await expect(
      useCase.execute("nonexistent", "user-1", "test"),
    ).rejects.toThrow("Session nonexistent not found");
  });

  it("throws when persona not found for agent session", async () => {
    const session = createMockSession("agent:unknown-persona");
    deps.dialogueRepository.findSessionById.mockResolvedValue(session);
    deps.personaRepository.findById.mockResolvedValue(null);

    const useCase = new SubmitAgentDialogueTurnUseCase(deps);
    await expect(
      useCase.execute("session-1", "user-1", "test"),
    ).rejects.toThrow("Persona not found: unknown-persona");
  });

  it("includes tone and drift check results", async () => {
    const session = createMockSession("agent:persona-educator");
    deps.dialogueRepository.findSessionById.mockResolvedValue(session);
    deps.facilitator.checkTone.mockResolvedValue({
      passed: false,
      suggestion: "톤을 부드럽게 해주세요",
    });

    const useCase = new SubmitAgentDialogueTurnUseCase(deps);
    const result = await useCase.execute(
      "session-1",
      "user-1",
      "공격적인 텍스트",
    );

    expect(result.toneCheck.passed).toBe(false);
    expect(result.toneCheck.suggestion).toBe("톤을 부드럽게 해주세요");
  });
});
