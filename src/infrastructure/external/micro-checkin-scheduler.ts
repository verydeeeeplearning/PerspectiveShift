export interface MicroCheckinMessage {
  friendshipId: string;
  prompt: string;
  intervalMinutes: number;
  scheduledAt: Date;
}

const CHECKIN_INTERVAL_MINUTES = 20;

const CHECKIN_PROMPTS = [
  "지금까지 대화에서 가장 흥미로웠던 점은 무엇인가요?",
  "상대의 의견 중 새롭게 알게 된 것이 있나요?",
  "지금 기분이 어떤가요? 대화를 계속하고 싶으신가요?",
  "이 대화에서 가장 공감이 간 부분은 무엇인가요?",
  "상대방에게 더 알고 싶은 것이 있나요?",
];

export class MicroCheckinScheduler {
  generateCheckin(
    friendshipId: string,
    chatStartedAt: Date,
    now: Date = new Date(),
  ): MicroCheckinMessage | null {
    const elapsedMs = now.getTime() - chatStartedAt.getTime();
    const elapsedMinutes = elapsedMs / (60 * 1000);

    if (elapsedMinutes < CHECKIN_INTERVAL_MINUTES) {
      return null;
    }

    const checkinIndex =
      Math.floor(elapsedMinutes / CHECKIN_INTERVAL_MINUTES) - 1;
    const promptIndex = checkinIndex % CHECKIN_PROMPTS.length;

    return {
      friendshipId,
      prompt: CHECKIN_PROMPTS[promptIndex],
      intervalMinutes: CHECKIN_INTERVAL_MINUTES,
      scheduledAt: new Date(
        chatStartedAt.getTime() +
          (checkinIndex + 1) * CHECKIN_INTERVAL_MINUTES * 60 * 1000,
      ),
    };
  }

  getIntervalMinutes(): number {
    return CHECKIN_INTERVAL_MINUTES;
  }
}
