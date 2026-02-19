import { NotificationTemplate, type NotificationType } from "@/domain/value-objects/notification-template";

interface BuildNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
}

interface BuildNotificationResult {
  type: NotificationType;
  title: string;
  body: string;
}

export class BuildNotificationUseCase {
  execute(input: BuildNotificationInput): BuildNotificationResult {
    const t = NotificationTemplate.create(input);
    return { type: t.type, title: t.title, body: t.body };
  }
}
