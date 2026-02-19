/**
 * Domain port for the dialogue agent.
 * No LangGraph/LangChain types are exposed here — only pure domain types.
 */

export type AgentAction =
  | "facilitate"
  | "coach"
  | "tone_check"
  | "scaffold"
  | "none";

export interface AgentDecision {
  action: AgentAction;
  message: string | null;
  metadata: Record<string, unknown>;
}

export interface DialogueAgentInput {
  sessionId: string;
  participantId: string;
  currentStep: string;
  userMessage: string;
  energy: number;          // 0-100, from user self-report
  turnCount: number;
  secondsSinceLastTurn: number;
  deleteCount?: number;
  consecutiveToneChecks?: number;
  feelHeardScore?: number;
  highlightCount?: number;
  quoteCount?: number;
  hasReport?: boolean;
}

export interface DialogueAgent {
  /**
   * Given the current dialogue context, decide what intervention (if any) to apply.
   */
  decide(input: DialogueAgentInput): Promise<AgentDecision>;
}
