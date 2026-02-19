/**
 * LangGraph dialogue agent graph.
 *
 * Implements the DialogueAgent domain port using a LangGraph StateGraph.
 * All LangGraph/LangChain types are confined here — domain layer stays pure.
 *
 * Graph flow:
 *   __start__ → evaluate → route → [facilitate | coach | toneCheck | scaffold | passthrough] → __end__
 */

import { StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { DialogueAgentState, type DialogueAgentStateType } from "./agent-state";
import { InterventionPolicy } from "@/domain/value-objects/intervention-policy";
import type {
  DialogueAgent,
  DialogueAgentInput,
  AgentDecision,
} from "@/domain/interfaces/dialogue-agent";

// ── System prompts per action ──────────────────────────────────────────

const FACILITATE_SYSTEM = `당신은 구조화된 대화의 진행자입니다.
참여자가 상대방의 관점을 이해하도록 돕되, 중립을 유지하세요.
2-3문장으로 간결하게 응답하세요. 한국어로 답하세요.`;

const COACH_SYSTEM = `당신은 대화 코치입니다.
참여자가 침묵하고 있습니다. 부드럽게 대화를 이어갈 수 있도록 도와주세요.
질문이나 격려를 1-2문장으로 제안하세요. 한국어로 답하세요.`;

const TONE_CHECK_SYSTEM = `당신은 톤 체커입니다.
참여자의 메시지가 상대방을 존중하는 톤인지 확인하세요.
문제가 있다면 부드러운 대안을 제안하세요. 없다면 "통과"라고만 답하세요.
한국어로 답하세요.`;

const SCAFFOLD_SYSTEM_MAP: Record<string, string> = {
  light: `당신은 대화 도우미입니다. 참여자에게 간단한 힌트를 제공하세요. 1문장. 한국어.`,
  medium: `당신은 대화 도우미입니다. 참여자가 생각을 정리할 수 있도록 구체적인 질문과 예시를 제공하세요. 2문장. 한국어.`,
  strong: `당신은 대화 도우미입니다. 참여자가 의견을 표현하기 어려워합니다.
단계별로 생각을 정리할 수 있는 구조화된 가이드를 제공하세요.
3문장 이내. 구체적인 문장 시작 예시를 포함하세요. 한국어.`,
};

// ── Graph nodes ────────────────────────────────────────────────────────

/**
 * Evaluate node: uses InterventionPolicy (pure domain logic) to decide action.
 */
function evaluateNode(state: DialogueAgentStateType) {
  const decision = InterventionPolicy.evaluate({
    energy: state.energy,
    turnCount: state.turnCount,
    currentStep: state.currentStep,
    secondsSinceLastTurn: state.secondsSinceLastTurn,
  });

  return {
    chosenAction: decision.type,
    scaffoldStrength: decision.scaffoldStrength,
    coachTriggerMs: decision.coachTriggerMs,
  };
}

/**
 * Route function: reads chosenAction to pick the next node.
 */
function routeAfterEvaluate(state: DialogueAgentStateType): string {
  switch (state.chosenAction) {
    case "facilitate":
      return "facilitate";
    case "coach":
      return "coach";
    case "tone_check":
      return "toneCheck";
    case "scaffold":
      return "scaffold";
    case "break_suggest":
      return "coach"; // break suggestions go through coach node with adapted prompt
    default:
      return "passthrough";
  }
}

function createLlmNodeFactory(model: ChatOpenAI) {
  return {
    facilitate: async (state: DialogueAgentStateType) => {
      const response = await model.invoke([
        new SystemMessage(FACILITATE_SYSTEM),
        new HumanMessage(
          `[${state.currentStep}] 참여자 메시지: "${state.userMessage}"`,
        ),
      ]);
      return {
        agentMessage: typeof response.content === "string" ? response.content : null,
        messages: [response],
      };
    },

    coach: async (state: DialogueAgentStateType) => {
      const systemPrompt =
        state.chosenAction === "break_suggest"
          ? `참여자가 에너지가 낮습니다. 잠시 쉬어가는 것을 부드럽게 제안하세요. 1-2문장. 한국어.`
          : COACH_SYSTEM;
      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `현재 단계: ${state.currentStep}, 턴 수: ${state.turnCount}, 비활동: ${state.secondsSinceLastTurn}초`,
        ),
      ]);
      return {
        agentMessage: typeof response.content === "string" ? response.content : null,
        messages: [response],
      };
    },

    toneCheck: async (state: DialogueAgentStateType) => {
      const response = await model.invoke([
        new SystemMessage(TONE_CHECK_SYSTEM),
        new HumanMessage(`메시지: "${state.userMessage}"`),
      ]);
      return {
        agentMessage: typeof response.content === "string" ? response.content : null,
        messages: [response],
      };
    },

    scaffold: async (state: DialogueAgentStateType) => {
      const strength = state.scaffoldStrength || "light";
      const systemPrompt =
        SCAFFOLD_SYSTEM_MAP[strength] || SCAFFOLD_SYSTEM_MAP["light"];
      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(
          `단계: ${state.currentStep}, 에너지: ${state.energy}/100, 메시지: "${state.userMessage}"`,
        ),
      ]);
      return {
        agentMessage: typeof response.content === "string" ? response.content : null,
        messages: [response],
      };
    },

    passthrough: async (_state: DialogueAgentStateType) => {
      return { agentMessage: null };
    },
  };
}

