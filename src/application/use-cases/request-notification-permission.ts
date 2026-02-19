interface RequestNotificationPermissionInput {
  hasCompletedDialogue: boolean;
  feelHeardScore: number;
  lastPromptedAt?: Date | null;
  now?: Date;
}

interface RequestNotificationPermissionOutput {
  shouldRequest: boolean;
  reason: "eligible" | "insufficient_experience" | "cooldown";
  earliestNextPromptAt: string | null;
}

const PROMPT_COOLDOWN_DAYS = 7;

export class RequestNotificationPermissionUseCase {
  execute(
    input: RequestNotificationPermissionInput,
  ): RequestNotificationPermissionOutput {
    const now = input.now ?? new Date();

    if (!input.hasCompletedDialogue || input.feelHeardScore < 3) {
      return {
        shouldRequest: false,
        reason: "insufficient_experience",
        earliestNextPromptAt: null,
      };
    }

    if (input.lastPromptedAt) {
      const elapsedMs = now.getTime() - input.lastPromptedAt.getTime();
      const cooldownMs = PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      if (elapsedMs < cooldownMs) {
        return {
          shouldRequest: false,
          reason: "cooldown",
          earliestNextPromptAt: new Date(
            input.lastPromptedAt.getTime() + cooldownMs,
          ).toISOString(),
        };
      }
    }

    return {
      shouldRequest: true,
      reason: "eligible",
      earliestNextPromptAt: null,
    };
  }
}
