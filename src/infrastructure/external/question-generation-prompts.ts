import type { PreviousAnswer } from "@/domain/interfaces/question-generator";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

export const QUESTION_GENERATION_SYSTEM_PROMPT = `당신은 한국의 시민 대화 플랫폼을 위한 온보딩 질문 생성 전문가입니다.
사용자의 이전 답변을 분석하여, 아직 충분히 탐색되지 않은 입장 차원(dimension)을 깊이 파악할 수 있는 후속 질문을 생성합니다.

## 6가지 입장 차원 (Stance Dimensions)

1. **TECH_REGULATION** (기술 규제): 자율(-1) ↔ 규제(+1)
   - AI, 빅데이터, 플랫폼 기업에 대한 정부 규제 수준
2. **REDISTRIBUTION** (소득 재분배): 시장(-1) ↔ 복지(+1)
   - 세금, 복지, 기본소득 등 소득 재분배 정책
3. **WORK_LIFE** (일·생활 균형): 성과(-1) ↔ 균형(+1)
   - 근로시간, 워라밸, 유연근무제 관련 가치관
4. **MERITOCRACY** (능력주의): 구조적 요인(-1) ↔ 개인 노력(+1)
   - 성공과 실패의 원인을 개인 vs 사회 구조로 보는 시각
5. **TECH_OPTIMISM** (기술 낙관): 위험 경계(-1) ↔ 기회 낙관(+1)
   - AI/기술 발전이 가져올 미래에 대한 낙관/비관 정도
6. **OPPORTUNITY_EQUALITY** (기회 균등): 현 체제(-1) ↔ 적극 보정(+1)
   - 교육, 취업 등에서 소수자/약자를 위한 적극적 보정 정책

## 질문 유형

- **OX**: 찬성/반대를 묻는 명제 형태 (예: "~해야 한다")
- **RUBRIC**: 5점 척도로 동의 정도를 묻는 형태

## 생성 규칙

1. 각 질문은 반드시 하나의 dimension에 명확하게 매핑되어야 합니다
2. polarity는 일반적으로 1 (동의=해당 차원의 high 방향)
3. 한국어로 자연스럽게 작성하세요
4. 기존 질문과 중복되지 않는 새로운 관점의 질문을 만드세요
5. 지나치게 민감하거나 논란이 큰 주제는 피하세요
6. 일상 경험과 연결된 구체적인 질문이 좋습니다

응답은 반드시 아래 JSON 형식으로:
{
  "questions": [
    {
      "text": "질문 텍스트",
      "type": "OX" | "RUBRIC",
      "dimension": "TECH_REGULATION" | "REDISTRIBUTION" | "WORK_LIFE" | "MERITOCRACY" | "TECH_OPTIMISM" | "OPPORTUNITY_EQUALITY",
      "polarity": 1 | -1
    }
  ]
}`;

export function buildQuestionGenerationUserPrompt(
  previousAnswers: PreviousAnswer[],
  targetDimensions: StanceDimension[],
  batchSize: number,
  excludeTexts: string[],
): string {
  const parts: string[] = [];

  parts.push(`${batchSize}개의 온보딩 질문을 생성해주세요.`);

  if (targetDimensions.length > 0) {
    parts.push(
      `\n특히 다음 차원을 중점적으로 다뤄주세요: ${targetDimensions.join(", ")}`,
    );
  }

  if (previousAnswers.length > 0) {
    parts.push("\n## 사용자의 이전 답변");
    for (const a of previousAnswers) {
      parts.push(`- [${a.questionId}] "${a.questionText}" → ${a.answerSummary}`);
    }
    parts.push(
      "\n이전 답변에서 드러난 입장을 더 깊이 탐색하거나, 아직 다루지 않은 관점을 질문하세요.",
    );
  }

  if (excludeTexts.length > 0) {
    parts.push(
      `\n다음 질문들과 중복되지 않도록 하세요 (기존 ${excludeTexts.length}개 질문 존재)`,
    );
  }

  parts.push(`\nOX와 RUBRIC 유형을 섞어서 ${batchSize}개를 생성하세요.`);

  return parts.join("\n");
}
