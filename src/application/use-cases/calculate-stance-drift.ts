import { StanceDrift } from "@/domain/entities/stance-drift";

interface AxisDriftInput {
  axis: string;
  previousValue: number;
  currentValue: number;
}

interface CalculateStanceDriftInput {
  userId: string;
  dialogueCount: number;
  axes: AxisDriftInput[];
  lastNotifiedAt: Date | null;
}

interface CalculateStanceDriftResult {
  significantAxes: string[];
  canNotify: boolean;
}

export class CalculateStanceDriftUseCase {
  execute(input: CalculateStanceDriftInput): CalculateStanceDriftResult {
    const driftByAxis = input.axes.map((a) => ({
      axis: a.axis,
      previousValue: a.previousValue,
      currentValue: a.currentValue,
      drift: a.currentValue - a.previousValue,
    }));
    const sd = StanceDrift.create({
      userId: input.userId,
      dialogueCount: input.dialogueCount,
      driftByAxis,
      lastNotifiedAt: input.lastNotifiedAt,
    });
    return {
      significantAxes: sd.significantDrifts.map((d) => d.axis),
      canNotify: sd.canNotify,
    };
  }
}
