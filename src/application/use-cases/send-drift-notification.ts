import { StanceDriftNotification } from "@/domain/value-objects/stance-drift-notification";

interface SendDriftNotificationInput {
  axis: string;
  direction: string;
  periodWeeks: number;
}

interface SendDriftNotificationResult {
  message: string;
  axis: string;
}

export class SendDriftNotificationUseCase {
  execute(input: SendDriftNotificationInput): SendDriftNotificationResult {
    const n = StanceDriftNotification.create(input);
    return { message: n.message, axis: n.axis };
  }
}
