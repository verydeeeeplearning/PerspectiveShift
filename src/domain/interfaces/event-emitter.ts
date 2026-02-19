import type { AnalyticsEvent } from "@/domain/events/analytics-event";

export interface EventEmitter {
  emit(event: AnalyticsEvent): void;
}
