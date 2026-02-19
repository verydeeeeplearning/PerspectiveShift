interface StanceDriftNotificationProps {
  axis: string;
  direction: string;
  periodWeeks: number;
}

export class StanceDriftNotification {
  readonly axis: string;
  readonly direction: string;
  readonly periodWeeks: number;

  private constructor(props: StanceDriftNotificationProps) {
    this.axis = props.axis;
    this.direction = props.direction;
    this.periodWeeks = props.periodWeeks;
  }

  static create(props: StanceDriftNotificationProps): StanceDriftNotification {
    return new StanceDriftNotification(props);
  }

  get message(): string {
    return `${this.periodWeeks}주 전보다 ${this.axis} 이슈에서 당신의 입장이 ${this.direction}에 가까워졌어요.`;
  }
}
