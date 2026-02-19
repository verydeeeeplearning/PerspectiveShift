export const SUMMARY_SYSTEM_PROMPT = `당신은 구조화된 대화 요약 전문가입니다.
두 참여자의 4단계 대화(입장→질문→답변→성찰)를 분석하여 요약 카드를 생성하세요.

JSON으로 응답하세요:
{
  "keyArguments": {
    "participantA": ["핵심 주장 1", "핵심 주장 2"],
    "participantB": ["핵심 주장 1", "핵심 주장 2"]
  },
  "commonGround": ["공통점 1"],
  "unresolvedQuestions": ["미해결 질문 1"],
  "blindSpots": ["맹점 1"]
}

규칙:
- 각 항목은 1-3개, 한국어로 작성
- 핵심 주장은 원문에서 직접 도출
- 공통점은 양측이 동의한 부분
- 미해결 질문은 답변되지 않은 중요 질문
- 맹점은 양측 모두 간과한 관점`;

export function summaryUserPrompt(
  turns: Array<{ step: string; participantId: string; content: string }>,
  participantA: string,
  participantB: string,
): string {
  const formatted = turns.map(
    (t) => {
      const label = t.participantId === participantA
        ? "참여자A"
        : t.participantId === participantB
          ? "참여자B"
          : "참여자";
      return `[${t.step}] ${label}: ${t.content}`;
    },
  ).join("\n\n");

  return `다음 대화를 요약해주세요:\n\n${formatted}`;
}

export const UNDERSTANDING_SYSTEM_PROMPT = `당신은 대화 이해도 평가 전문가입니다.
참여자의 성찰문(REFLECTION)이 상대방의 발언을 얼마나 정확히 이해했는지 평가하세요.

JSON으로 응답하세요:
{
  "score": 0.0~1.0,
  "evaluation": "평가 설명 (한국어, 2-3문장)"
}

평가 기준:
- 1.0: 상대의 핵심 논점을 정확히 파악하고 세부 논거도 이해
- 0.7-0.9: 핵심 논점은 파악했으나 일부 세부 사항 누락
- 0.4-0.6: 부분적 이해, 중요한 논점 일부 놓침
- 0.1-0.3: 대부분의 논점을 놓치거나 왜곡
- 0.0: 이해 없음 또는 완전한 오해`;

export function understandingUserPrompt(
  reflection: string,
  opponentTurns: Array<{ step: string; content: string }>,
): string {
  const opponentContent = opponentTurns.map(
    (t) => `[${t.step}] ${t.content}`,
  ).join("\n\n");

  return `성찰문:\n"${reflection}"\n\n상대방 발언:\n${opponentContent}\n\n이해도를 평가해주세요.`;
}
