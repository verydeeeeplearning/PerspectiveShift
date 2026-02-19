import type { DialogueSession } from "../entities/dialogue-session";
import type { DialogueTurn } from "../entities/dialogue-turn";

export interface DialogueRepository {
  saveSession(session: DialogueSession): Promise<void>;

  findSessionById(id: string): Promise<DialogueSession | null>;

  findSessionsByParticipant(
    participantId: string,
  ): Promise<DialogueSession[]>;

  saveTurn(turn: DialogueTurn): Promise<void>;

  updateSession(session: DialogueSession): Promise<void>;

  findActiveSessions(): Promise<DialogueSession[]>;
}
