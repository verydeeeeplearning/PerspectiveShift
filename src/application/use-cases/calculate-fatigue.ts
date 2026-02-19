import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import { FatigueScore } from "@/domain/value-objects/fatigue-score";
import { CooldownMode } from "@/domain/value-objects/cooldown-mode";

export interface CalculateFatigueDeps {
  dialogueRepository: DialogueRepository;
  feedbackRepository: FeedbackRepository;
}

export interface FatigueResult {
  level: "LOW" | "MEDIUM" | "HIGH";
  needsCooldown: boolean;
  cooldown?: { active: boolean; reason: string; suggestedActivity: string };
}

export class CalculateFatigueUseCase {
  constructor(private readonly deps: CalculateFatigueDeps) {}

  async execute(participantId: string): Promise<FatigueResult> {
    const sessions = await this.deps.dialogueRepository.findSessionsByParticipant(participantId);
    const recentDialogueCount = sessions.length;

    const latestFeedback = sessions.length > 0
      ? await this.deps.feedbackRepository.findFeedback(sessions[0].id, participantId)
      : null;

    const negativeEmotions = new Set(["frustrated", "angry", "exhausted", "annoyed", "sad"]);
    const negativeEmotionRecent = latestFeedback?.emotionCheckIn
      ? negativeEmotions.has(latestFeedback.emotionCheckIn)
      : false;

    const score = FatigueScore.calculate({
      recentDialogueCount,
      negativeEmotionRecent,
      averageSessionMinutes: 15,
      sessionMinutesTrend: "STABLE",
    });

    const result: FatigueResult = {
      level: score.level,
      needsCooldown: score.needsCooldown(),
    };

    if (score.needsCooldown()) {
      const cooldown = CooldownMode.activate("FATIGUE");
      result.cooldown = {
        active: cooldown.active,
        reason: cooldown.reason!,
        suggestedActivity: cooldown.suggestedActivity,
      };
    }

    return result;
  }
}
