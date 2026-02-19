import {
  createAnalyticsEvent,
  type AnalyticsEventType,
  type EventMetadata,
  type AnalyticsEvent,
} from "@/domain/events/analytics-event";
import type { EventEmitter } from "@/domain/interfaces/event-emitter";

interface TrackEventInput {
  type: AnalyticsEventType;
  payload: Record<string, unknown>;
  metadata: EventMetadata;
}

export interface TrackEventDeps {
  eventEmitter: EventEmitter;
}

export class TrackEventUseCase {
  constructor(private readonly deps: TrackEventDeps) {}

  execute(input: TrackEventInput): AnalyticsEvent {
    const event = createAnalyticsEvent(input.type, input.payload, input.metadata);
    this.deps.eventEmitter.emit(event);
    return event;
  }
}
