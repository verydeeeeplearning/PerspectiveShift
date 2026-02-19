import type { PersonaProfile } from "../entities/persona-profile";

export interface PersonaRepository {
  findAll(): Promise<PersonaProfile[]>;
  findById(id: string): Promise<PersonaProfile | null>;
}
