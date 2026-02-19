import { RecoveryRoutine } from "@/domain/entities/recovery-routine";

interface ApplyRecoveryRoutineInput {
  dialogueId: string;
}

interface ApplyRecoveryRoutineResult {
  dialogueId: string;
  topicLevel: number;
  distanceBandMin: number;
  distanceBandMax: number;
  facilitatorIntensity: number;
  dialogueExcluded: boolean;
  messages: readonly string[];
}

export class ApplyRecoveryRoutineUseCase {
  execute(input: ApplyRecoveryRoutineInput): ApplyRecoveryRoutineResult {
    const routine = RecoveryRoutine.create(input.dialogueId);
    return {
      dialogueId: routine.dialogueId,
      topicLevel: routine.action.topicLevel,
      distanceBandMin: routine.action.distanceBandMin,
      distanceBandMax: routine.action.distanceBandMax,
      facilitatorIntensity: routine.action.facilitatorIntensity,
      dialogueExcluded: routine.action.dialogueExcluded,
      messages: routine.messages,
    };
  }
}
