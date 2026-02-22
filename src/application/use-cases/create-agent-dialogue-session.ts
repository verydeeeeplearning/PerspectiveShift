import { DialogueSession } from "@/domain/entities/dialogue-session";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { TopicRecommender } from "@/domain/interfaces/topic-recommender";

export interface CreateAgentDialogueSessionInput {
  participantSessionId: string;
  personaId: string;
  topic?: string;
}

export interface CreateAgentDialogueSessionOutput {
  id: string;
  topic: string;
  currentStep: "POSITION";
  status: "ACTIVE";
  personaId: string;
}

export interface CreateAgentDialogueSessionDeps {
  personaRepository: PersonaRepository;
  dialogueRepository: DialogueRepository;
  topicRecommender: TopicRecommender;
  stanceRepository: StanceRepository;
}

export class CreateAgentDialogueSessionUseCase {
  constructor(private readonly deps: CreateAgentDialogueSessionDeps) {}

  async execute(
    input: CreateAgentDialogueSessionInput,
  ): Promise<CreateAgentDialogueSessionOutput> {
    const persona = await this.deps.personaRepository.findById(input.personaId);
    if (!persona) {
      throw new Error(`Persona not found: ${input.personaId}`);
    }

    let topic = input.topic?.trim();
    if (!topic) {
      topic = await this.recommendTopic(input.participantSessionId);
    }

    const now = new Date();
    const session = DialogueSession.create({
      id: crypto.randomUUID(),
      participantA: input.participantSessionId,
      participantB: `agent:${persona.id}`,
      topic,
      currentStep: "POSITION",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });

    await this.deps.dialogueRepository.saveSession(session);

    return {
      id: session.id,
      topic,
      currentStep: "POSITION",
      status: "ACTIVE",
      personaId: persona.id,
    };
  }

  private async recommendTopic(sessionId: string): Promise<string> {
    try {
      const stanceProfile =
        await this.deps.stanceRepository.findBySessionId(sessionId);
      const stanceVector = stanceProfile?.vector ?? StanceVector.neutral();

      const recentSessions =
        await this.deps.dialogueRepository.findSessionsByParticipant(sessionId);
      const recentTopicIds: string[] = [];
      // Exclude topics from recent sessions (not stored as IDs, so skip)

      const recommended = await this.deps.topicRecommender.recommend(
        stanceVector,
        recentTopicIds,
      );
      return recommended.title;
    } catch {
      return "자유 주제";
    }
  }
}
