interface PerspectivePassportProps {
  weeklyExploredCount: number;
  totalExploredCount: number;
  discoveredConcepts: string[];
}

export class PerspectivePassport {
  readonly weeklyExploredCount: number;
  readonly totalExploredCount: number;
  readonly discoveredConcepts: readonly string[];

  private constructor(props: PerspectivePassportProps) {
    this.weeklyExploredCount = props.weeklyExploredCount;
    this.totalExploredCount = props.totalExploredCount;
    this.discoveredConcepts = Object.freeze([...props.discoveredConcepts]);
  }

  static create(props: PerspectivePassportProps): PerspectivePassport {
    return new PerspectivePassport(props);
  }

  static empty(): PerspectivePassport {
    return new PerspectivePassport({
      weeklyExploredCount: 0,
      totalExploredCount: 0,
      discoveredConcepts: [],
    });
  }

  addDiscovery(concept: string): PerspectivePassport {
    return new PerspectivePassport({
      weeklyExploredCount: this.weeklyExploredCount + 1,
      totalExploredCount: this.totalExploredCount + 1,
      discoveredConcepts: [...this.discoveredConcepts, concept],
    });
  }
}
