import { describe, expect, it, vi } from "vitest";
import { CreateAgentDialogueSessionUseCase } from "../create-agent-dialogue-session";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import { PersonaProfile } from "@/domain/entities/persona-profile";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { DialogueSession } from "@/domain/entities/dialogue-session";
import type { DialogueTurn } from "@/domain/entities/dialogue-turn";

function makePersona() {
  return PersonaProfile.create({
    id: "persona-1",
    name: "테스트 페르소나",
    ageGroup: "30대",
    jobCategory: "학생",
    stanceLabel: "중도",
    description: "desc",
    conversationStyle: "careful",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0,
      REDISTRIBUTION: 0,
      WORK_LIFE: 0,
      MERITOCRACY: 0,
      TECH_OPTIMISM: 0,
      OPPORTUNITY_EQUALITY: 0,
    }),
    experienceBank: [],
  });
}

describe("CreateAgentDialogueSessionUseCase", () => {
  it("creates agent session with initial position step", async () => {
    const savedSessions: DialogueSession[] = [];

    const personaRepository: PersonaRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(makePersona()),
    };

    const dialogueRepository: DialogueRepository = {
      saveSession: vi.fn(async (session: DialogueSession) => {
        savedSessions.push(session);
      }),
      findSessionById: vi.fn(),
      findSessionsByParticipant: vi.fn(),
      saveTurn: vi.fn(),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn(),
    };

    const uc = new CreateAgentDialogueSessionUseCase({
      personaRepository,
      dialogueRepository,
    });

    const result = await uc.execute({
      participantSessionId: "session-user",
      personaId: "persona-1",
    });

    expect(result.currentStep).toBe("POSITION");
    expect(result.status).toBe("ACTIVE");
    expect(savedSessions[0]?.participantA).toBe("session-user");
    expect(savedSessions[0]?.participantB).toBe("agent:persona-1");
    expect(savedSessions[0]?.id).toBe(result.id);
  });

  it("throws when persona does not exist", async () => {
    const personaRepository: PersonaRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
    };

    const dialogueRepository: DialogueRepository = {
      saveSession: vi.fn(),
      findSessionById: vi.fn(),
      findSessionsByParticipant: vi.fn(),
      saveTurn: vi.fn(async (_turn: DialogueTurn) => {}),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn(),
    };

    const uc = new CreateAgentDialogueSessionUseCase({
      personaRepository,
      dialogueRepository,
    });

    await expect(
      uc.execute({
        participantSessionId: "session-user",
        personaId: "missing",
      }),
    ).rejects.toThrow("Persona not found");
  });
});
