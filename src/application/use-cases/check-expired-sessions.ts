import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";

export interface CheckExpiredSessionsDeps {
  dialogueRepository: DialogueRepository;
}

export interface ExpirationResult {
  reminded: string[];
  expired: string[];
}

export class CheckExpiredSessionsUseCase {
  private deps: CheckExpiredSessionsDeps;

  constructor(deps: CheckExpiredSessionsDeps) {
    this.deps = deps;
  }

  async execute(): Promise<ExpirationResult> {
    const activeSessions =
      await this.deps.dialogueRepository.findActiveSessions();

    const now = new Date();
    const reminded: string[] = [];
    const expired: string[] = [];

    for (const session of activeSessions) {
      if (session.shouldExpire(now)) {
        session.markExpired();
        await this.deps.dialogueRepository.updateSession(session);
        expired.push(session.id);
      } else if (session.needsReminder(now)) {
        reminded.push(session.id);
      }
    }

    return { reminded, expired };
  }
}
