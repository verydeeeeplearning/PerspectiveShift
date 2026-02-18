export interface ReceiptRepository {
  markRead(messageId: string, readerId: string): Promise<void>;
}
