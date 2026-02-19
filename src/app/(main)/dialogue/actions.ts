"use server";

import { getContainer } from "@/infrastructure/config/di-container";

export async function submitTurn(
  sessionId: string,
  participantId: string,
  content: string,
) {
  const container = getContainer();
  return container.submitDialogueTurnUseCase.execute(
    sessionId,
    participantId,
    content,
  );
}

export async function getSession(
  sessionId: string,
  participantId: string,
) {
  const container = getContainer();
  return container.getDialogueSessionUseCase.execute(
    sessionId,
    participantId,
  );
}

export async function submitFeedback(
  sessionId: string,
  participantId: string,
  satisfaction: number,
  rematchWillingness: boolean,
  emotionCheckIn: string | null,
) {
  const container = getContainer();
  return container.submitFeedbackUseCase.execute(
    sessionId,
    participantId,
    satisfaction,
    rematchWillingness,
    emotionCheckIn,
  );
}

export async function getSummaryCard(sessionId: string) {
  const container = getContainer();
  return container.generateSummaryCardUseCase.execute(sessionId);
}
