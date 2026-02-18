import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReceiptRepository } from "@/domain/interfaces/receipt-repository";

export class SupabaseReceiptRepository implements ReceiptRepository {
  constructor(private readonly client: SupabaseClient) {}

  async markRead(messageId: string, readerId: string): Promise<void> {
    const { error } = await this.client
      .from("realtime_receipts")
      .upsert(
        { message_id: messageId, reader_id: readerId },
        { onConflict: "message_id,reader_id" },
      );

    if (error)
      throw new Error(`Failed to mark message read: ${error.message}`);
  }
}
