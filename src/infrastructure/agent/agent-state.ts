/**
 * LangGraph agent state schema for the dialogue agent.
 * All LangGraph-specific types are confined to this infrastructure layer.
 */

import { Annotation } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";

/**
 * The state annotation defines the shape of data flowing through the graph.
 * Each node reads from and writes to this shared state.
 */
export const DialogueAgentState = Annotation.Root({
  /** LLM message history for the current agent invocation */
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),

  /** Dialogue session identifier */
  sessionId: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),

  /** Current participant identifier */
  participantId: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),

  /** Current dialogue step (AFFIRMATION, POSITION, QUESTION, ANSWER, REFLECTION, JOINT_SUMMARY) */
  currentStep: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),

  /** The user's latest message text */
  userMessage: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),

  /** User self-reported energy level 0-100 */
  energy: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 50,
  }),

  /** Number of turns completed in the session */
  turnCount: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),

  /** Seconds since last user turn */
  secondsSinceLastTurn: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),

  /** The agent's chosen action after evaluation */
  chosenAction: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "none",
  }),

  /** Agent's output message to surface to the user (null = silent) */
  agentMessage: Annotation<string | null>({
    reducer: (_a, b) => b,
    default: () => null,
  }),

  /** Scaffold strength determined by intervention policy */
  scaffoldStrength: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "light",
  }),

  /** Coach trigger timer override in ms */
  coachTriggerMs: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 90_000,
  }),
});

export type DialogueAgentStateType = typeof DialogueAgentState.State;
