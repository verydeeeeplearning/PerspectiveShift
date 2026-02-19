import { NotificationPreference, type NotificationFrequency } from "@/domain/value-objects/notification-template";

interface ManagePreferenceInput {
  frequency: NotificationFrequency;
}

interface ManagePreferenceResult {
  frequency: NotificationFrequency;
  isEnabled: boolean;
}

export class ManageNotificationPreferenceUseCase {
  execute(input: ManagePreferenceInput): ManagePreferenceResult {
    const p = NotificationPreference.create(input.frequency);
    return { frequency: p.frequency, isEnabled: p.isEnabled };
  }
}
