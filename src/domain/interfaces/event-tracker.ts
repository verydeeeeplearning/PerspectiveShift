import type { RelationshipEventType } from "../value-objects/relationship-event-type";

export interface EventTracker {
  track(
    eventType: RelationshipEventType,
    userId: string,
    targetId: string | null,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
}
