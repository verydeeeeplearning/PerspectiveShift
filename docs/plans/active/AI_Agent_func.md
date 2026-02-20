# PerspectiveShift v4.0 — AI Agent 관련 기능 추출

**Source**: `PerspectiveShift_v4.md`
**Extracted**: 2026-02-20

---

## 목차

1. [P0-A3: AI Agent 페르소나 시스템 (Cold Start)](#p0-a3-ai-agent-페르소나-시스템-cold-start)
2. [P0-B4: Conversation Trailer 생성](#p0-b4-conversation-trailer-생성)
3. [P0-B3: 매칭 엔진 고도화 — Cold Start 분기](#p0-b3-매칭-엔진-고도화--cold-start-분기)
4. [P0-B5: 매칭 카드 통합 UI — 페르소나 연동](#p0-b5-매칭-카드-통합-ui--페르소나-연동)
5. [P0-D3: 피크-엔드 플로우 — Agent 대화 CTA 분기](#p0-d3-피크-엔드-플로우--agent-대화-cta-분기)
6. [P1-10: 차원별 매칭 필터 (앵커)](#p1-10-차원별-매칭-필터-앵커)
7. [P2-3: 튜링 테스트 게임](#p2-3-튜링-테스트-게임)
8. [P2-4: 페르소나 저장 & 메모리](#p2-4-페르소나-저장--메모리)
9. [관련 ADR](#관련-adr)
10. [관련 이벤트 택소노미](#관련-이벤트-택소노미)
11. [관련 Guardrail](#관련-guardrail)

---

## P0-A3: AI Agent 페르소나 시스템 (Cold Start)

**기획 참조**: v4 §2.2.9
**예상 공수**: L (1-2주)
**변경 유형**: 신규
**의존성**: 없음 (독립)
**구현 상태**: `DONE` (2026-02-19)

**구현 반영 파일**
- `src/domain/entities/persona-profile.ts`
- `src/domain/value-objects/persona-response-delay.ts`
- `src/domain/interfaces/persona-repository.ts`
- `src/domain/interfaces/persona-dialogue-generator.ts`
- `src/application/use-cases/select-persona.ts`
- `src/application/use-cases/generate-persona-response.ts`
- `src/application/use-cases/check-matching-pool.ts`
- `src/infrastructure/persistence/supabase-persona-repository.ts` (InMemoryPersonaRepository 시드 3종)
- `src/infrastructure/external/persona-llm-adapter.ts` (스텁)
- `src/app/(main)/matching/components/PersonaSelector.tsx`

### 목표
1. 3개 기본 페르소나 정의 및 선택 UI
2. Stance-grounded 대화 생성 (LLM)
3. 자연 딜레이 (2~15초)
4. 구어체 + 불완전 표현 + 경험 언급 + 감정 표현

### Domain Layer

**신규 엔티티**: `PersonaProfile`
```typescript
export class PersonaProfile {
  constructor(
    public readonly id: string,
    public readonly name: string,           // "현실주의 직장인"
    public readonly ageGroup: string,        // "30대"
    public readonly jobCategory: string,     // "IT 직군"
    public readonly stanceLabel: string,     // "경제 보수"
    public readonly description: string,     // "효율성과 현실 가능성을 중시"
    public readonly conversationStyle: ConversationStyle,
    public readonly stanceVector: StanceVector,
    public readonly experienceBank: string[], // 배경 스토리 목록
  ) {}
}

export type ConversationStyle = 'logical' | 'emotional' | 'humorous' | 'careful';
```

**신규 VO**: `PersonaResponseDelay`
```typescript
export class PersonaResponseDelay {
  static calculate(responseLength: number): number {
    const baseDelay = 3;
    const perCharDelay = 0.05;
    const jitter = Math.random() * 3 - 1; // uniform(-1, +2)
    return baseDelay + (responseLength * perCharDelay) + jitter;
  }
}
```

**신규 인터페이스**: `PersonaRepository`
```typescript
export interface PersonaRepository {
  findAll(): Promise<PersonaProfile[]>;
  findById(id: string): Promise<PersonaProfile | null>;
}
```

**신규 인터페이스**: `PersonaDialogueGenerator`
```typescript
export interface PersonaDialogueGenerator {
  generateResponse(
    persona: PersonaProfile,
    conversationHistory: DialogueTurn[],
    userMessage: string,
    topic: string,
  ): Promise<string>;
}
```

### Application Layer

**신규 UC**: `SelectPersona`
- 입력: `userId`, `personaId`
- 출력: `PersonaProfile` + 대화 세션 생성
- 로직: 매칭 풀 부족 시 / 사용자 연습 모드 요청 시 호출

**신규 UC**: `GeneratePersonaResponse`
- 입력: `sessionId`, `personaId`, `userMessage`
- 출력: `{ response: string, delayMs: number }`
- 로직:
  1. 페르소나 프로필 로드
  2. 대화 이력 로드
  3. LLM에 persona-grounded prompt 전달
  4. PersonaResponseDelay로 딜레이 계산
  5. 응답 반환

**신규 UC**: `CheckMatchingPool`
- 입력: `userId`, `stanceVector`, `energyLevel`
- 출력: `{ hasHumanMatch: boolean, suggestPersona: boolean }`
- 로직: 매칭 풀 확인 → 부족 시 AI 페르소나 제안

### Infrastructure Layer

**PersonaLlmAdapter** — `PersonaDialogueGenerator` 구현
- OpenAI GPT-5-mini 호출
- System prompt 구조:
  ```
  너는 [페르소나명]이다. 아래 프로필에 충실하게 대화하라.
  - 배경: [직업, 연령대, 지역]
  - 핵심 가치: [stance vector 기반 자연어]
  - 대화 스타일: [logical/emotional/humorous/careful]
  - 경험: [배경 스토리 1~2개]
  규칙:
  - 완벽한 문어체 금지. 구어체로 답하라.
  - 모든 질문에 답할 필요 없다.
  - 상대의 좋은 포인트에는 솔직하게 인정하라.
  - stance vector에서 벗어나는 입장은 취하지 마라.
  - 한 번에 3문장 이상 길게 쓰지 마라.
  ```

**InMemoryPersonaRepository** — 초기 3개 페르소나 시드 데이터

### Presentation Layer

**PersonaSelector** (`src/app/(main)/matching/components/PersonaSelector.tsx`)
- 매칭 풀 부족 시 또는 "연습 모드" 진입 시 표시
- 3개 페르소나 카드 (이름, 연령대, 직군, 입장 요약)
- "대화하기" CTA per 카드
- 하단 "알림 받기" (실제 사람 매칭 가능 시)

**Dialogue 페이지 변경** (`src/app/(main)/dialogue/[id]/page.tsx`)
- Agent 대화 시: 동기식 응답 + 자연 딜레이 + 타이핑 인디케이터
- Step 전환: 사용자 완료 즉시 Agent 응답 (딜레이 적용)

### 테스트 (32 테스트)
| 테스트 | 파일 | 검증 내용 |
|--------|------|----------|
| PersonaProfile 생성 | `persona-profile.test.ts` | 프로필 속성 검증 |
| PersonaResponseDelay | `persona-response-delay.test.ts` | 딜레이 범위: 2~17초 |
| SelectPersona UC | `select-persona.test.ts` | 세션 생성 + 이벤트 발화 |
| GeneratePersonaResponse UC | `generate-persona-response.test.ts` | LLM 호출 + 딜레이 반환 |
| CheckMatchingPool UC | `check-matching-pool.test.ts` | 풀 충분/부족 분기 |
| PersonaSelector UI | `PersonaSelector.test.tsx` | 3카드 렌더링 + CTA |
| Agent 대화 딜레이 | `dialogue-agent.test.tsx` | 타이핑 인디케이터 + 딜레이 후 표시 |

### Agent 품질 KPI
| 메트릭 | 목표 |
|--------|------|
| AI→사람 오인율 | >40% |
| Agent 대화 만족도 | >3.0/5 |
| Agent 대화 완료율 | >45% |

---

## P0-B4: Conversation Trailer 생성

**기획 참조**: v4 §2.2.4
**예상 공수**: M (3-5일)
**변경 유형**: 신규 (VO 존재, 생성 로직 없음)
**의존성**: P0-B3 (매칭)
**구현 상태**: `DONE` (2026-02-19) — 13 테스트

### 목표
stance vector 기반 2줄+1줄 미리보기 **LLM 생성**

### Trailer 템플릿
```
Line 1: "이 분은 [A 입장]에 가깝지만,"
Line 2: "[B 측면]도 인정하는 편이에요."
Line 3 (옵션): "대화에서 이런 포인트가 나올 수 있어요: ___"
```

### Domain Layer
- 기존 `ConversationTrailer` VO 활용
- **신규 인터페이스**: `TrailerGenerator`
  ```typescript
  export interface TrailerGenerator {
    generate(
      opponentStance: StanceVector,
      myStance: StanceVector,
      topic: string,
    ): Promise<ConversationTrailer>;
  }
  ```

### Application Layer
- **신규 UC**: `GenerateConversationTrailer`
  - 입력: 상대 stanceVector, 내 stanceVector, 주제
  - 출력: ConversationTrailer (Line 1-3)
  - 규칙: 서술형 답변 원문 사용 금지 (프라이버시)

### Infrastructure Layer
- **TrailerLlmAdapter** — `TrailerGenerator` 구현
  - stance vector → 자연어 변환 프롬프트
  - Line 3: 두 사용자 간 stance 차이가 가장 큰 하위 차원 1개
  - FallbackTrailerGenerator (규칙 기반 스텁) — 차원별 stance 차이 기반 2-3줄 생성

### 테스트 (13 테스트)
| 테스트 | 검증 내용 |
|--------|----------|
| Trailer 구조 | Line 1-2 필수, Line 3 옵션 |
| 프라이버시 | 서술형 원문 미포함 검증 |
| Stance 기반 | 차이가 큰 차원이 Line 3에 반영 |

---

## P0-B3: 매칭 엔진 고도화 — Cold Start 분기

**구현 상태**: `DONE` (2026-02-19) — 30 테스트

> AI Agent 관련 핵심 로직만 추출

### Cold Start 분기
- `find-match-candidates.ts` 변경:
  - 매칭 풀 부족 시 `CheckMatchingPool` UC 호출
  - `suggestPersona: true` 반환 → Presentation Layer에서 PersonaSelector 표시

### 테스트
| 테스트 | 검증 내용 |
|--------|----------|
| Cold Start 분기 | 풀 부족 시 `suggestPersona: true` |

---

## P0-B5: 매칭 카드 통합 UI — 페르소나 연동

**구현 상태**: `DONE` (2026-02-19) — 19 테스트

> AI Agent 관련 부분만 추출

- `IntegratedMatchCard`에서 AI 페르소나 매칭 시에도 동일한 카드 구조 사용
- Trailer 표시 (LLM 생성 또는 Fallback)

---

## P0-D3: 피크-엔드 플로우 — Agent 대화 CTA 분기

**구현 상태**: `DONE` (2026-02-19) — 44 테스트

> AI Agent 관련 CTA 분기 로직만 추출

### 상황별 CTA 규칙 (Agent 관련)
| 조건 | CTA |
|------|-----|
| Agent 대화 완료 + 매칭 풀 있음 | "실제 사람과 대화하기" |
| Agent 대화 + 매칭 풀 부족 | "알림 받기 + 다른 페르소나" |

### FinalCTAType (5종 중 Agent 관련 2종)
- `HUMAN_MATCH_AVAILABLE` — Agent 대화 후 실제 매칭 풀 있을 때
- `PERSONA_SWITCH` — Agent 대화 후 매칭 풀 부족 시

### 플로우 내 Agent 전용 단계
- Step 5: (Agent 대화인 경우) 튜링 테스트 결과 — **P2에서 구현**

---

## P2-3: 튜링 테스트 게임

**기획 참조**: v4 §2.2.9 (튜링 테스트)
**예상 공수**: M (3-5일)
**구현 상태**: `TODO`

### Domain Layer
**신규 엔티티**: `TuringGuess`
```typescript
export class TuringGuess {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly dialogueSessionId: string,
    public readonly guess: 'human' | 'ai',
    public readonly actual: 'human' | 'ai',
    public readonly isCorrect: boolean,
    public readonly createdAt: Date,
  ) {}
}
```

### Application Layer
- **신규 UC**: `SubmitTuringGuess`
- **신규 UC**: `GetTuringStats`

### 리워드 규칙
| 조건 | 리워드 |
|------|--------|
| 정답 | Passport에 "관찰자 뱃지" +1 |
| 3연속 정답 | "날카로운 관찰자" 칭호 |
| AI를 사람으로 오인 | "인상적인 관점" 메시지 |
| 사람을 AI로 오인 | "의외의 시각" 메시지 |

---

## P2-4: 페르소나 저장 & 메모리

**기획 참조**: v4 §2.2.9 (페르소나 저장)
**예상 공수**: L (1-2주)
**구현 상태**: `TODO`

### Domain Layer
**신규 엔티티**: `SavedPersona`
```typescript
export class SavedPersona {
  constructor(
    public readonly userId: string,
    public readonly personaId: string,
    public readonly conversationCount: number,
    public readonly lastConversationAt: Date,
    public readonly conversationSummaries: string[],
    public readonly sharedContext: string[],
    public readonly userStanceMemory: string[],
    public readonly savedQuestions: string[],
  ) {}
}
```

### Application Layer
- **신규 UC**: `SavePersona` — 페르소나 저장
- **신규 UC**: `ResumePersonaConversation` — 이전 대화 요약 로드 → Agent에 컨텍스트 주입

---

## P1-10: 차원별 매칭 필터 (앵커)

**기획 참조**: v4 §2.2.8
**예상 공수**: L (1-2주)
**구현 상태**: `TODO`

### 목표
"같은 X, 다른 Y" 매칭 + 다름의 정도 슬라이더

- 예: 성별은 같은데 최저임금 주제에서 생각은 다른
- 예: 직업은 같은데 AI 규제 주제에 대한 생각은 다른

### Domain Layer

**신규 VO**: `AnchorType`
```typescript
export type AnchorType = 'gender' | 'job_category' | 'age_group' | 'region';
```

**신규 VO**: `AnchorAttribute`
```typescript
export class AnchorAttribute {
  constructor(
    public readonly type: AnchorType,
    public readonly value: string,
  ) {}
}
```

### Application Layer

**신규 UC**: `ApplyAnchorFilter`
- 앵커 속성 일치 + 주제 stance 차이 필터링
- 에너지와 다름 슬라이더 상한 통합
- **Agent 연동**: 매칭 풀 부족 시, Agent 페르소나도 앵커 속성(ageGroup, jobCategory 등)을 보유하므로 동일한 필터 로직 적용 가능

### Presentation Layer

**신규**: `AnchorFilterPanel`
- 공통점 선택: 같은 성별 / 직업군 / 연령대
- 다름의 정도 슬라이더 (에너지 레벨과 연동하여 상한 제한)

### Agent 페르소나와의 연동
- `PersonaProfile`의 기존 필드(`ageGroup`, `jobCategory`)가 앵커 속성으로 직접 매핑됨
- Cold Start 시 앵커 필터 적용 → 해당 속성이 일치하는 페르소나 우선 추천
- 예: 사용자가 "같은 30대, 다른 경제 관점" 선택 → ageGroup='30대'인 페르소나 중 stance distance가 슬라이더 범위 내인 페르소나 매칭

### 이벤트
| 이벤트 | 트리거 |
|--------|--------|
| `anchor_filter_select_{type}` | 앵커 필터 선택 |
| `distance_slider_set` | 다름 슬라이더 설정 |

---

## 관련 ADR

### ADR-V4-002: AI Agent 페르소나 — stance-grounded generation
- **결정**: 페르소나 stance vector를 LLM system prompt에 주입하여 입장 일관성 보장
- **근거**: 단순 "반대 의견 봇"이 아닌, 배경/경험/뉘앙스를 가진 입체적 캐릭터
- **트레이드오프**: 프롬프트 복잡성 증가 vs 자연스러움

### ADR-V4-006: 튜링 게임 — 투명성 우선
- **결정**: AI를 숨기지 않고, 게임으로 전환
- **근거**: 속이면 신뢰 붕괴. 게임은 "주의 깊게 읽기" 부수효과
- **트레이드오프**: AI임을 아는 순간 대화 태도 변화 가능 vs 윤리적 투명성

---

## 관련 이벤트 택소노미

### 매칭 (Agent 관련)
| 이벤트 | 트리거 |
|--------|--------|
| `persona_select_{id}` | 페르소나 선택 |
| `persona_dialogue_start` | Agent 대화 시작 |
| `persona_response_generated` | Agent 응답 생성 |

### 피크-엔드 (Agent 관련)
| 이벤트 | 트리거 |
|--------|--------|
| `turing_guess_{human\|ai}` | 튜링 게임 응답 |
| `turing_correct` | 튜링 게임 정답 |
| `final_cta_click` | 최종 CTA 클릭 (Agent 분기 포함) |

---

## 관련 Guardrail

| Guardrail | 임계값 | 위반 시 |
|-----------|--------|--------|
| AI→사람 오인율 | >40% (목표) | 프롬프트/딜레이 튜닝 |
| Agent 대화 만족도 | >3.0/5 | 페르소나 프로필/프롬프트 재설계 |
| Agent 대화 완료율 | >45% | UX/난이도 조정 |
| AI "속은 느낌" 불만 | <2% | 투명성 고지 강화 |

---

## DI Container 바인딩 (Agent 관련)

| 인터페이스 | 구현체 | Phase |
|-----------|--------|-------|
| `PersonaRepository` | `SupabasePersonaRepository` | P0 |
| `PersonaDialogueGenerator` | `PersonaLlmAdapter` | P0 |
| `TrailerGenerator` | `TrailerLlmAdapter` | P0 |

---

## 의존성 흐름 (Agent 관련)

```
P0-A3 (AI 페르소나) ──────────────────────────┐
       │                                       │
       ▼                                       ▼
P0-B3 (매칭 엔진 — Cold Start 분기)    P0-B4 (Trailer LLM 생성)
       │                                       │
       └──────────┬────────────────────────────┘
                  ▼
       P0-B5 (매칭 카드 통합 — 페르소나 포함)
                  │
                  ▼
       P0-D3 (피크-엔드 — Agent CTA 분기)
                  │
                  ▼
       P1-10 (앵커 매칭 — Agent 페르소나 속성 연동)
                  │
                  ▼
       P2-3 (튜링 테스트 게임)
                  │
                  ▼
       P2-4 (페르소나 저장 & 메모리)
```