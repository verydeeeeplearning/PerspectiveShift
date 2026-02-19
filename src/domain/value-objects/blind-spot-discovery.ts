interface BlindSpotDiscoveryProps {
  discoveredConcept: string;
  dialogueId: string;
}

export class BlindSpotDiscovery {
  readonly discoveredConcept: string;
  readonly dialogueId: string;

  private constructor(props: { discoveredConcept: string; dialogueId: string }) {
    this.discoveredConcept = props.discoveredConcept;
    this.dialogueId = props.dialogueId;
  }

  static create(props: BlindSpotDiscoveryProps): BlindSpotDiscovery {
    const trimmed = props.discoveredConcept.trim();
    if (!trimmed) throw new Error("discoveredConcept must not be empty");
    return new BlindSpotDiscovery({ discoveredConcept: trimmed, dialogueId: props.dialogueId });
  }
}
