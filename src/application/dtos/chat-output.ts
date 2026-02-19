export interface ChatMessageOutput {
  id: string;
  friendshipId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatHistoryOutput {
  messages: ChatMessageOutput[];
  hasMore: boolean;
}
