import type { SupabaseClient } from "@supabase/supabase-js";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import { ChatMessage } from "@/domain/entities/chat-message";

interface MessageRow {
  id: string;
  friendship_id: string;
  sender_id: string;
  content: string;
  pii_scrubbed: boolean;
  created_at: string;
}

export class SupabaseMessageRepository implements MessageRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(message: ChatMessage): Promise<void> {
    const { error } = await this.client
      .from("realtime_messages")
      .insert({
        id: message.id,
        friendship_id: message.friendshipId,
        sender_id: message.senderId,
        content: message.content,
        pii_scrubbed: message.piiScrubbed,
        created_at: message.createdAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save message: ${error.message}`);
  }

  async findByFriendship(
    friendshipId: string,
    limit: number,
    before?: Date,
  ): Promise<ChatMessage[]> {
    let query = this.client
      .from("realtime_messages")
      .select("*")
      .eq("friendship_id", friendshipId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("created_at", before.toISOString());
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to query messages: ${error.message}`);

    return (data ?? []).map((row: MessageRow) => this.rowToMessage(row));
  }

  async findById(id: string): Promise<ChatMessage | null> {
    const { data, error } = await this.client
      .from("realtime_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find message: ${error.message}`);
    }

    return this.rowToMessage(data as MessageRow);
  }

  private rowToMessage(row: MessageRow): ChatMessage {
    return ChatMessage.create({
      id: row.id,
      friendshipId: row.friendship_id,
      senderId: row.sender_id,
      content: row.content,
      piiScrubbed: row.pii_scrubbed,
      createdAt: new Date(row.created_at),
    });
  }
}
