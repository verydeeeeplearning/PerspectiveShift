import { describe, expect, it, vi } from "vitest";
import { CreateAgentDialogueSessionUseCase } from "../create-agent-dialogue-session";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { TopicRecommender } from "@/domain/interfaces/topic-recommender";
import { PersonaProfile } from "@/domain/entities/persona-profile";
import { StanceVector } from "@/domain/entities/stance-vector";
import { ControversialTopic } from "@/domain/value-objects/controversial-topic";
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

function makeMockTopic() {
  return ControversialTopic.create({
    id: "tr-01",
    title: "AI 챗봇에도 연령 제한을 둬야 하는가?",
    description: "청소년의 AI 사용을 규제할 필요성과 기술 접근권 사이의 균형을 논합니다.",
    dimensions: ["TECH_REGULATION"],
    tags: ["AI", "청소년", "규제"],
  });
}

function makeDialogueRepository(): DialogueRepository {
  const savedSessions: DialogueSession[] = [];
  return {
    saveSession: vi.fn(async (session: DialogueSession) => {
      savedSessions.push(session);
    }),
    findSessionById: vi.fn(),
    findSessionsByParticipant: vi.fn().mockResolvedValue([]),
    saveTurn: vi.fn(async (_turn: DialogueTurn) => {}),
    updateSession: vi.fn(),
    findActiveSessions: vi.fn(),
    _savedSessions: savedSessions,
  } as DialogueRepository & { _savedSessions: DialogueSession[] };
}

function makeStanceRepository(): StanceRepository {
  return {
    save: vi.fn(),
    findBySessionId: vi.fn().mockResolvedValue(null),
    update: vi.fn(),
  };
}

function makeTopicRecommender(): TopicRecommender {
  return {
    recommend: vi.fn().mockResolvedValue(makeMockTopic()),
  };
}

describe("CreateAgentDialogueSessionUseCase", () => {
  it("auto-recommends a topic when none provided", async () => {
    const dialogueRepository = makeDialogueRepository();
    const topicRecommender = makeTopicRecommender();

    const uc = new CreateAgentDialogueSessionUseCase({
      personaRepository: {
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(makePersona()),
      },
      dialogueRepository,
      topicRecommender,
      stanceRepository: makeStanceRepository(),
    });

    const result = await uc.execute({
      participantSessionId: "session-user",
      personaId: "persona-1",
    });

    expect(result.currentStep).toBe("POSITION");
    expect(result.status).toBe("ACTIVE");
    expect(result.topic).toBe("AI 챗봇에도 연령 제한을 둬야 하는가?");
    expect(topicRecommender.recommend).toHaveBeenCalledOnce();
    const saved = (dialogueRepository as DialogueRepository & { _savedSessions: DialogueSession[] })._savedSessions;
    expect(saved[0]?.participantA).toBe("session-user");
    expect(saved[0]?.participantB).toBe("agent:persona-1");
    expect(saved[0]?.topic).toBe("AI 챗봇에도 연령 제한을 둬야 하는가?");
  });

  it("uses provided topic when given", async () => {
    const topicRecommender = makeTopicRecommender();

    const uc = new CreateAgentDialogueSessionUseCase({
      personaRepository: {
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(makePersona()),
      },
      dialogueRepository: makeDialogueRepository(),
      topicRecommender,
      stanceRepository: makeStanceRepository(),
    });

    const result = await uc.execute({
      participantSessionId: "session-user",
      personaId: "persona-1",
      topic: "커스텀 주제",
    });

    expect(result.topic).toBe("커스텀 주제");
    expect(topicRecommender.recommend).not.toHaveBeenCalled();
  });

  it("throws when persona does not exist", async () => {
    const uc = new CreateAgentDialogueSessionUseCase({
      personaRepository: {
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(null),
      },
      dialogueRepository: makeDialogueRepository(),
      topicRecommender: makeTopicRecommender(),
      stanceRepository: makeStanceRepository(),
    });

    await expect(
      uc.execute({
        participantSessionId: "session-user",
        personaId: "missing",
      }),
    ).rejects.toThrow("Persona not found");
  });
});
