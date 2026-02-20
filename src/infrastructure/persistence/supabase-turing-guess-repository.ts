import type { SupabaseClient } from "@supabase/supabase-js";
import type { TuringGuessRepository } from "@/domain/interfaces/turing-guess-repository";
import { TuringGuess, type TuringSide } from "@/domain/entities/turing-guess";

interface TuringGuessRow {
  id: string;
  user_id: string;
  dialogue_session_id: string;
  guess: string;
  actual: string;
  created_at: string;
}

function toEntity(row: TuringGuessRow): TuringGuess {
  return TuringGuess.create({
    id: row.id,
    userId: row.user_id,
    dialogueSessionId: row.dialogue_session_id,
    guess: row.guess as TuringSide,
    actual: row.actual as TuringSide,
    createdAt: new Date(row.created_at),
  });
}

export class SupabaseTuringGuessRepository implements TuringGuessRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUser(userId: string): Promise<TuringGuess[]> {
    const { data, error } = await this.supabase
      .from("turing_guesses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as TuringGuessRow[]).map(toEntity);
  }

  async findByUserAndSession(
    userId: string,
    dialogueSessionId: string,
  ): Promise<TuringGuess | null> {
    const { data, error } = await this.supabase
      .from("turing_guesses")
      .select("*")
      .eq("user_id", userId)
      .eq("dialogue_session_id", dialogueSessionId)
      .single();
    if (error || !data) return null;
    return toEntity(data as TuringGuessRow);
  }

  async save(guess: TuringGuess): Promise<void> {
    const { error } = await this.supabase.from("turing_guesses").upsert(
      {
        id: guess.id,
        user_id: guess.userId,
        dialogue_session_id: guess.dialogueSessionId,
        guess: guess.guess,
        actual: guess.actual,
        created_at: guess.createdAt.toISOString(),
      },
      { onConflict: "user_id,dialogue_session_id" },
    );
    if (error) throw error;
  }
}
