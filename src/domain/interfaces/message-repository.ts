import type { ChatMessage } from "../entities/chat-message";

export interface MessageRepository {
  save(message: ChatMessage): Promise<void>;
  findByFriendship(friendshipId: string, limit: number, before?: Date): Promise<ChatMessage[]>;
  findById(id: string): Promise<ChatMessage | null>;
}
