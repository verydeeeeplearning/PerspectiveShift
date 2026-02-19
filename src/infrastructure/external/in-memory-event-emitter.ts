import type { EventEmitter } from "@/domain/interfaces/event-emitter";
import type { AnalyticsEvent } from "@/domain/events/analytics-event";

export class InMemoryEventEmitter implements EventEmitter {
  private buffer: AnalyticsEvent[] = [];

  emit(event: AnalyticsEvent): void {
    this.buffer.push(event);
  }

  flush(): AnalyticsEvent[] {
    const events = [...this.buffer];
    this.buffer = [];
    return events;
  }
}
