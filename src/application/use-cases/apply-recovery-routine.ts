import { RecoveryRoutine } from "@/domain/entities/recovery-routine";
import {
  RECOVERY_PROMISE_TYPES,
  RecoveryPromise,
  type RecoveryPromiseType,
} from "@/domain/value-objects/recovery-promise";

interface ApplyRecoveryRoutineInput {
  dialogueId: string;
  selectedPromiseTypes?: readonly RecoveryPromiseType[];
}

interface CheckRecoveryReleaseInput {
  routine: RecoveryRoutine;
  feelHeardScore: number;
  manualRelease?: boolean;
}

interface ApplyRecoveryRoutineResult {
  dialogueId: string;
  topicLevel: number;
  distanceBandMin: number;
  distanceBandMax: number;
  facilitatorIntensity: number;
  dialogueExcluded: boolean;
  messages: readonly string[];
  promises: readonly {
    id: string;
    text: string;
    type: RecoveryPromiseType;
  }[];
  recoveryMode: boolean;
  recoveryBadge?: string;
  autoReleaseCount: number;
}

export class ApplyRecoveryRoutineUseCase {
  execute(input: ApplyRecoveryRoutineInput): ApplyRecoveryRoutineResult {
    const routine = RecoveryRoutine.create(
      input.dialogueId,
      this.resolvePromises(input.selectedPromiseTypes),
    );
    return this.toResult(routine);
  }

  checkRelease(input: CheckRecoveryReleaseInput): ApplyRecoveryRoutineResult {
    const nextRoutine = input.manualRelease
      ? input.routine.releaseManually()
      : input.routine.advanceRecovery(input.feelHeardScore);
    return this.toResult(nextRoutine);
  }

  private resolvePromises(
    selectedPromiseTypes: readonly RecoveryPromiseType[] | undefined,
  ): readonly RecoveryPromise[] {
    const selected = new Set(selectedPromiseTypes ?? RECOVERY_PROMISE_TYPES);
    return RecoveryPromise.defaultSet().filter((promise) => selected.has(promise.type));
  }

  private toResult(routine: RecoveryRoutine): ApplyRecoveryRoutineResult {
    return {
      dialogueId: routine.dialogueId,
      topicLevel: routine.action.topicLevel,
      distanceBandMin: routine.action.distanceBandMin,
      distanceBandMax: routine.action.distanceBandMax,
      facilitatorIntensity: routine.action.facilitatorIntensity,
      dialogueExcluded: routine.action.dialogueExcluded,
      messages: routine.messages,
      promises: routine.promises.map((promise) => ({
        id: promise.id,
        text: promise.text,
        type: promise.type,
      })),
      recoveryMode: routine.recoveryMode,
      recoveryBadge: routine.recoveryBadge,
      autoReleaseCount: routine.autoReleaseCount,
    };
  }
}
