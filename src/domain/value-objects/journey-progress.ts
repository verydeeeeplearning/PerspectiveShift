export const JOURNEY_PHASES = [
  { key: "THOUGHT_MAP", label: "내 생각 지도 만들기" },
  { key: "FIRST_DIALOGUE", label: "1번 대화 완료" },
  { key: "SAVE_PARTNER", label: "좋은 대화 상대 저장" },
] as const;

export type JourneyPhaseKey = (typeof JOURNEY_PHASES)[number]["key"];

interface JourneyProgressProps {
  completedPhases: JourneyPhaseKey[];
}

export class JourneyProgress {
  readonly completedPhases: readonly JourneyPhaseKey[];

  private constructor(props: JourneyProgressProps) {
    this.completedPhases = Object.freeze([...props.completedPhases]);
  }

  static create(completedPhases: JourneyPhaseKey[]): JourneyProgress {
    return new JourneyProgress({ completedPhases });
  }

  get currentPhaseIndex(): number {
    return this.completedPhases.length;
  }

  get isComplete(): boolean {
    return this.completedPhases.length >= JOURNEY_PHASES.length;
  }

  get nextAction(): string | null {
    if (this.isComplete) return null;
    return JOURNEY_PHASES[this.currentPhaseIndex].label;
  }

  get progress(): number {
    return this.completedPhases.length / JOURNEY_PHASES.length;
  }
}
