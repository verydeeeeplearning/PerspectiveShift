export interface ChatMessageProps {
  id: string;
  friendshipId: string;
  senderId: string;
  content: string;
  piiScrubbed: boolean;
  createdAt: Date;
}

export class ChatMessage {
  readonly id: string;
  readonly friendshipId: string;
  readonly senderId: string;
  readonly content: string;
  readonly piiScrubbed: boolean;
  readonly createdAt: Date;

  private constructor(props: ChatMessageProps) {
    this.id = props.id;
    this.friendshipId = props.friendshipId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.piiScrubbed = props.piiScrubbed;
    this.createdAt = props.createdAt;
  }

  static create(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props);
  }
}
