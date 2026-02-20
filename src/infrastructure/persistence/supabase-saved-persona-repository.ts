import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedPersonaRepository } from "@/domain/interfaces/saved-persona-repository";
import { SavedPersona } from "@/domain/entities/saved-persona";

interface SavedPersonaRow {
  user_id: string;
  persona_id: string;
  conversation_count: number;
  last_conversation_at: string;
  conversation_summaries: string[];
  shared_context: string[];
  user_stance_memory: string[];
  saved_questions: string[];
}

function toEntity(row: SavedPersonaRow): SavedPersona {
  return SavedPersona.create({
    userId: row.user_id,
    personaId: row.persona_id,
    conversationCount: row.conversation_count,
    lastConversationAt: new Date(row.last_conversation_at),
    conversationSummaries: row.conversation_summaries ?? [],
    sharedContext: row.shared_context ?? [],
    userStanceMemory: row.user_stance_memory ?? [],
    savedQuestions: row.saved_questions ?? [],
  });
}

export class SupabaseSavedPersonaRepository implements SavedPersonaRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUserAndPersona(
    userId: string,
    personaId: string,
  ): Promise<SavedPersona | null> {
    const { data, error } = await this.supabase
      .from("saved_personas")
      .select("*")
      .eq("user_id", userId)
      .eq("persona_id", personaId)
      .single();
    if (error || !data) return null;
    return toEntity(data as SavedPersonaRow);
  }

  async save(savedPersona: SavedPersona): Promise<void> {
    const { error } = await this.supabase.from("saved_personas").upsert(
      {
        user_id: savedPersona.userId,
        persona_id: savedPersona.personaId,
        conversation_count: savedPersona.conversationCount,
        last_conversation_at: savedPersona.lastConversationAt.toISOString(),
        conversation_summaries: savedPersona.conversationSummaries,
        shared_context: savedPersona.sharedContext,
        user_stance_memory: savedPersona.userStanceMemory,
        saved_questions: savedPersona.savedQuestions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,persona_id" },
    );
    if (error) throw error;
  }

  async findByUser(userId: string): Promise<SavedPersona[]> {
    const { data, error } = await this.supabase
      .from("saved_personas")
      .select("*")
      .eq("user_id", userId)
      .order("last_conversation_at", { ascending: false });
    if (error || !data) return [];
    return (data as SavedPersonaRow[]).map(toEntity);
  }
}
