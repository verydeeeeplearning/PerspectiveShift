import type { SavedPersona } from "@/domain/entities/saved-persona";

export interface SavedPersonaRepository {
  findByUserAndPersona(userId: string, personaId: string): Promise<SavedPersona | null>;
  save(savedPersona: SavedPersona): Promise<void>;
  findByUser(userId: string): Promise<SavedPersona[]>;
}
