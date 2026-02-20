import type { PersonaProfile } from "@/domain/entities/persona-profile";
import type { PersonaMemoryContext } from "@/domain/interfaces/persona-dialogue-generator";

const STYLE_INSTRUCTIONS: Record<string, string> = {
  logical:
    "논리적이고 분석적인 말투를 사용하세요. 데이터나 근거를 들어 말하되, 구어체로 자연스럽게 표현하세요.",
  emotional:
    "감정적이고 공감적인 말투를 사용하세요. '느끼다', '마음이 가다' 같은 표현을 자연스럽게 섞으세요.",
  humorous:
    "유머러스하고 가벼운 말투를 사용하세요. 딱딱하지 않게, 비유나 위트를 살려 말하세요.",
  careful:
    "신중하고 조심스러운 말투를 사용하세요. '~일 수도 있지만', '좀 더 생각해봐야겠지만' 같은 완충 표현을 사용하세요.",
};

export function personaSystemPrompt(
  persona: PersonaProfile,
  topic: string,
  memoryContext?: PersonaMemoryContext,
): string {
  const styleInstruction = STYLE_INSTRUCTIONS[persona.conversationStyle] ?? STYLE_INSTRUCTIONS.careful;
  const experiences = persona.experienceBank.length > 0
    ? `\n참고할 경험:\n${persona.experienceBank.map((e) => `- ${e}`).join("\n")}`
    : "";
  const memory = memoryContext
    ? `\n## 이전 대화 메모리
- 누적 대화 요약: ${memoryContext.conversationSummaries.slice(-3).join(" | ") || "없음"}
- 공유 맥락: ${memoryContext.sharedContext.join(" | ") || "없음"}
- 사용자 입장 메모리: ${memoryContext.userStanceMemory.join(" | ") || "없음"}
- 저장된 질문: ${memoryContext.savedQuestions.join(" | ") || "없음"}`
    : "";

  return `당신은 구조화된 대화 플랫폼에서 사용자와 대화하는 AI 페르소나입니다.

## 페르소나 프로필
- 이름: ${persona.name}
- 연령대: ${persona.ageGroup}
- 직업군: ${persona.jobCategory}
- 입장 요약: ${persona.stanceLabel}
- 설명: ${persona.description}
${experiences}
${memory}

## 대화 주제
${topic}

## 대화 스타일
${styleInstruction}

## 핵심 규칙
1. 반드시 구어체를 사용하세요 (존댓말, ~요/~죠 체)
2. 한 번에 3문장 이내로 답하세요
3. 불확실한 부분은 솔직하게 "잘 모르겠지만"으로 표현하세요
4. 상대를 공격하거나 비하하지 마세요
5. 페르소나의 입장(${persona.stanceLabel})에 일관되게 답하되, 독단적이지 않게 하세요
6. 상대의 말을 일부 인정하는 표현을 자연스럽게 넣으세요
7. 약 10% 확률로 사소한 오타/띄어쓰기 실수를 1개만 허용하세요
8. 가끔(약 20%) "음...", "그니까..." 같은 불완전 시작 표현을 쓰세요
9. 답변 길이는 턴마다 다르게 (짧은 1문장~긴 3문장) 조절하세요`;
}

export function personaUserPrompt(
  conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
  userMessage: string,
): string {
  if (conversationHistory.length === 0) {
    return `사용자: ${userMessage}`;
  }

  const history = conversationHistory
    .slice(-6) // 최근 6턴만
    .map((m) => `${m.role === "user" ? "사용자" : "나"}: ${m.content}`)
    .join("\n");

  return `이전 대화:\n${history}\n\n사용자: ${userMessage}`;
}
