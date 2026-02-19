import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { RelationshipEventType } from "@/domain/value-objects/relationship-event-type";

export class SupabaseEventRepository implements EventTracker {
  constructor(private readonly client: SupabaseClient) {}

  async track(
    eventType: RelationshipEventType,
    userId: string,
    targetId: string | null,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const { error } = await this.client.from("relationship_events").insert({
      event_type: eventType,
      user_id: userId,
      target_id: targetId,
      metadata,
    });

    if (error) {
      console.error(`Failed to track event ${eventType}: ${error.message}`);
    }
  }
}
