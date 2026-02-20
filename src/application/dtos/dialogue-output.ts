export interface DialogueTurnOutput {
  id: string;
  step: string;
  participantId: string;
  content: string;
  isMine: boolean;
  createdAt: string;
}

export interface DialogueSessionOutput {
  id: string;
  currentStep: string;
  status: string;
  mySubmitted: boolean;
  opponentSubmitted: boolean;
  turns: DialogueTurnOutput[];
  createdAt: string;
  updatedAt: string;
}

export interface TurnSubmissionResult {
  turnId: string;
  toneCheck: { passed: boolean; suggestion: string | null };
  driftCheck: { drifted: boolean; suggestion: string | null };
  advanced: boolean;
  newStep: string;
  sessionStatus: string;
}

export interface AgentResponsePayload {
  content: string;
  delayMs: number;
  personaName: string;
}

export interface AgentTurnSubmissionResult extends TurnSubmissionResult {
  agentResponse: AgentResponsePayload | null;
}