// ── Graph builder ──────────────────────────────────────────────────────

export function buildDialogueAgentGraph(apiKey: string) {
  const model = new ChatOpenAI({
    modelName: "gpt-5-mini",
    temperature: 0.4,
    maxTokens: 200,
    openAIApiKey: apiKey,
  });

  const nodes = createLlmNodeFactory(model);

  const graph = new StateGraph(DialogueAgentState)
    .addNode("evaluate", evaluateNode)
    .addNode("facilitate", nodes.facilitate)
    .addNode("coach", nodes.coach)
    .addNode("toneCheck", nodes.toneCheck)
    .addNode("scaffold", nodes.scaffold)
    .addNode("passthrough", nodes.passthrough)
    .addEdge("__start__", "evaluate")
    .addConditionalEdges("evaluate", routeAfterEvaluate, {
      facilitate: "facilitate",
      coach: "coach",
      toneCheck: "toneCheck",
      scaffold: "scaffold",
      passthrough: "passthrough",
    })
    .addEdge("facilitate", "__end__")
    .addEdge("coach", "__end__")
    .addEdge("toneCheck", "__end__")
    .addEdge("scaffold", "__end__")
    .addEdge("passthrough", "__end__")
    .compile();

  return graph;
}

// ── Domain adapter ─────────────────────────────────────────────────────

/**
 * Adapts the LangGraph compiled graph to the domain's DialogueAgent interface.
 * This is the only class external code should reference.
 */
export class LangGraphDialogueAgent implements DialogueAgent {
  private graph: ReturnType<typeof buildDialogueAgentGraph>;

  constructor(apiKey: string) {
    this.graph = buildDialogueAgentGraph(apiKey);
  }

  async decide(input: DialogueAgentInput): Promise<AgentDecision> {
    const result = await this.graph.invoke({
      sessionId: input.sessionId,
      participantId: input.participantId,
      currentStep: input.currentStep,
      userMessage: input.userMessage,
      energy: input.energy,
      turnCount: input.turnCount,
      secondsSinceLastTurn: input.secondsSinceLastTurn,
    });

    return {
      action: (result.chosenAction ?? "none") as AgentDecision["action"],
      message: result.agentMessage ?? null,
      metadata: {
        scaffoldStrength: result.scaffoldStrength,
        coachTriggerMs: result.coachTriggerMs,
      },
    };
  }
}

// ── Fallback adapter (no LLM key) ─────────────────────────────────────

/**
 * Pure domain-logic fallback: uses InterventionPolicy directly without any LLM call.
 */
export class FallbackDialogueAgent implements DialogueAgent {
  async decide(input: DialogueAgentInput): Promise<AgentDecision> {
    const decision = InterventionPolicy.evaluate({
      energy: input.energy,
      turnCount: input.turnCount,
      currentStep: input.currentStep,
      secondsSinceLastTurn: input.secondsSinceLastTurn,
    });

    return {
      action: decision.type === "break_suggest" ? "coach" : decision.type === "none" ? "none" : decision.type as AgentDecision["action"],
      message: null, // no LLM → no generated message
      metadata: {
        scaffoldStrength: decision.scaffoldStrength,
        coachTriggerMs: decision.coachTriggerMs,
        reason: decision.reason,
        fallback: true,
      },
    };
  }
}
