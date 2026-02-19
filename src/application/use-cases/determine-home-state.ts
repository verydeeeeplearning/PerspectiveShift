import { HomeState, type HomeStateType } from "@/domain/value-objects/home-state";

interface DetermineHomeStateInput {
  hasThoughtMap: boolean;
  hasActiveMatch: boolean;
  lastDialogueCompletedAt: Date | null;
  friendCount: number;
  lastVisitAt: Date | null;
}

interface DetermineHomeStateResult {
  state: HomeStateType;
}

export class DetermineHomeStateUseCase {
  execute(input: DetermineHomeStateInput): DetermineHomeStateResult {
    const hs = HomeState.determine(input);
    return { state: hs.state };
  }
}
