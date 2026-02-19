import type { SupabaseClient } from "@supabase/supabase-js";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";
import type { DialogueStep } from "@/domain/value-objects/dialogue-step";
import type { SessionStatus } from "@/domain/value-objects/session-status";

interface SessionRow {
  id: string;
  participant_a: string;
  participant_b: string;
  current_step: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

interface TurnRow {
  id: string;
  session_id: string;
  step: string;
  participant_id: string;
  content: string;
  created_at: string;
}

export class SupabaseDialogueRepository implements DialogueRepository {
  constructor(private readonly client: SupabaseClient) {}

  async saveSession(session: DialogueSession): Promise<void> {
    const { error } = await this.client
      .from("dialogue_sessions")
      .insert({
        id: session.id,
        participant_a: session.participantA,
        participant_b: session.participantB,
        current_step: session.currentStep,
        status: session.status,
        created_at: session.createdAt.toISOString(),
        updated_at: session.updatedAt.toISOString(),
        last_activity_at: session.lastActivityAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save session: ${error.message}`);
  }

  async findSessionById(id: string): Promise<DialogueSession | null> {
    const { data: sessionData, error: sessionError } = await this.client
      .from("dialogue_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") return null;
      throw new Error(`Failed to find session: ${sessionError.message}`);
    }

    const { data: turnsData, error: turnsError } = await this.client
      .from("dialogue_turns")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (turnsError) throw new Error(`Failed to load turns: ${turnsError.message}`);

    const row = sessionData as SessionRow;
    const turns = ((turnsData ?? []) as TurnRow[]).map(this.rowToTurn);

    return DialogueSession.reconstitute({
      id: row.id,
      participantA: row.participant_a,
      participantB: row.participant_b,
      currentStep: row.current_step as DialogueStep,
      status: row.status as SessionStatus,
      turns,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastActivityAt: new Date(row.last_activity_at),
    });
  }

  async findSessionsByParticipant(
    participantId: string,
  ): Promise<DialogueSession[]> {
    const { data, error } = await this.client
      .from("dialogue_sessions")
      .select("*")
      .or(`participant_a.eq.${participantId},participant_b.eq.${participantId}`)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to query sessions: ${error.message}`);

    return (data ?? []).map((row: SessionRow) =>
      DialogueSession.reconstitute({
        id: row.id,
        participantA: row.participant_a,
        participantB: row.participant_b,
        currentStep: row.current_step as DialogueStep,
        status: row.status as SessionStatus,
        turns: [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        lastActivityAt: new Date(row.last_activity_at),
      }),
    );
  }

  async saveTurn(turn: DialogueTurn): Promise<void> {
    const { error } = await this.client
      .from("dialogue_turns")
      .insert({
        id: turn.id,
        session_id: turn.sessionId,
        step: turn.step,
        participant_id: turn.participantId,
        content: turn.content,
        created_at: turn.createdAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save turn: ${error.message}`);
  }

  async updateSession(session: DialogueSession): Promise<void> {
    const { error } = await this.client
      .from("dialogue_sessions")
      .update({
        current_step: session.currentStep,
        status: session.status,
        updated_at: session.updatedAt.toISOString(),
        last_activity_at: session.lastActivityAt.toISOString(),
      })
      .eq("id", session.id);

    if (error) throw new Error(`Failed to update session: ${error.message}`);
  }

  async findActiveSessions(): Promise<DialogueSession[]> {
    const { data, error } = await this.client
      .from("dialogue_sessions")
      .select("*")
      .eq("status", "ACTIVE");

    if (error) throw new Error(`Failed to query active sessions: ${error.message}`);

    return (data ?? []).map((row: SessionRow) =>
      DialogueSession.reconstitute({
        id: row.id,
        participantA: row.participant_a,
        participantB: row.participant_b,
        currentStep: row.current_step as DialogueStep,
        status: row.status as SessionStatus,
        turns: [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        lastActivityAt: new Date(row.last_activity_at),
      }),
    );
  }

  private rowToTurn(row: TurnRow): DialogueTurn {
    return DialogueTurn.create({
      id: row.id,
      sessionId: row.session_id,
      step: row.step as DialogueStep,
      participantId: row.participant_id,
      content: row.content,
      createdAt: new Date(row.created_at),
    });
  }
}
