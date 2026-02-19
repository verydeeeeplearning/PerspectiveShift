import type {
  JitaiAction,
  JitaiActionType,
} from "@/domain/value-objects/intervention-action";

export interface MatchingParams {
  topicLevel: number;
  distanceBandMin: number;
  distanceBandMax: number;
  facilitatorIntensity: number;
}

const CLAMP = {
  topicMin: 0,
  topicMax: 3,
  distanceMin: 0,
  distanceMax: 1,
  facilitatorMin: 0.4,
  facilitatorMax: 1.2,
};

export class ApplyDownshiftUseCase {
  execute(actions: readonly JitaiAction[], current: MatchingParams): MatchingParams {
    return actions.reduce((acc, action) => this.applyAction(acc, action), {
      ...current,
    });
  }

  private applyAction(current: MatchingParams, action: JitaiAction): MatchingParams {
    const next = { ...current };

    if (action.type === "downshift") {
      next.topicLevel = this.clampTopic(current.topicLevel - 1);
      next.distanceBandMin = this.clampDistance(Math.max(0.15, current.distanceBandMin - 0.1));
      next.distanceBandMax = this.clampDistance(Math.min(0.35, current.distanceBandMax));
      next.facilitatorIntensity = this.clampFacilitator(current.facilitatorIntensity + 0.2);
      return next;
    }

    if (this.isRecoveryAction(action.type)) {
      next.topicLevel = this.clampTopic(current.topicLevel - 1);
      next.distanceBandMin = this.clampDistance(0.2);
      next.distanceBandMax = this.clampDistance(0.3);
      next.facilitatorIntensity = this.clampFacilitator(1);
      return next;
    }

    if (action.type === "coach_highlight" || action.type === "nudge_highlight") {
      next.facilitatorIntensity = this.clampFacilitator(current.facilitatorIntensity + 0.1);
      return next;
    }

    return next;
  }

  private isRecoveryAction(actionType: JitaiActionType): boolean {
    return actionType === "break_suggest" || actionType === "recovery";
  }

  private clampTopic(value: number): number {
    return Math.max(CLAMP.topicMin, Math.min(CLAMP.topicMax, value));
  }

  private clampDistance(value: number): number {
    return Math.max(CLAMP.distanceMin, Math.min(CLAMP.distanceMax, value));
  }

  private clampFacilitator(value: number): number {
    return Math.max(CLAMP.facilitatorMin, Math.min(CLAMP.facilitatorMax, value));
  }
}
