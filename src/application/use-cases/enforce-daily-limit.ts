import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import { DialogueLimit, type DialogueLimitResult } from "@/domain/services/dialogue-limit";

export interface EnforceDailyLimitDeps {
  dialogueRepository: DialogueRepository;
}

export class EnforceDailyLimitUseCase {
  constructor(private readonly deps: EnforceDailyLimitDeps) {}

  async execute(participantId: string): Promise<DialogueLimitResult> {
    const todaySessions = await this.deps.dialogueRepository.findSessionsByParticipant(participantId);
    return DialogueLimit.check(todaySessions.length);
  }
}
