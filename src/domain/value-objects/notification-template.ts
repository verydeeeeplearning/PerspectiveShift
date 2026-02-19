export const NOTIFICATION_TYPES = ["INSIGHT", "CURIOSITY", "ACTION"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_FREQUENCIES = ["ALL", "ESSENTIAL", "OFF"] as const;
export type NotificationFrequency = (typeof NOTIFICATION_FREQUENCIES)[number];

interface NotificationTemplateProps {
  type: NotificationType;
  title: string;
  body: string;
}

export class NotificationTemplate {
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;

  private constructor(props: NotificationTemplateProps) {
    this.type = props.type;
    this.title = props.title;
    this.body = props.body;
  }

  static create(props: NotificationTemplateProps): NotificationTemplate {
    return new NotificationTemplate(props);
  }
}

export class NotificationPreference {
  readonly frequency: NotificationFrequency;

  private constructor(frequency: NotificationFrequency) {
    this.frequency = frequency;
  }

  static createDefault(): NotificationPreference {
    return new NotificationPreference("ESSENTIAL");
  }

  static create(frequency: NotificationFrequency): NotificationPreference {
    return new NotificationPreference(frequency);
  }

  get isEnabled(): boolean {
    return this.frequency !== "OFF";
  }

  shouldSend(type: NotificationType): boolean {
    if (this.frequency === "OFF") return false;
    if (this.frequency === "ALL") return true;
    return type === "INSIGHT" || type === "ACTION";
  }
}
