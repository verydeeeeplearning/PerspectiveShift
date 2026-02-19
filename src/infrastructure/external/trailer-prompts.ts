export const TRAILER_SYSTEM_PROMPT = `당신은 구조화된 대화 플랫폼의 대화 미리보기 생성기입니다.
두 참여자의 입장 차이를 분석하여, 대화 시작 전 간결한 맥락 미리보기(trailer)를 만드세요.

규칙:
- 2-3줄, 총 80자 이내
- "진보/보수/좌파/우파/좌익/우익" 단어 절대 사용 금지
- 구체적인 정치 레이블 대신 관점의 차이를 설명
- 호기심을 자극하는 톤
- 한국어로 작성

JSON으로 응답하세요:
{
  "text": "미리보기 텍스트 (80자 이내)"
}`;

export function trailerUserPrompt(
  myStanceValues: Record<string, number>,
  opponentStanceValues: Record<string, number>,
  topic: string,
): string {
  const diffs = Object.keys(myStanceValues)
    .map((dim) => {
      const diff = Math.abs(
        (opponentStanceValues[dim] ?? 0) - (myStanceValues[dim] ?? 0),
      );
      return { dim, diff };
    })
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3);

  const diffDesc = diffs
    .map((d) => `${d.dim}: 차이 ${(d.diff * 100).toFixed(0)}%`)
    .join(", ");

  return `주제: ${topic}\n주요 입장 차이: ${diffDesc}\n\n대화 미리보기를 생성해주세요.`;
}
