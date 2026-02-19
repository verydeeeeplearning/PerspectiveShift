export type JitaiActionType =
  | "downshift"
  | "coach_highlight"
  | "break_suggest"
  | "recovery"
  | "nudge_highlight";

export interface JitaiAction {
  type: JitaiActionType;
  params?: Record<string, unknown>;
  reason: string;
}
