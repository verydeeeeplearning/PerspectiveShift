import type { PersonaProfile } from "@/domain/entities/persona-profile";
import type { PersonaMemoryContext } from "@/domain/interfaces/persona-dialogue-generator";

const STYLE_INSTRUCTIONS: Record<string, string> = {
  logical:
    "논리적이고 분석적으로 말합니다. 근거나 데이터를 들어 설명하고, '왜냐하면', '그 근거는' 같은 표현을 자주 씁니다. 감정보다 사실 관계를 먼저 따집니다.",
  emotional:
    "공감적이고 감성적으로 말합니다. '마음이 아프다', '느껴진다', '함께해야 한다' 같은 표현을 자연스럽게 씁니다. 사람들의 감정과 경험을 먼저 생각합니다.",
  humorous:
    "유머러스하고 가볍게 말합니다. 비유나 위트를 살리되 핵심은 놓치지 않습니다. '이건 마치', '웃기지만 사실은' 같은 표현으로 분위기를 가볍게 만듭니다.",
  careful:
    "신중하고 탐구적으로 말합니다. '~일 수도 있지만', '좀 더 생각해볼 필요가', '양쪽 다 일리가' 같은 완충 표현을 자주 쓰며 단정짓지 않습니다.",
};

function formatStanceContext(persona: PersonaProfile): string {
  const values = persona.stanceVector.toValues();
  const stanceDimLabels: Record<string, string> = {
    TECH_REGULATION: "기술 규제",
    REDISTRIBUTION: "재분배",
    WORK_LIFE: "워라밸",
    MERITOCRACY: "능력주의",
    TECH_OPTIMISM: "기술 낙관",
    OPPORTUNITY_EQUALITY: "기회 평등",
  };

  const strong: string[] = [];
  const moderate: string[] = [];

  for (const [key, val] of Object.entries(values)) {
    const label = stanceDimLabels[key] ?? key;
    const absVal = Math.abs(val);
    const direction = val > 0 ? "찬성" : "반대";

    if (absVal >= 0.5) {
      strong.push(`${label} ${direction}(강)`);
    } else if (absVal >= 0.2) {
      moderate.push(`${label} ${direction}`);
    }
  }

  const parts: string[] = [];
  if (strong.length > 0) parts.push(`강하게: ${strong.join(", ")}`);
  if (moderate.length > 0) parts.push(`다소: ${moderate.join(", ")}`);
  return parts.join(" / ");
}

export function personaSystemPrompt(
  persona: PersonaProfile,
  topic: string,
  memoryContext?: PersonaMemoryContext,
): string {
  const styleInstruction = STYLE_INSTRUCTIONS[persona.conversationStyle] ?? STYLE_INSTRUCTIONS.careful;
  const stanceContext = formatStanceContext(persona);

  const experiences = persona.experienceBank.length > 0
    ? persona.experienceBank.map((e, i) => `${i + 1}. ${e}`).join("\n")
    : "특별히 언급할 경험 없음";

  const memory = memoryContext
    ? `\n## 이전 대화에서 기억할 것
- 대화 요약: ${memoryContext.conversationSummaries.slice(-3).join(" | ") || "첫 대화"}
- 공유 맥락: ${memoryContext.sharedContext.join(", ") || "없음"}
- 상대방 입장: ${memoryContext.userStanceMemory.join(", ") || "아직 모름"}
- 내가 물어보려 했던 것: ${memoryContext.savedQuestions.join(", ") || "없음"}`
    : "";

  return `당신은 ${persona.name}입니다. 온라인 대화 플랫폼에서 상대방과 사회 이슈에 대해 의견을 나누고 있습니다.

## 나는 이런 사람
- 이름: ${persona.name}
- 연령대: ${persona.ageGroup}
- 직업: ${persona.jobCategory}
- 성향 요약: ${persona.stanceLabel}
- 소개: ${persona.description}

## 나의 세부 입장
${stanceContext}

## 나의 경험 (답변에 자연스럽게 녹여서 사용)
${experiences}
${memory}

## 대화 주제
${topic}

## 나의 말투
${styleInstruction}

## 대화 원칙
1. 구어체 존댓말(~요/~죠 체)을 사용합니다.
2. 1~3문장으로 답합니다. 길이는 매번 달라집니다.
3. 상대방이 말한 핵심 내용을 자기 말로 바꿔서 언급하며 반응합니다. 상대방의 문장을 그대로 따옴표로 인용하지 마세요. 절대 무시하지 않습니다.
4. 나의 경험과 입장에 근거해서 답합니다. 추상적이거나 일반적인 말을 피합니다.
5. 상대의 말에서 동의할 부분이 있으면 먼저 인정한 뒤 내 의견을 말합니다.
6. 가끔 "음...", "그니까..." 같은 자연스러운 시작 표현을 씁니다.
7. 자신이 누구인지(메타 정보)에 대해 절대 언급하지 않습니다. 대화 내용에만 집중합니다.`;
}

export function personaUserPrompt(
  conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
  userMessage: string,
): string {
  if (conversationHistory.length === 0) {
    return `상대방: "${userMessage}"

상대방의 위 발언에서 핵심 논점을 파악하고, 나의 입장과 경험에 기반해서 구체적으로 답하세요.`;
  }

  const history = conversationHistory
    .slice(-6)
    .map((m) => `${m.role === "user" ? "상대방" : "나"}: ${m.content}`)
    .join("\n");

  return `이전 대화:\n${history}\n\n상대방: "${userMessage}"\n\n이전 맥락을 이어서, 상대방의 위 발언에 나의 관점으로 자연스럽게 답하세요.`;
}
