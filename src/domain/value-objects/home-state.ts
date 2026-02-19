export const HOME_STATES = [
  "FIRST_VISIT",
  "MAP_COMPLETED",
  "WAITING_MATCH",
  "POST_DIALOGUE_D1",
  "HAS_FRIENDS",
  "RETURNING_AFTER_14D",
] as const;

export type HomeStateType = (typeof HOME_STATES)[number];

interface UserProfile {
  hasThoughtMap: boolean;
  hasActiveMatch: boolean;
  lastDialogueCompletedAt: Date | null;
  friendCount: number;
  lastVisitAt: Date | null;
}

export class HomeState {
  readonly state: HomeStateType;

  private constructor(state: HomeStateType) {
    this.state = state;
  }

  static determine(profile: UserProfile): HomeState {
    const now = Date.now();

    if (profile.lastVisitAt) {
      const daysSinceVisit = (now - profile.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceVisit >= 14) return new HomeState("RETURNING_AFTER_14D");
    }

    if (!profile.hasThoughtMap) return new HomeState("FIRST_VISIT");

    if (profile.lastDialogueCompletedAt) {
      const daysSince = (now - profile.lastDialogueCompletedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 1) return new HomeState("POST_DIALOGUE_D1");
    }

    if (profile.friendCount > 0) return new HomeState("HAS_FRIENDS");
    if (profile.hasActiveMatch) return new HomeState("WAITING_MATCH");

    return new HomeState("MAP_COMPLETED");
  }
}
