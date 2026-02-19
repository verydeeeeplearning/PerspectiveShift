import type { SupabaseClient } from "@supabase/supabase-js";
import type { RealtimeBroadcaster } from "@/domain/interfaces/realtime-broadcaster";

export class SupabaseRealtimeBroadcaster implements RealtimeBroadcaster {
  constructor(private readonly client: SupabaseClient) {}

  async broadcast(channel: string, event: string, payload: Record<string, unknown>): Promise<void> {
    const ch = this.client.channel(channel);
    await ch.send({ type: "broadcast", event, payload });
    await this.client.removeChannel(ch);
  }
}
