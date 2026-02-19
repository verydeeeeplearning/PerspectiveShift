import type { SavedPersonaRepository } from "@/domain/interfaces/saved-persona-repository";
import type { SavedPersona } from "@/domain/entities/saved-persona";

export class InMemorySavedPersonaRepository implements SavedPersonaRepository {
  private readonly records = new Map<string, SavedPersona>();

  async findByUserAndPersona(
    userId: string,
    personaId: string,
  ): Promise<SavedPersona | null> {
    return this.records.get(this.key(userId, personaId)) ?? null;
  }

  async save(savedPersona: SavedPersona): Promise<void> {
    this.records.set(this.key(savedPersona.userId, savedPersona.personaId), savedPersona);
  }

  async findByUser(userId: string): Promise<SavedPersona[]> {
    const items: SavedPersona[] = [];
    for (const record of this.records.values()) {
      if (record.userId === userId) {
        items.push(record);
      }
    }
    return items.sort(
      (a, b) => b.lastConversationAt.getTime() - a.lastConversationAt.getTime(),
    );
  }

  private key(userId: string, personaId: string): string {
    return `${userId}:${personaId}`;
  }
}
