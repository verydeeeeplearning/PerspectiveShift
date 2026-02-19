interface StanceDriftPreferenceProps {
  optedIn: boolean;
}

export class StanceDriftPreference {
  readonly optedIn: boolean;

  private constructor(props: StanceDriftPreferenceProps) {
    this.optedIn = props.optedIn;
  }

  static createDefault(): StanceDriftPreference {
    return new StanceDriftPreference({ optedIn: false });
  }

  static create(optedIn: boolean): StanceDriftPreference {
    return new StanceDriftPreference({ optedIn });
  }

  optIn(): StanceDriftPreference {
    return new StanceDriftPreference({ optedIn: true });
  }

  optOut(): StanceDriftPreference {
    return new StanceDriftPreference({ optedIn: false });
  }
}
