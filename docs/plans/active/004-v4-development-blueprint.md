# PerspectiveShift v4.0 Development Blueprint

**Status**: In Progress (P0 실행 중)
**Created**: 2026-02-19
**Last Updated**: 2026-02-20
**Source**: `PerspectiveShift_v4.md`

---

## Table of Contents

0. [Implementation Tracking (Live)](#0-implementation-tracking-live)
1. [Executive Summary](#1-executive-summary)
2. [Gap Analysis: v3 → v4](#2-gap-analysis)
3. [Architecture Overview](#3-architecture-overview)
4. [Priority Tiers](#4-priority-tiers)
5. [Phase V4-P0: Core Loop MVP](#5-phase-v4-p0)
6. [Phase V4-P1: Loop Quality](#6-phase-v4-p1)
7. [Phase V4-P2: Persistence & Scale](#7-phase-v4-p2)
8. [Shared Infrastructure](#8-shared-infrastructure)
9. [Event Taxonomy](#9-event-taxonomy)
10. [ADRs](#10-adrs)
11. [Dependency Graph](#11-dependency-graph)
12. [Quality Gates](#12-quality-gates)

---

## 0. Implementation Tracking (Live)

> 구현 턴이 끝날 때마다 아래 표의 상태를 갱신한다.
> 상태 코드: `DONE`(완료) / `PARTIAL`(부분 완료) / `TODO`(미구현)

| Feature | Status | Last Updated | Notes |
|---------|--------|--------------|-------|
| P0-A1 Trust Moment UI 리팩토링 | PARTIAL | 2026-02-19 | 3줄 요약/Disclosure/CTA/이벤트/테스트 완료. 데이터 관리 즉시 진입 deep-link는 보완 예정 |
| P0-A2 온보딩 문항 UX 개선 | DONE | 2026-02-19 | 정밀도(5/10/20), 진행 중 변경, 불확실 옵션, 예시 스와이프/Coach, 툴팁, 이벤트, 테스트 반영 |
| P0-A3 AI Agent 페르소나 시스템 | DONE | 2026-02-20 | AI/사람 통합 매칭 풀 전환, MatchCandidate(candidateType/personaId) 반영, PersonaResponseDelay 분포 기반 확장, PersonaSelector 폐기, CreateAgentDialogueSession/GeneratePersonaResponse 연동 |
| P0-B1 Thought Map 결과 + 유형 카드 공유 | PARTIAL | 2026-02-19 | 단일 CTA/접힘 추천/공유 카드/이벤트/추천 UC 반영. OG 이미지 생성은 보완 예정 |
| P0-B2 에너지 체크 + 즉시 반응 UI | DONE | 2026-02-19 | 에너지 매핑 VO/UC, 라디오 셀렉터, framer-motion 카드 전환, 즉시 반응 통합 카드/페이지 연결, 테스트 반영 |
| P0-B3 매칭 엔진 고도화 | DONE | 2026-02-20 | 사람+Agent 통합 스코어링, pool_scarcity_bonus, decline 패널티, 앵커/에너지 연동, CheckMatchingPool의 suggestPersona 분기 제거 |
| P0-B4 Conversation Trailer 생성 | DONE | 2026-02-19 | TrailerGenerator 인터페이스, GenerateConversationTrailer UC, FallbackTrailerGenerator(규칙 기반 스텁), 차원별 stance 차이 기반 2-3줄 생성, 13 테스트 |
| P0-B5 매칭 카드 통합 UI | DONE | 2026-02-20 | IntegratedMatchCard AI/사람 비구분 렌더링, AiDisclaimerBanner(사전 고지), AnchorFilterPanel 연동, PersonaSelector 제거 |
| P0-C1 모바일 탭 하이라이트 | DONE | 2026-02-19 | TextSegment VO, TextSegmenter 인터페이스, SegmentText/CreateHighlightByTap UC, KoreanTextSegmenter(정규식 기반 한국어 문장 분할), TapHighlight UI, 40 테스트 |
| P0-C2 톤 체크 UX 전환 | DONE | 2026-02-19 | ToneSuggestion 다중 대안 모델(A/B/C), ToneAlternative 타입, CheckTone UC 확장, ToneCheckPanel UI(경고→제안 전환), 42 테스트 |
| P0-D1 리플렉션 경량화 | DONE | 2026-02-19 | ReflectionFlow lightweight 모드(QUIZ+VERIFICATION 2단계), maxQuizQuestions/feelHeardThreshold/shouldShowEditUI 추가, 26 테스트 |
| P0-D2 공동 요약 카드 강화 | DONE | 2026-02-19 | JointSummaryCard 확장(topic/date/myKeyPoint/opponentKeyPoint/commonGround/newDiscovery/understandingScore/feelHeardScore/autoSaved), 검증 로직, 강화된 UI, 39 테스트 |
| P0-D3 피크-엔드 플로우 구조화 | DONE | 2026-02-20 | PeakEndFlow(요약→선물→발견→KPI→튜링→질문→CTA), Agent 전용 CTA 제거, 통합 CTA/튜링 리워드 분기 반영 |

---

## 1. Executive Summary

### v4.0의 핵심 변화

v4.0은 v3.0의 "구조화된 대화" 위에 **3가지 핵심 레이어**를 추가한다:

1. **JITAI (Just-In-Time Adaptive Intervention)**: 사용자 상태(에너지/피로/불안)에 따라 난이도·시간·거리를 동적 조정
2. **AI/사람 통합 매칭 풀**: 동일 매칭 카드 + 사전 고지 + 튜링 게임으로 Cold Start를 자연스럽게 흡수
3. **Peak-End 경험 설계**: 선물 한 문장, Blind Spot Discovery, 튜링 테스트 게임

### OEC (목적 함수)

```
OEC = 대화 완료율 × Feel Heard × 재매칭 클릭/7일 재방문
```

태도 변화(stance shift)는 추적하되 KPI로 삼지 않는다 (설득 도구 변질 방지).

### 전체 일정 (1인 개발 기준)

| Tier | 예상 기간 | 핵심 목표 |
|------|----------|----------|
| P0 | 8-12주 | 루프 1회전 완성 (대화 한 번 완료 + 재방문 이유 1개) |
| P1 | 6-10주 | 루프 품질 향상 (두 번째 대화를 하고 싶게) |
| P2 | 10-16주 | 지속성 & 확장 (관계, JITAI, PWA) |

---

## 2. Gap Analysis: v3 → v4 {#2-gap-analysis}

### 2.1 기존 구현 완료 항목

| 영역 | 파일/모듈 | 상태 |
|------|----------|------|
| Next.js App Router | `src/app/` (funnel/main/immersive route groups) | ✅ |
| Supabase Auth | OAuth 2.0 (Google, Kakao) | ✅ |
| Domain Entities | 22개 엔티티 (`src/domain/entities/`) | ✅ |
| Value Objects | 34개 VO (`src/domain/value-objects/`) | ✅ |
| Repository Interfaces | 25개 (`src/domain/interfaces/`) | ✅ |
| Use Cases | 80+ use cases (`src/application/use-cases/`) | ✅ |
| Dialogue FSM | AFFIRMATION→POSITION→QUESTION→ANSWER→REFLECTION→JOINT_SUMMARY | ✅ |
| Stance Vector / Thought Map | `stance-vector.ts`, `thought-map.ts`, `thought-map-alias.ts` | ✅ |
| Matching Engine (기본) | `find-match-candidates.ts`, `create-match-proposal.ts` | ✅ |
| Energy Level | `energy-level.ts`, `select-energy-level.ts` | ✅ |
| Tone Check | `tone-suggestion.ts`, `check-tone.ts` | ✅ (경고형) |
| Recovery Routine | `recovery-routine.ts`, `apply-recovery-routine.ts` | ✅ (기본) |
| Highlight | `highlight.ts`, `create-highlight.ts` | ✅ |
| Reflection | `reflection-flow.ts`, `reflection-quiz.ts` | ✅ |
| Peak-End | `peak-end-flow.ts`, `peak-end-kpi.ts` | ✅ (기본) |
| Gift Message | `gift-message.ts`, `write-gift-message.ts`, `reveal-gift-message.ts` | ✅ |
| Blind Spot | `blind-spot-discovery.ts`, `extract-blind-spot.ts` | ✅ |
| Next Question | `next-question-save.ts`, `save-next-question.ts` | ✅ |
| Conversation Trailer | `conversation-trailer.ts` (VO) | ✅ (VO만) |
| Perspective Passport | `perspective-passport.ts`, `update-perspective-passport.ts` | ✅ |
| Decline Reason | `decline-reason.ts`, `record-decline-reason.ts` | ✅ |
| Tests | 149 files, 877 tests | ✅ |

### 2.2 v4.0 신규/변경 필요 항목

| 구분 | 항목 | 기존 상태 | v4 요구사항 | Priority | 진행상태 |
|------|------|----------|-----------|----------|----------|
| **변경** | Trust Moment UI | 정책 설명형 | 3줄 요약 + 🔒 UI + 데이터 관리 즉시 진입 | P0 | PARTIAL |
| **변경** | 에너지 체크 UI | 에너지 선택만 | 선택 시 매칭 카드 **즉시 반응** + 마이크로 애니메이션 | P0 | DONE |
| **변경** | 톤 체크 UX | 경고형 | 3안 제안형 + "원래대로 보내기" 상시 노출 | P0 | TODO |
| **변경** | 리플렉션 UX | 서술형 중심 | 퀴즈 1문항 + 슬라이더 경량화 | P0 | TODO |
| **변경** | 피크-엔드 UX | 기본 KPI만 | 선물→발견→KPI→튜링→다음질문→CTA 구조화 | P0 | DONE |
| **신규** | 모바일 탭 하이라이트 | 드래그 방식 | 문장 단위 탭→하이라이트/해제 + 인용 삽입 | P0 | TODO |
| **신규** | Conversation Trailer 생성 | VO만 존재 | stance 기반 2줄+1줄 미리보기 LLM 생성 | P0 | DONE |
| **신규** | AI Agent 페르소나 | 미구현 | 사람/Agent 통합 매칭 풀 + candidateType 내부 처리 + 자연 딜레이/프롬프트 강화 | P0 | DONE |
| **신규** | 매칭 카드 통합 UI | 부분 구현 | AI/사람 비구분 카드 + 사전 고지 배너 + 단일 프레이밍("대화 상대") | P0 | DONE |
| **신규** | 수용성 전염 | 미구현 | 상대 수용적 문장 감지 + 포함 유도 | P1 | TODO |
| **신규** | Decline 배지 연동 | Decline 사유만 | 사유→파라미터 매핑→배지 시각화 | P1 | TODO |
| **신규** | Trailer 일치도 품질 루프 | 미구현 | 일치도 수집→플래깅→프롬프트 튜닝 | P1 | TODO |
| **신규** | 차원별 매칭 필터 (앵커) | 미구현 | "같은 X, 다른 Y" + 다름 슬라이더 | P1 | TODO |
| **신규** | D+1 복기 | 미구현 | 20초 복기 카드 + 응답별 분기 | P1 | TODO |
| **신규** | JITAI Rule Engine | 미구현 | Rule A~E 규칙 기반 엔진 | P2 | TODO |
| **신규** | 복구 루틴 고도화 | 기본만 | 확인 질문 + 약속 3개 + 복구 모드 배지 | P2 | TODO |
| **신규** | 튜링 테스트 게임 | 미구현 | 사람/AI 맞추기 + 리워드 + 정답률 추적 | P2 | TODO |
| **신규** | 페르소나 저장 & 메모리 | 미구현 | 대화 이력 recall + 재대화 연속성 | P2 | TODO |
| **신규** | PWA 설정 | 미구현 | manifest + service worker + install prompt | P2 | TODO |
| **신규** | 알림 시스템 | 미구현 | D+1 + 매칭 가능 + 인사이트 (PWA 푸시) | P2 | TODO |

---

## 3. Architecture Overview {#3-architecture-overview}

### 3.1 Clean Architecture Layer Mapping

```
src/
├── domain/                          # 순수 비즈니스 규칙 (외부 의존성 0)
│   ├── entities/                    # 비즈니스 객체
│   ├── value-objects/               # 불변 값 타입
│   ├── events/                      # 도메인 이벤트
│   ├── errors/                      # 도메인 에러
│   ├── interfaces/                  # 포트 인터페이스 (Repository, Service)
│   └── services/                    # 도메인 서비스
│
├── application/                     # Use Cases + DTOs
│   ├── use-cases/                   # 애플리케이션 비즈니스 규칙
│   ├── dtos/                        # 경계 횡단 DTO
│   ├── ports/                       # Input/Output 포트
│   └── services/                    # 애플리케이션 서비스
│
├── infrastructure/                  # 외부 세계 어댑터
│   ├── persistence/                 # Supabase Repository 구현체
│   ├── api/                         # Next.js API Routes (Controller)
│   ├── external/                    # LLM (OpenAI), LangGraph, LangSmith
│   └── config/                      # DI Container (max 300 lines)
│
└── app/                             # Next.js Presentation Layer
    ├── (funnel)/                    # 온보딩 플로우 (auth, onboarding)
    ├── (main)/                      # 메인 기능 (dialogue, matching, friends)
    ├── (immersive)/                 # 몰입 기능 (chat)
    ├── _components/                 # 공유 컴포넌트
    ├── _shared/                     # 공유 유틸리티
    └── api/                         # API Routes
```

### 3.2 v4.0 신규 레이어 매핑

| v4 기능 | Domain | Application | Infrastructure | Presentation |
|---------|--------|-------------|----------------|-------------|
| AI 페르소나 | `PersonaProfile`, `MatchCandidate(candidateType)`, `PersonaResponseDelay` | `FindMatchCandidates`, `CreateAgentDialogueSession`, `GeneratePersonaResponse` | 통합 후보 쿼리 + LLM 프롬프트/딜레이 어댑터 | 비구분 매칭 카드 + `AiDisclaimerBanner` |
| JITAI 엔진 | `JitaiRule` VO, `InterventionAction` VO | `EvaluateJitaiRules`, `ApplyDownshift` | 신호 수집 어댑터 | 코치/휴식 UI |
| 튜링 게임 | `TuringGuess` entity | `SubmitTuringGuess`, `GetTuringStats` | 리워드 메시지 매핑 | 피크-엔드 Step 5 UI |
| 탭 하이라이트 | `TextSegment` VO | `SegmentText`, `CreateHighlightByTap` | NLP 문장 분할 | 탭 하이라이트 UI |
| Trailer 생성 | (기존 `ConversationTrailer` VO) | `GenerateConversationTrailer` | LLM Trailer 생성 | Trailer 카드 |
| 앵커 매칭 | `AnchorAttribute` VO, `AnchorType` VO, `DifferenceLevel` VO | `ApplyAnchorFilter` | 통합 후보 필터링 | 앵커 필터 + 다름 슬라이더 UI |
| 복기 D+1 | `DailyReview` entity | `CreateDailyReview`, `SubmitDailyReviewResponse` | 알림 스케줄러 | 복기 카드 |
| PWA | - | - | Service Worker, Manifest | Install Prompt |

---

## 4. Priority Tiers {#4-priority-tiers}

### Tier P0: Core Loop MVP (루프 1회전 성립)

> "대화가 한 번 완료되고, 사용자가 다시 올 이유가 1개라도 있는 상태"

12개 피처, 예상 8-12주

### Tier P1: Loop Quality (루프 품질)

> "두 번째 대화를 하고 싶게 만드는" 기능

10개 피처, 예상 6-10주

### Tier P2: Persistence & Scale (지속성)

> "서비스가 지속 가능하려면 필요한" 기능

10개 피처, 예상 10-16주

---

## 5. Phase V4-P0: Core Loop MVP {#5-phase-v4-p0}

### 개요

P0는 12개 세부 피처로 구성되며, 의존성에 따라 4개 Sub-Phase로 배치한다.

```
Sub-Phase A (기반): P0-1, P0-2, P0-12
Sub-Phase B (온보딩→매칭): P0-3, P0-4, P0-5, P0-6
Sub-Phase C (대화): P0-7, P0-8
Sub-Phase D (리플렉션→피크엔드): P0-9, P0-10, P0-11
```

---

### P0-A1: Trust Moment UI 리팩토링

**기획 참조**: v4 §2.1.3
**예상 공수**: S (1-2일)
**변경 유형**: 기존 변경
**구현 상태 (2026-02-19)**: `PARTIAL`

**구현 반영 파일**
- `src/app/(funnel)/onboarding/components/TrustMoment.tsx`
- `src/app/(funnel)/onboarding/page.tsx`
- `src/app/(funnel)/onboarding/__tests__/TrustMoment.test.tsx`

#### 목표
정책 설명형 → 3줄 요약 + 🔒 UI + 데이터 관리 즉시 진입 버튼

#### 화면 스펙

```
┌─────────────────────────────────────┐
│  🔒 당신의 생각은 안전합니다         │
│                                     │
│  ✓ 닉네임만 사용, 실명 비공개       │
│  ✓ 답변 원문은 분석 후 즉시 삭제    │
│  ✓ 언제든 모든 데이터 삭제 가능     │
│                                     │
│  [자세히 보기 ▾]                    │
│  ──────────────────────────         │
│  🗑️ 내 데이터 관리 (하단, 작게)     │
│            [ 시작하기 ]              │
└─────────────────────────────────────┘
```

#### Domain Layer
- 변경 없음 (순수 UI 변경)

#### Application Layer
- 변경 없음

#### Presentation Layer
- **파일**: `src/app/(funnel)/onboarding/components/TrustMoment.tsx`
- **변경사항**:
  1. 기존 장문 설명 → 3줄 체크리스트로 교체
  2. 🔒 아이콘 + 제목 "당신의 생각은 안전합니다"
  3. "자세히 보기" 접힘/펼침 (Disclosure)
  4. 하단 "내 데이터 관리" 링크 버튼 추가
  5. "시작하기" CTA

#### 이벤트 로깅
| 이벤트명 | 트리거 | 페이로드 |
|---------|--------|---------|
| `trust_moment_view` | 화면 진입 | `{ timestamp }` |
| `trust_moment_detail_expand` | "자세히 보기" 탭 | `{ timestamp }` |
| `trust_moment_data_mgmt_click` | "데이터 관리" 탭 | `{ timestamp }` |
| `trust_moment_proceed` | "시작하기" 탭 | `{ timestamp }` |

#### 테스트 스펙
| 테스트 | 파일 | 검증 내용 |
|--------|------|----------|
| 렌더링 | `TrustMoment.test.tsx` | 3줄 체크리스트, 🔒 아이콘, CTA 렌더링 |
| 접힘/펼침 | `TrustMoment.test.tsx` | "자세히 보기" 클릭 시 상세 내용 토글 |
| 이벤트 발화 | `TrustMoment.test.tsx` | 각 이벤트 정확히 발화 |
| 접근성 | `TrustMoment.test.tsx` | aria-label, role 확인 |

#### Guardrail
- Trust Moment 이탈률 >15% 시 카피/구조 재검토

---

### P0-A2: 온보딩 문항 UX 개선 (10문항 기본)

**기획 참조**: v4 §2.1.5, §2.1.6
**예상 공수**: M (3-5일)
**변경 유형**: 기존 변경
**구현 상태 (2026-02-19)**: `DONE`

**구현 반영 파일**
- `src/domain/value-objects/question-precision.ts`
- `src/domain/value-objects/question-item.ts`
- `src/application/use-cases/select-onboarding-mode.ts`
- `src/application/use-cases/change-precision-midway.ts`
- `src/app/(funnel)/onboarding/components/PrecisionSelector.tsx`
- `src/app/(funnel)/onboarding/components/OnboardingFlow.tsx`
- `src/app/(funnel)/onboarding/components/RubricQuestion.tsx`
- `src/app/(funnel)/onboarding/components/OpenEndedQuestion.tsx`
- `src/app/(funnel)/onboarding/actions.ts`
- `src/infrastructure/external/data/questions.json`

#### 목표
1. 정밀도 사다리 (5/10/20) 선택 UI + 진행 중 변경 가능
2. "모르겠어요 / 상황따라" 공식 옵션 추가 (Rubric 문항)
3. 서술형 3종 예시 스와이프 + Coach 버튼
4. "왜 묻는지" 툴팁 (1~2개 문항에만)

#### Domain Layer
- **신규 VO**: `src/domain/value-objects/question-precision.ts`
  ```typescript
  export type QuestionPrecision = 'quick' | 'standard' | 'detailed'; // 5 | 10 | 20
  ```
- **변경**: `src/domain/value-objects/question-item.ts`
  - `allowUncertain: boolean` 필드 추가 (모르겠어요/상황따라 허용 여부)
  - `tooltipText?: string` 필드 추가

#### Application Layer
- **변경**: `src/application/use-cases/select-onboarding-mode.ts`
  - `QuestionPrecision` 지원 추가
  - 정밀도 변경 시 문항 재구성 로직
- **신규**: `src/application/use-cases/change-precision-midway.ts`
  - 진행 중 정밀도 변경 use case

#### Presentation Layer
- **신규**: `src/app/(funnel)/onboarding/components/PrecisionSelector.tsx`
  - 5/10/20 카드 + 추천 표시 + 시간 예상
- **변경**: `src/app/(funnel)/onboarding/components/QuestionCard.tsx`
  - Rubric: "모르겠어요" / "상황따라" 옵션 추가
  - 서술형: 3종 예시 스와이프 (주장형/경험형/불확실형)
  - Coach 버튼 + 응답 패널
  - 일부 문항에 ℹ️ 툴팁
- **변경**: 상단 프로그레스에 `[변경]` 링크

#### 이벤트 로깅
| 이벤트명 | 트리거 |
|---------|--------|
| `precision_select_{5\|10\|20}` | 정밀도 선택 |
| `precision_change_midway` | 진행 중 변경 |
| `question_answer_{type}` | 문항 응답 |
| `question_skip` | 문항 건너뛰기 |
| `question_dontknow` | "모르겠어요" 선택 |
| `coach_click` | Coach 버튼 탭 |
| `example_swipe` | 예시 스와이프 |

#### 테스트 스펙
| 테스트 | 검증 내용 |
|--------|----------|
| PrecisionSelector 렌더링 | 3개 카드 + 추천 표시 |
| 정밀도 선택 → 문항 수 반영 | 5/10/20 선택 시 문항 수 변경 |
| 진행 중 변경 | 5→10 변경 시 남은 문항 추가 |
| "모르겠어요" 옵션 | Rubric 문항에 "모르겠어요" 표시 + 선택 가능 |
| Coach 버튼 | 클릭 시 도움말 응답 표시 |
| 예시 스와이프 | 3종 예시 좌우 스와이프 |

---

### P0-A3: AI Agent 페르소나 시스템 (통합 매칭 풀)

**기획 참조**: v4 §2.2.9 + `AI_Agent_new_function.md`
**예상 공수**: L (1-2주)
**변경 유형**: 신규
**의존성**: 없음 (독립)
**구현 상태 (2026-02-20)**: `DONE`

**구현 반영 파일**
- `src/domain/entities/persona-profile.ts`
- `src/domain/entities/match-candidate.ts`
- `src/domain/value-objects/persona-response-delay.ts`
- `src/application/use-cases/find-match-candidates.ts`
- `src/application/use-cases/create-agent-dialogue-session.ts`
- `src/application/use-cases/generate-persona-response.ts`
- `src/application/use-cases/check-matching-pool.ts` (`suggestPersona` 제거)
- `src/app/(main)/matching/page.tsx`
- `src/app/(main)/matching/components/IntegratedMatchCard.tsx`
- `src/app/(main)/matching/components/AiDisclaimerBanner.tsx`
- `src/app/(main)/dialogue/_components/TypingIndicator.tsx`

#### 목표
1. 사람/Agent 후보를 하나의 매칭 풀에서 통합 스코어링
2. 매칭 카드 UI에서 AI/사람 비구분 (동일 프레이밍: "대화 상대")
3. 매칭 카드 하단 사전 고지: "상대가 AI일 수 있어요. 대화 후 맞추면 리워드!"
4. 대화 중 UX를 사람/Agent 동일 흐름으로 유지 (타이핑 인디케이터 + 자연 딜레이)

#### Domain Layer

**변경 엔티티**: `src/domain/entities/match-candidate.ts`
```typescript
export class MatchCandidate {
  constructor(
    public readonly id: string,
    public readonly stanceVector: StanceVector,
    public readonly energyLevel: EnergyLevel,
    public readonly candidateType: 'human' | 'agent',
    public readonly personaId?: string,
  ) {}
}
```

**변경 엔티티**: `src/domain/entities/persona-profile.ts`
- `toAnchorAttributes()` 추가 (ageGroup/jobCategory를 앵커 속성으로 매핑)

**변경 VO**: `src/domain/value-objects/persona-response-delay.ts`
- Phase 1: 규칙 기반 지연 (`calculateRule`)
- Phase 2: 실제 응답 분포 기반 지연 (`calculateFromDistribution`)

#### Application Layer

**변경 UC**: `src/application/use-cases/find-match-candidates.ts`
- 사람 후보 + Agent 후보 통합 로드 후 단일 스코어링
- `pool_scarcity_bonus`로 AI 비율 자동 조정

**신규 UC**: `src/application/use-cases/create-agent-dialogue-session.ts`
- Agent 매칭 선택 시 대화 세션 생성 + 초기 상태 설정

**변경 UC**: `src/application/use-cases/check-matching-pool.ts`
- `suggestPersona` 반환 제거 (통합 매칭 풀에서 자동 처리)

**변경 UC**: `src/application/use-cases/generate-persona-response.ts`
- 자연 딜레이 + 구어체/불완전 표현 강화 프롬프트 적용

#### Infrastructure Layer

**변경**: 통합 후보 풀 조회
- 사람 후보 + 페르소나 후보를 단일 풀로 결합해 스코어링

**변경**: `src/infrastructure/external/persona-llm-adapter.ts`
- OpenAI GPT-5-mini 호출
- stance-grounded 생성 + 자연스러움 규칙(불완전 표현/길이 변동/경험담)

#### Presentation Layer

**폐기**: `PersonaSelector.tsx` (별도 AI 선택 UI 삭제)

**변경**: `src/app/(main)/matching/page.tsx`
- `candidateType` 분기 없이 동일 `IntegratedMatchCard` 렌더링
- 하단에 `AiDisclaimerBanner` 상시 노출

**변경**: `src/app/(main)/dialogue/[id]/page.tsx`
- 사람/Agent 공통 `TypingIndicator` UX
- "상대가 작성 중..." 상태를 동일하게 거친 뒤 응답 표시

#### 테스트 스펙 (요약)
| 테스트 | 검증 내용 |
|--------|----------|
| 통합 매칭 정렬 | 사람/Agent 후보를 단일 스코어로 정렬 |
| Agent 세션 생성 | 매칭 카드 진입 후 Agent 세션 생성 성공 |
| 사전 고지 배너 | 매칭 카드 하단 고지문 표시/탭 이벤트 |
| 대화 자연스러움 | 타이핑 인디케이터 + 딜레이 후 응답 표시 |

#### 이벤트 로깅
| 이벤트명 | 트리거 |
|---------|--------|
| `ai_disclaimer_view` | 고지 배너 뷰포트 진입 |
| `ai_disclaimer_tap` | 고지 배너 탭 |
| `_agent_matched` | 내부 분석용 Agent 매칭 |
| `_agent_response_generated` | 내부 분석용 Agent 응답 생성 |

#### Agent 품질 KPI
| 메트릭 | 목표 |
|--------|------|
| AI→사람 오인율 | >40% |
| Agent 대화 만족도 | >3.0/5 |
| Agent 대화 완료율 | >45% |

---

### P0-B1: Thought Map 결과 + 유형 카드 공유

**기획 참조**: v4 §2.1.7
**예상 공수**: M (3-5일)
**변경 유형**: 기존 변경
**의존성**: P0-A2 (정밀도 사다리)
**구현 상태 (2026-02-19)**: `PARTIAL`

**구현 반영 파일**
- `src/domain/value-objects/contextual-recommendation.ts`
- `src/application/use-cases/get-contextual-recommendations.ts`
- `src/app/(funnel)/onboarding/components/ThoughtMapResult.tsx`
- `src/app/(funnel)/onboarding/result/components/ShareCard.tsx`
- `src/app/(funnel)/onboarding/result/page.tsx`

#### 목표
1. 상단: 유형 별명 + stance 분포 시각화 + 정밀도 표시
2. 중단: CTA 1개만 크게 — "대화 상대 찾기"
3. 하단: 상황 기반 추천 (접힘)
4. 유형 카드 SNS 공유

#### Domain Layer
- 기존 `ThoughtMapAlias` 활용
- **신규 VO**: `src/domain/value-objects/contextual-recommendation.ts`
  ```typescript
  export type RecommendationType = 'precision_upsell' | 'match_suggestion' | 'misperception' | 'share_card';
  export class ContextualRecommendation {
    constructor(
      public readonly type: RecommendationType,
      public readonly label: string,
      public readonly priority: number,
    ) {}
  }
  ```

#### Application Layer
- **신규 UC**: `src/application/use-cases/get-contextual-recommendations.ts`
  - 로직: 정밀도 5→"정밀도 높이기", 매칭 풀 부족→"대화 상대 추천", 오해교정 대상→"오해교정", 항상→"유형 카드 공유"

#### Presentation Layer
- **변경**: `src/app/(funnel)/onboarding/result/page.tsx`
  - 유형 별명 + 시각화 (6축 레이더 차트 or 바 차트)
  - CTA 1개 크게: "대화 상대 찾기"
  - 접힘 영역: 상황 기반 추천
- **신규**: `src/app/(funnel)/onboarding/result/components/ShareCard.tsx`
  - og:image 메타 생성 또는 Canvas → PNG 변환

#### 이벤트
| 이벤트명 | 트리거 |
|---------|--------|
| `thought_map_view` | 결과 화면 진입 |
| `thought_map_cta_match_click` | "대화 상대 찾기" 클릭 |
| `thought_map_share_click` | "유형 카드 공유" 클릭 |
| `thought_map_precision_upsell` | "정밀도 높이기" 클릭 |
| `thought_map_match_suggestion_click` | "대화 상대 추천" 클릭 |

---

### P0-B2: 에너지 체크 + 즉시 반응 UI

**기획 참조**: v4 §2.2.3
**예상 공수**: M (3-5일)
**변경 유형**: 기존 변경
**의존성**: 없음
**구현 상태 (2026-02-19)**: `DONE`

**구현 반영 파일**
- `src/domain/value-objects/energy-level.ts`
- `src/domain/value-objects/__tests__/energy-level.test.ts`
- `src/application/use-cases/select-energy-level.ts`
- `src/application/use-cases/__tests__/select-energy-level.test.ts`
- `src/app/(main)/matching/components/EnergySelector.tsx`
- `src/app/(main)/matching/__tests__/EnergySelector.test.tsx`
- `src/app/(main)/matching/components/MatchCardV3.tsx`
- `src/app/(main)/matching/__tests__/MatchCardV3.test.tsx`
- `src/app/(main)/matching/components/EnergyReactiveMatchCard.tsx`
- `src/app/(main)/matching/__tests__/EnergyReactiveMatchCard.test.tsx`
- `src/app/(main)/matching/page.tsx`
- `package.json`

#### 목표
에너지 선택 변경 시 매칭 카드의 시간/난이도/거리/CTA 카피가 **0.3초 이내** 동적으로 변경되며, 마이크로 애니메이션 적용

#### Domain Layer
- 기존 `EnergyLevel` VO 활용
- **변경**: `src/domain/value-objects/energy-level.ts`
  - `getMatchingParams()` 메서드 추가:
    ```typescript
    getMatchingParams(): {
      difficultyRange: [number, number];
      distanceBand: [number, number];
      timeBudgetMinutes: number;
      scaffoldingLevel: 'minimal' | 'moderate' | 'high';
    }
    ```

#### Application Layer
- **변경**: `src/application/use-cases/select-energy-level.ts`
  - 에너지→매칭 파라미터 매핑 반환 추가

#### Presentation Layer
- **변경**: `src/app/(main)/matching/components/` (또는 `_components/`)
  - `EnergySelector.tsx`: 🔋🔋🔋 / 🔋🔋 / 🔋 라디오 버튼
  - `MatchingCard.tsx`: 에너지 변경 시 framer-motion 트랜지션
    - 숫자: `AnimatePresence` + counter 트랜지션
    - 라벨: fade 트랜지션
    - CTA 카피: fade 트랜지션
  - **필수 의존성**: `framer-motion` 패키지

#### 에너지→파라미터 매핑
| 에너지 | 시간 | 난이도 | 거리 라벨 | CTA 카피 |
|--------|------|--------|----------|----------|
| 🔋 높음 | 15분 | Level 2-3 | "의미있는 차이" | "대화 시작" |
| 🔋 보통 | 10분 | Level 1-2 | "적당한 차이" | "대화 시작" |
| 🔋 낮음 | 5분 | Level 0-1 | "살짝 다른" | "가볍게 5분 시작" |

#### 테스트 스펙
| 테스트 | 검증 내용 |
|--------|----------|
| EnergyLevel.getMatchingParams() | 각 레벨별 올바른 파라미터 반환 |
| 에너지 변경 시 카드 반응 | 선택 변경 → 시간/난이도/거리/CTA 동적 변경 |
| 애니메이션 렌더링 | framer-motion 트랜지션 발생 확인 |

---

### P0-B3: 매칭 엔진 고도화

**기획 참조**: v4 §2.2.7
**예상 공수**: L (1-2주)
**변경 유형**: 기존 변경
**의존성**: P0-B2 (에너지 파라미터)
**구현 상태 (2026-02-20)**: `DONE` (30 테스트)

#### 목표
매칭 스코어 공식 구현:
```
match_score = w1 × distance_fit
            + w2 × readiness_score
            + w3 × topic_relevance
            + w4 × energy_compat
            + w5 × anchor_similarity
            - penalty_recent_decline
            + pool_scarcity_bonus
```

#### Domain Layer
- **변경**: `src/domain/entities/match-candidate.ts`
  - `candidateType: 'human' | 'agent'` 필드 추가 (UI 미노출)
  - `personaId?: string` 필드 추가 (Agent 후보 참조)
  - `energyCompat` 필드 추가
  - `recentDeclinePenalty` 필드 추가
- **변경**: `src/domain/value-objects/match-score.ts`
  - 스코어 공식 리팩토링: 가중치 기반 합산 + `pool_scarcity_bonus`
- **변경**: `src/domain/value-objects/distance-band.ts`
  - Sweet spot 범위: 에너지별 정의

#### Application Layer
- **변경**: `src/application/use-cases/find-match-candidates.ts`
  - 사람 후보 + Agent 후보 통합 로드
  - 에너지 호환성 스코어링 추가
  - 최근 decline 패널티 적용
  - 매칭 풀 부족 시 `pool_scarcity_bonus`로 Agent 비율 자동 조정

#### Distance Sweet Spot
| 에너지 | Cosine Distance 범위 |
|--------|---------------------|
| 높음 | 0.5 ~ 0.7 |
| 보통 | 0.3 ~ 0.5 |
| 낮음 | 0.1 ~ 0.3 |

#### 테스트 스펙
| 테스트 | 검증 내용 |
|--------|----------|
| 스코어 계산 | 가중치 기반 합산 정확성 |
| Sweet Spot 필터링 | 에너지별 거리 범위 내 후보만 반환 |
| Decline 패널티 | 최근 decline 매칭과 유사한 후보에 패널티 |
| 통합 풀 정렬 | 사람/Agent 후보 통합 정렬 결과 검증 |
| Scarcity bonus | 사람 후보 0/1~2/3+ 구간별 보정값 적용 |

---

### P0-B4: Conversation Trailer 생성

**기획 참조**: v4 §2.2.4
**예상 공수**: M (3-5일)
**변경 유형**: 신규 (VO 존재, 생성 로직 없음)
**의존성**: P0-B3 (매칭)
**구현 상태 (2026-02-19)**: `DONE` (13 테스트)

#### 목표
stance vector 기반 2줄+1줄 미리보기 LLM 생성

#### Trailer 템플릿
```
Line 1: "이 분은 [A 입장]에 가깝지만,"
Line 2: "[B 측면]도 인정하는 편이에요."
Line 3 (옵션): "대화에서 이런 포인트가 나올 수 있어요: ___"
```

#### Domain Layer
- 기존 `ConversationTrailer` VO 활용
- **신규 인터페이스**: `src/domain/interfaces/trailer-generator.ts`
  ```typescript
  export interface TrailerGenerator {
    generate(
      opponentStance: StanceVector,
      myStance: StanceVector,
      topic: string,
    ): Promise<ConversationTrailer>;
  }
  ```

#### Application Layer
- **신규 UC**: `src/application/use-cases/generate-conversation-trailer.ts`
  - 입력: 상대 stanceVector, 내 stanceVector, 주제
  - 출력: ConversationTrailer (Line 1-3)
  - 규칙: 서술형 답변 원문 사용 금지 (프라이버시)

#### Infrastructure Layer
- **신규**: `src/infrastructure/external/trailer-llm-adapter.ts`
  - `TrailerGenerator` 구현
  - stance vector → 자연어 변환 프롬프트
  - Line 3: 두 사용자 간 stance 차이가 가장 큰 하위 차원 1개
  - FallbackTrailerGenerator (규칙 기반 스텁) — 차원별 stance 차이 기반 2-3줄 생성

#### 테스트 스펙 (13 테스트)
| 테스트 | 검증 내용 |
|--------|----------|
| Trailer 구조 | Line 1-2 필수, Line 3 옵션 |
| 프라이버시 | 서술형 원문 미포함 검증 |
| Stance 기반 | 차이가 큰 차원이 Line 3에 반영 |

---

### P0-B5: 매칭 카드 통합 UI

**기획 참조**: v4 §2.2.5
**예상 공수**: M (3-5일)
**변경 유형**: 신규 통합
**의존성**: P0-B2, P0-B4
**구현 상태 (2026-02-20)**: `DONE` (19 테스트)

#### 목표
에너지 체크 + Trailer + 거리/난이도 라벨 + Decline 배지가 통합된 매칭 카드.
AI/사람은 카드에서 구분되지 않으며, 하단 사전 고지 배너만 공통 노출.

#### 화면 스펙
```
┌─────────────────────────────────────┐
│  [조정됨 배지] (Decline 반영 시)    │
│  ═══════════════════════════════    │
│  📌 주제: 최저임금 인상              │
│  거리: ●●●○○ 적당한 차이           │
│  난이도: Level 1                    │
│  예상 시간: 10분                    │
│  ──────────────────────────────    │
│  👤 상대방 미리보기                  │
│  [Conversation Trailer]            │
│  ──────────────────────────────    │
│            [ 대화 시작 ]             │
│                                     │
│  🎯 상대가 AI일 수 있어요.           │
│     대화 후 맞추면 리워드!           │
└─────────────────────────────────────┘
```

#### Presentation Layer
- **신규**: `src/app/(main)/matching/components/IntegratedMatchCard.tsx`
  - Props: `energy`, `trailer`, `distance`, `difficulty`, `timeBudget`, `declineBadge?`
  - `candidateType`를 UI props로 노출하지 않음 (비구분 UX)
  - 에너지 변경 시 모든 값 동적 반응
  - AI 페르소나 매칭 시에도 동일한 카드 구조 사용
- **신규**: `src/app/(main)/matching/components/DeclineBadge.tsx`
  - 배지 텍스트: "조정됨: 오늘은 가볍게(5분)" 등
- **신규**: `src/app/(main)/matching/components/AiDisclaimerBanner.tsx`
  - 문구: "상대가 AI일 수 있어요. 대화 후 맞추면 리워드!"
  - 작은 폰트/저강도 색상으로 과한 주의 환기 방지

---

### P0-C1: 모바일 탭 하이라이트

**기획 참조**: v4 §3.1.4
**예상 공수**: M (3-5일)
**변경 유형**: 신규 (기존 드래그→탭 전환)
**의존성**: 없음

#### 목표
모바일에서 문장 단위 탭→하이라이트/해제 + 인용 삽입

#### Domain Layer
- **신규 VO**: `src/domain/value-objects/text-segment.ts`
  ```typescript
  export class TextSegment {
    constructor(
      public readonly id: string,
      public readonly text: string,
      public readonly startIndex: number,
      public readonly endIndex: number,
      public readonly isHighlighted: boolean = false,
    ) {}
    toggle(): TextSegment { ... }
  }
  ```
- **신규 인터페이스**: `src/domain/interfaces/text-segmenter.ts`
  ```typescript
  export interface TextSegmenter {
    segment(text: string): TextSegment[];
  }
  ```

#### Application Layer
- **신규 UC**: `src/application/use-cases/segment-text.ts`
  - 입력: 상대 입장 텍스트
  - 출력: TextSegment[]
  - 분할 규칙: 마침표/물음표/느낌표 + 접속사("하지만", "그래서", "다만") 전후
- **변경**: `src/application/use-cases/create-highlight.ts`
  - 탭 기반 세그먼트 하이라이트 지원

#### Infrastructure Layer
- **신규**: `src/infrastructure/external/korean-text-segmenter.ts`
  - `TextSegmenter` 구현
  - 한국어 문장 분할 (정규식 기반, 향후 NLP 교체 가능)

#### Presentation Layer
- **신규**: `src/app/(main)/dialogue/_components/TapHighlight.tsx`
  - 세그먼트 목록 렌더링
  - 탭 → 하이라이트 토글
  - 하이라이트된 문장 탭 → "질문에 인용하기" 버튼
  - 인용 삽입: 질문 작성 영역에 📌 인용 블록 자동 삽입
- **변경**: `src/app/(main)/dialogue/_components/QuestionEditor.tsx` (또는 신규)
  - 인용 블록 UI
  - 인용 삭제 가능

#### 테스트 스펙
| 테스트 | 검증 내용 |
|--------|----------|
| TextSegment.toggle() | 하이라이트 상태 토글 |
| 한국어 문장 분할 | 마침표/접속사 기준 정확한 분할 |
| 탭→하이라이트 | 세그먼트 탭 시 하이라이트 토글 |
| 인용 삽입 | 하이라이트 문장 → 질문 영역에 인용 블록 삽입 |

---

### P0-C2: 톤 체크 UX 전환 (경고→제안)

**기획 참조**: v4 §3.1.5
**예상 공수**: M (3-5일)
**변경 유형**: 기존 변경
**의존성**: 없음

#### 목표
"공격적 표현 감지" 경고 → 2~3개 대안 제안 + "원래대로 보내기" 상시 노출

#### Domain Layer
- **변경**: `src/domain/value-objects/tone-suggestion.ts`
  - `alternatives: string[]` (2~3개 대안 문장)
  - `originalPreserved: boolean` (원문 유지 선택 가능)
  - `category: 'summary_confirm' | 'interest_reason' | 'uncertainty'` (대안 유형)

#### Application Layer
- **변경**: `src/application/use-cases/check-tone.ts`
  - 트리거 조건 변경: 공격적 어휘/단정만/strawman만 감지
  - NOT 트리거: 강한 의견, 감정 표현, 불확실성 표현
  - 출력: 2~3개 대안 + 원문 유지 옵션

#### Presentation Layer
- **변경**: 톤 체크 UI 컴포넌트
  - 제목: "💡 더 잘 전달되는 표현이 있어요"
  - 원문 표시
  - A/B/C 대안 3개 (요약+확인질문, 관심+근거질문, 불확실성표현)
  - `[ A 선택 ] [ B 선택 ] [ C 선택 ]` + `[ 원래대로 보내기 ]`
  - **경고 문구 절대 사용 금지**: "공격적 표현 감지", "부적절한 톤" 등

#### 이벤트
| 이벤트명 | 트리거 |
|---------|--------|
| `tone_check_trigger` | 톤 체크 발동 |
| `tone_check_option_select_{a\|b\|c}` | 대안 선택 |
| `tone_check_original_send` | 원문 유지 선택 |

#### 테스트 스펙
| 테스트 | 검증 내용 |
|--------|----------|
| 트리거 조건 | 공격적 어휘→트리거, 강한 의견→미트리거 |
| 대안 생성 | 2~3개 대안 + 의미 보존 |
| 원문 유지 | "원래대로 보내기" 항상 접근 가능 |
| UI 문구 | "경고/감지/부적절" 단어 미포함 |

---

### P0-D1: 리플렉션 경량화

**기획 참조**: v4 §3.2
**예상 공수**: S (1-2일)
**변경 유형**: 기존 변경
**의존성**: 없음

#### 목표
1. R1: 이해도 퀴즈 1문항 (2~3개 선택지, 30초)
2. R2: 상호확인 슬라이더 (Feel Heard 1~5, 낮을 때만 수정 UI 펼침)
3. 공동 요약 카드 자동 생성 + 자동 저장

#### Domain Layer
- 기존 `ReflectionQuiz`, `MutualVerification` 활용
- **변경**: `src/domain/entities/reflection-flow.ts`
  - R1: 1문항으로 제한
  - R2: 슬라이더 1~2 시 수정 입력 필드 활성화

#### Presentation Layer
- **변경**: 리플렉션 컴포넌트
  - R1: "상대방이 가장 중요하게 말한 포인트는?" + 선택지 2~3개
  - 정답/오답 아닌 이해 피드백: "잘 잡았어요!" / "확인해보면 더 정확해져요"
  - R2: 슬라이더 + 조건부 수정 입력

---

### P0-D2: 공동 요약 카드 강화

**기획 참조**: v4 §3.2.6
**예상 공수**: M (3-5일)
**변경 유형**: 기존 변경
**의존성**: P0-D1

#### 목표
양쪽 요약이 한 장으로 합쳐지는 카드 + Understanding Score + Feel Heard 표시

#### 카드 구조
```
📋 대화 요약 | 주제: X | 날짜
──────────────────────
🧑 나의 핵심 주장: "..."
👤 상대의 핵심 주장: "..."
🤝 공통점: "..."
💡 새로운 발견: "..."
📊 Understanding Score: 0.8
❤️ Feel Heard: 4/5
──────────────────────
✅ 자동 저장됨
[ 📤 공유하기 ]
```

---

### P0-D3: 피크-엔드 플로우 구조화

**기획 참조**: v4 §3.3
**예상 공수**: S (1-2일)
**변경 유형**: 기존 변경
**의존성**: P0-D2
**구현 상태 (2026-02-20)**: `DONE` (44 테스트)

#### 목표
선물→발견→KPI→(튜링)→다음질문→CTA 순서 구조화

#### 플로우 순서
1. 공동 요약 카드 (P0-D2)
2. 선물 한 문장 공개 (기존 `RevealGiftMessage` 활용)
3. Blind Spot Discovery (기존 `ExtractBlindSpot` 활용)
4. KPI 수집 2문항 (Feel Heard + Trailer 일치도, 이모지 슬라이더)
5. 튜링 추측 UI: "방금 대화한 상대는 사람이었을까요?" — P2에서 구현
6. 다음 질문 저장 (기존 `SaveNextQuestion` 활용)
7. 최종 CTA 1개 (상황별 분기)

#### 상황별 CTA 규칙
| 조건 | CTA |
|------|-----|
| 대화 완료 (AI/사람 무관) | "다음 대화 찾기" |
| Feel Heard ≥4 | "친구 되기" (상대가 사람인 경우만 내부 활성화) |
| 에너지 낮음 | "오늘은 여기까지" |

#### Presentation Layer
- **신규**: `src/app/(main)/dialogue/_components/PeakEndFlow.tsx`
  - Step-by-step wizard: 각 단계를 순서대로 표시
  - KPI: 2문항 이모지 슬라이더 (자동 저장, 제출 버튼 없음)
  - CTA: 조건별 1개만 크게 + 작은 보조 링크

---

## 6. Phase V4-P1: Loop Quality {#6-phase-v4-p1}

### 개요

P0 완료 후 시작. "두 번째 대화를 하고 싶게 만드는" 기능들.

---

### P1-1: 스캐폴딩 (3종 예시 + Coach)

**기획 참조**: v4 §3.1.3
**예상 공수**: M (3-5일)

#### 목표
Step 1 입장 제시에서 빈칸 공포 해소

#### 구현 상세
- 입력 영역 상단에 3종 예시 좌우 스와이프
  - 주장형: "저는 ~라고 생각해요. 왜냐하면..."
  - 경험형: "주변에서 ~를 겪어봤는데..."
  - 불확실형: "아직 확신은 없지만, ~가 아닐까 싶어요"
- Coach 버튼: 시작 도움 (답을 주는 것이 아닌 시작 유도)
  - "이 주제에서 가장 먼저 떠오르는 경험이 있나요?"
  - "찬성/반대 중 하나를 고르면, 그 이유가 뭘까요?"
- JITAI Rule B 연동: 90초 무입력 + 삭제 2회 → Coach 하이라이트

#### Domain Layer
- 기존 `ScaffoldTemplate` VO, `CoachSuggestion` VO 활용

#### Application Layer
- 기존 `GetScaffoldForStep`, `GetCoachSuggestions` UC 활용
- **변경**: JITAI Rule B 조건 추가

#### Presentation Layer
- **신규**: `src/app/(main)/dialogue/_components/ScaffoldSwiper.tsx`
  - 3종 예시 좌우 스와이프 (Swiper 또는 scroll-snap)
- **변경**: Step1 입력 컴포넌트
  - Coach 버튼 + 응답 패널
  - JITAI: 90초 후 Coach 미세 애니메이션

---

### P1-2: 수용성 전염

**기획 참조**: v4 §3.1.4 (수용성 템플릿 개선)
**예상 공수**: M (3-5일)

#### 목표
기계적 수용성 템플릿 → 상대가 실제 사용한 수용적 문장 감지 + 포함 유도

#### 구현 상세
- LLM으로 상대 입장에서 수용적 표현 감지
- AI 제안: "상대방이 다른 관점도 고려하고 있어요. 이 표현을 참고해서 질문해보면 어떨까요?"
- `[ 이 표현을 내 답장에 포함 ]` / `[ 괜찮아요 ]`

#### Domain Layer
- **변경**: `src/domain/value-objects/receptiveness-template.ts`
  - `sourceType: 'mechanical' | 'detected'` 추가
  - `detectedExpression?: string` 추가

#### Application Layer
- **변경**: `src/application/use-cases/suggest-receptiveness-template.ts`
  - 상대 텍스트에서 수용적 표현 감지 로직 추가

---

### P1-3: Decline UX + 배지 연동

**기획 참조**: v4 §2.2.6
**예상 공수**: M (3-5일)

#### 목표
Decline 사유 수집 → 다음 매칭 파라미터 조정 → 배지 시각화

#### 사유→파라미터 매핑
| Decline 사유 | 다음 매칭 조정 | 배지 텍스트 |
|-------------|--------------|------------|
| 시간 부족 | time_budget → 5분 | `조정됨: 오늘은 가볍게(5분)` |
| 주제 부담 | difficulty → Level 0 | `조정됨: 주제 Level 0` |
| 에너지 없음 | energy override → low | `조정됨: 에너지 절약 모드` |
| 사유 미선택 | 기본 1단계 다운시프트 | (배지 없음) |

#### Domain Layer
- 기존 `DeclineReason` VO 활용
- **신규 VO**: `src/domain/value-objects/adjustment-badge.ts`
  ```typescript
  export class AdjustmentBadge {
    constructor(
      public readonly text: string,
      public readonly adjustments: MatchingAdjustment,
    ) {}
  }
  ```

#### Application Layer
- **변경**: `src/application/use-cases/record-decline-reason.ts`
  - 사유→파라미터 매핑 로직 추가
  - 다음 매칭 시 AdjustmentBadge 생성

---

### P1-4 ~ P1-6: 선물 / Blind Spot / 다음 질문

기존 구현 활용. UI 개선만.

- **P1-4**: 선물 한 문장 — Step2 직후 입력 슬롯 배치 (기존 UC 활용)
- **P1-5**: Blind Spot Discovery — "발견" 프레이밍 + 저장 CTA (기존 UC 활용)
- **P1-6**: 다음 질문 저장 — 재방문 홈에서 시작 카드 활용 (기존 UC 활용)

---

### P1-7: D+1 복기

**기획 참조**: v4 §4.2.2
**예상 공수**: M (3-5일)

#### 목표
대화 D+1에 20~30초 복기 카드 표시

#### Domain Layer
- **신규 엔티티**: `src/domain/entities/daily-review.ts`
  ```typescript
  export class DailyReview {
    constructor(
      public readonly id: string,
      public readonly userId: string,
      public readonly dialogueSessionId: string,
      public readonly topic: string,
      public readonly opponentKeyPoint: string,
      public readonly scheduledAt: Date,
      public readonly response?: 'changed' | 'unsure' | 'same',
      public readonly respondedAt?: Date,
    ) {}
  }
  ```

#### Application Layer
- **신규 UC**: `src/application/use-cases/create-daily-review.ts`
  - 대화 완료 시 D+1~3 복기 예약 (주제 민감도에 따라)
- **신규 UC**: `src/application/use-cases/submit-daily-review-response.ts`
  - 응답별 분기: changed→stance 업데이트 제안, unsure→Level 0 추천, same→새 주제 추천

#### Presentation Layer
- **신규**: `src/app/(main)/_components/DailyReviewCard.tsx`
  - 주제 + 상대 핵심 주장
  - 3개 응답 버튼: "생각이 바뀌었어요" / "잘 모르겠어요" / "같은 생각이에요"

---

### P1-8: Perspective Passport 기본

**기획 참조**: v4 §4.2.3
**예상 공수**: M (3-5일)

기존 `PerspectivePassport` 엔티티 + `UpdatePerspectivePassport` UC 활용.

#### UI 구현
- 탐색 관점 수 (주제 영역별)
- 뱃지 (관찰자, 경청가, 탐색가)
- 발견 카드 목록
- 저장된 페르소나 (P2에서 구현)

---

### P1-9: Trailer 일치도 품질 루프

**기획 참조**: v4 §2.2.4
**예상 공수**: M (3-5일)

#### 구현 상세
1. 대화 종료 시 Trailer 일치도 수집 (이모지 슬라이더, P0-D3의 KPI에 포함)
2. 일치도 <3.0 케이스 자동 플래깅
3. 플래깅 데이터 → 프롬프트 튜닝 입력으로 활용
4. Guardrail: 일치도 평균 <3.0 시 Trailer 생성 정책 긴급 리뷰

---

### P1-10: 차원별 매칭 필터 (앵커)

**기획 참조**: v4 §2.2.8
**예상 공수**: L (1-2주)
**구현 상태**: `TODO`

#### 목표
"같은 X, 다른 Y" 매칭 + 다름의 정도 슬라이더

#### Domain Layer
- **신규 VO**: `src/domain/value-objects/anchor-type.ts`
  ```typescript
  export type AnchorType = 'gender' | 'job_category' | 'age_group' | 'region';
  ```
- **신규 VO**: `src/domain/value-objects/anchor-attribute.ts`
  ```typescript
  export class AnchorAttribute {
    constructor(
      public readonly type: AnchorType,
      public readonly value: string,
    ) {}
  }
  ```
- **신규 VO**: `src/domain/value-objects/difference-level.ts`
  ```typescript
  export class DifferenceLevel {
    constructor(public readonly value: number) {
      if (value < 0 || value > 1) throw new Error('DifferenceLevel must be 0-1');
    }
  }
  ```

#### Application Layer
- **신규 UC**: `src/application/use-cases/apply-anchor-filter.ts`
  - 사람 후보 + Agent 후보 통합 로드 후 앵커/거리 필터링
  - `differenceLevel`(0~1)을 distance range로 변환해 적용
  - 에너지와 다름 슬라이더 상한 통합 (low 0.4 / medium 0.7 / high 1.0)
  - PersonaProfile의 앵커 속성(ageGroup, jobCategory)을 동일 규칙으로 매핑

#### Presentation Layer
- **신규**: `src/app/(main)/matching/components/AnchorFilterPanel.tsx`
  - 공통점 멀티 선택: 같은 성별/직업군/연령대/지역
  - 다름의 정도 슬라이더 (0~1)
  - 실시간 미리보기 텍스트: "같은 X인데, Y에 대해 Z 다른 생각"

#### Agent 페르소나 연동
- `PersonaProfile.ageGroup`, `PersonaProfile.jobCategory`를 앵커 속성으로 직접 매핑
- 통합 매칭 풀에서 앵커 필터를 만족하는 Agent/사람 후보를 동일 우선순위로 평가
- 예시: "같은 30대, 다른 경제 관점" 선택 시 `ageGroup='30대'` 페르소나 중 stance distance 범위 내 페르소나를 우선 노출

---

## 7. Phase V4-P2: Persistence & Scale {#7-phase-v4-p2}

### P2-1: JITAI Rule Engine

**기획 참조**: v4 §4.3
**예상 공수**: L (1-2주)

#### 규칙 정의

| Rule | 조건 | 행동 |
|------|------|------|
| A (피로) | energy == "low" | difficulty -1, distance -0.1, time 5~7분, scaffolding "high" |
| B (빈칸 공포) | Step1에서 90초 무입력 + 삭제 ≥2 | Coach 하이라이트, placeholder 삽입 |
| C (긴장) | 톤 체크 2회 연속 | "쉬어가기" 제안 (30초) + 수용성 템플릿 1개 |
| D (불쾌) | Feel Heard <2 OR 부정감정 OR 신고 | 복구 루틴 진입 |
| E (경청 부족) | Step2 하이라이트 0개 + 인용 0개 | 추천 문장 미세 강조 |

#### Domain Layer
- **신규 VO**: `src/domain/value-objects/jitai-rule.ts`
- **신규 VO**: `src/domain/value-objects/intervention-action.ts`

#### Application Layer
- **신규 UC**: `src/application/use-cases/evaluate-jitai-rules.ts`
  - 입력: 사용자 신호 (에너지, 작성시간, 삭제횟수, 톤체크횟수 등)
  - 출력: `InterventionAction[]` (적용할 개입 목록)
- **신규 UC**: `src/application/use-cases/apply-downshift.ts`
  - 다운시프트 파라미터 적용

#### 롤아웃 전략
1. Rule A → 전체 적용 (이미 에너지 기반)
2. Rule B → 10% → 25% → 50% → 100%
3. Rule C → 10% → 25% → 50% → 100%
4. Rule D → 전체 적용 (안전 기능)
5. Rule E → 10% → 25% → 50% → 100%

---

### P2-2: 복구 루틴 고도화

**기획 참조**: v4 §4.1
**예상 공수**: L (1-2주)

기존 `RecoveryRoutine` 엔티티 + `ApplyRecoveryRoutine` UC 확장.

#### 추가 구현
1. 확인 질문: "다음 대화를 조정해드릴까요?" (false positive 방지)
2. 구체적 변화 약속 3개 UI
3. 복구 모드 배지: 다음 매칭 카드 상단
4. 복구 해제 조건: 복구 대화 1회 + Feel Heard ≥3 / 수동 해제 / 3회 자동 해제

---

### P2-3: 튜링 테스트 게임

**기획 참조**: v4 §2.2.9 (튜링 테스트)
**예상 공수**: M (3-5일)
**구현 상태**: `TODO`

매칭 카드의 사전 고지(`AiDisclaimerBanner`)와 연동되어 동작한다.

#### Domain Layer
- **신규 엔티티**: `src/domain/entities/turing-guess.ts`
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

#### Application Layer
- **신규 UC**: `src/application/use-cases/submit-turing-guess.ts`
- **신규 UC**: `src/application/use-cases/get-turing-stats.ts`

#### 리워드 규칙
| 조건 | 리워드 | 메시지 |
|------|--------|--------|
| AI를 AI로 맞춤 | 뱃지 +1 | "정확해요! 관찰력이 날카로워요 👀" |
| 사람을 사람으로 맞춤 | 뱃지 +1 | "맞아요! 좋은 대화였죠 🎉" |
| 3연속 정답 | 칭호 획득 | "날카로운 관찰자" |
| AI를 사람으로 오인 | 경험치 +0.5 | "그만큼 자연스러운 관점이었어요 😊" |
| 사람을 AI로 오인 | 경험치 +0.5 | "그만큼 독특한 시각이었네요 🤔" |

---

### P2-4: 페르소나 저장 & 메모리

**기획 참조**: v4 §2.2.9 (페르소나 저장)
**예상 공수**: L (1-2주)
**구현 상태**: `TODO`

#### Domain Layer
- **신규 엔티티**: `src/domain/entities/saved-persona.ts`
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

#### Application Layer
- **신규 UC**: `src/application/use-cases/save-persona.ts`
- **신규 UC**: `src/application/use-cases/resume-persona-conversation.ts`
  - 이전 대화 요약 로드 → Agent에 컨텍스트 주입

---

### P2-5: R3 역할극 (Steelman)

기존 `RoleplaySteelman` VO + `SubmitRoleplaySteelman` UC 활용.
점진적 노출 전략 추가: 1~3회 옵트인, 4~6회 약한 넛지, 7회+ 기본 노출.

---

### P2-6: 정밀도 사다리 확장

P0-A2에서 기본 구현. P2에서 5문항 퀵 모드 + 업셀 UX 고도화.

---

### P2-7: Self-Affirmation 워밍업

기존 `SelfAffirmation` VO + `SubmitSelfAffirmation` UC 활용.
v4 마이크로카피: "불편한 주제를 다루기 전에, 내가 중요하게 생각하는 걸 먼저 확인하면 대화가 훨씬 편해진대요(20초)."

---

### P2-8: 알림 시스템 (PWA 푸시)

**예상 공수**: L (1-2주)

#### 구현 상세
1. PWA manifest.json + service worker
2. 알림 유형: D+1 복기, 매칭 가능, 페르소나 알림, 주간 인사이트
3. 알림 권한 요청: 첫 좋은 경험 이후 (대화 완료 + Feel Heard ≥3)
4. iOS: 홈화면 추가 유도
5. 알림 설정: 즉시 통제 (7일 끄기)

---

### P2-9: 친구 시스템 고도화

기존 `FriendRequest`, `Friendship` 엔티티 활용.
Phase 3 관계 에스컬레이션: 구조화 대화 → 친구 → 실시간 → 오프라인.

---

### P2-10: 공동 요약 카드 애니메이션

양쪽 요약이 한 장으로 합쳐지는 피크 모먼트 연출.
framer-motion: 두 카드가 중앙으로 이동 → 합쳐짐 → 파티클 이펙트.

---

## 8. Shared Infrastructure {#8-shared-infrastructure}

### 8.1 선행 조건 (P0 착수 전)

| 항목 | 설명 | 예상 공수 |
|------|------|----------|
| framer-motion 설치 | 마이크로 애니메이션 | S |
| 이벤트 로깅 인프라 | `track-event.ts` UC + Supabase events 테이블 | M |
| LLM 프롬프트 관리 체계 | Trailer, Persona, ToneCheck 프롬프트 버전 관리 | M |
| 한국어 문장 분할 유틸 | 탭 하이라이트용 | S |

### 8.2 패키지 의존성 추가

```json
{
  "dependencies": {
    "framer-motion": "^11.x"
  }
}
```

### 8.3 DI Container 업데이트

새로운 인터페이스/구현체 바인딩 추가 (max 300 lines 제약 유지):

| 인터페이스 | 구현체 | Phase |
|-----------|--------|-------|
| `PersonaRepository` | `SupabasePersonaRepository` | P0 |
| `PersonaDialogueGenerator` | `PersonaLlmAdapter` | P0 |
| `TrailerGenerator` | `TrailerLlmAdapter` | P0 |
| `TextSegmenter` | `KoreanTextSegmenter` | P0 |

---

## 9. Event Taxonomy {#9-event-taxonomy}

### 9.1 이벤트 네이밍 규칙

```
{feature}_{action}_{detail?}
```

### 9.2 전체 이벤트 목록

#### 온보딩
| 이벤트 | 트리거 |
|--------|--------|
| `trust_moment_view` | Trust Moment 화면 진입 |
| `trust_moment_detail_expand` | "자세히 보기" 탭 |
| `trust_moment_data_mgmt_click` | "데이터 관리" 탭 |
| `trust_moment_proceed` | "시작하기" 탭 |
| `affirmation_view` | Self-Affirmation 화면 진입 |
| `affirmation_select` | 가치 선택 |
| `affirmation_skip` | 건너뛰기 |
| `affirmation_complete` | 완료 |
| `precision_select_{5\|10\|20}` | 정밀도 선택 |
| `precision_change_midway` | 진행 중 변경 |
| `question_answer_{type}` | 문항 응답 |
| `question_skip` | 문항 건너뛰기 |
| `question_dontknow` | "모르겠어요" 선택 |
| `coach_click` | Coach 버튼 탭 |
| `example_swipe` | 예시 스와이프 |
| `thought_map_view` | 결과 화면 진입 |
| `thought_map_cta_match_click` | 매칭 CTA 클릭 |
| `thought_map_share_click` | 공유 클릭 |

#### 매칭
| 이벤트 | 트리거 |
|--------|--------|
| `energy_check_select_{high\|medium\|low}` | 에너지 선택 |
| `energy_check_change` | 에너지 변경 |
| `matching_card_render_time` | 카드 렌더링 시간 |
| `match_accept` | 매칭 수락 (`candidateType`은 내부 페이로드로만 수집) |
| `match_decline` | 매칭 거절 (`candidateType`은 내부 페이로드로만 수집) |
| `match_decline_reason_{time\|topic\|energy\|other}` | 거절 사유 |
| `adjusted_badge_display` | 조정 배지 표시 |
| `anchor_filter_set` | 앵커 필터 설정 완료 |
| `anchor_preview_render` | 앵커 미리보기 텍스트 렌더링 |
| `distance_slider_set` | 다름 슬라이더 설정 |
| `ai_disclaimer_view` | AI 가능성 고지 배너 노출 |
| `ai_disclaimer_tap` | AI 가능성 고지 배너 탭 |

#### 대화
| 이벤트 | 트리거 |
|--------|--------|
| `step1_start` / `step1_submit` | Step1 시작/제출 |
| `step1_idle_time` | Step1 무입력 시간 |
| `step1_delete_count` | Step1 삭제 횟수 |
| `highlight_created` / `highlight_removed` | 하이라이트 생성/제거 |
| `highlight_quote_insert` | 인용 삽입 |
| `tone_check_trigger` | 톤 체크 발동 |
| `tone_check_option_select_{a\|b\|c}` | 톤 체크 대안 선택 |
| `tone_check_original_send` | 원문 유지 |
| `receptivity_template_shown` | 수용성 제안 표시 |
| `receptivity_template_accept` | 수용성 제안 수락 |

#### 리플렉션 & 피크-엔드
| 이벤트 | 트리거 |
|--------|--------|
| `r1_quiz_answer` / `r1_quiz_correct` | 퀴즈 응답/정답 |
| `r2_slider_value` | Feel Heard 슬라이더 |
| `r2_correction_submit` / `r2_correction_skip` | 수정 제출/건너뛰기 |
| `r3_submit` / `r3_skip` | 역할극 제출/건너뛰기 |
| `summary_card_view` / `summary_card_share` | 요약 카드 보기/공유 |
| `gift_sentence_save` | 선물 문장 저장 |
| `blind_spot_save` | Blind Spot 저장 |
| `next_question_save` | 다음 질문 저장 |
| `turing_guess_submit` | 튜링 추측 제출 |
| `turing_reward_shown` | 튜링 리워드 메시지 표시 |
| `final_cta_click` | 최종 CTA 클릭 |

#### 복구 & 재방문
| 이벤트 | 트리거 |
|--------|--------|
| `recovery_trigger` | 복구 루틴 트리거 |
| `recovery_confirm_accept` / `recovery_confirm_decline` | 복구 확인 수락/거절 |
| `d1_review_open` | D+1 복기 오픈 |
| `d1_review_response_{changed\|unsure\|same}` | 복기 응답 |
| `passport_view` | 패스포트 조회 |

#### 내부 분석 이벤트 (사용자 미노출)
| 이벤트 | 트리거 |
|--------|--------|
| `_agent_matched` | Agent 후보 매칭 확정 |
| `_agent_response_generated` | Agent 응답 생성 완료 |
| `_agent_misidentified_as_human` | AI를 사람으로 오인 |
| `_human_misidentified_as_agent` | 사람을 AI로 오인 |

---

## 10. ADRs (Architecture Decision Records) {#10-adrs}

### ADR-V4-001: JITAI 엔진 — 규칙 기반으로 시작

**결정**: Phase 1~2는 규칙 기반(if-else), Phase 3+에서 ML 점진 도입
**근거**: 설명 가능성, 디버깅 용이, 빠른 튜닝. ML은 대화 1,000회+ 로그 축적 후
**트레이드오프**: 개인화 한계 vs 초기 운영 안정성

### ADR-V4-002: AI Agent 페르소나 — stance-grounded generation

**결정**: 페르소나 stance vector를 LLM system prompt에 주입하여 입장 일관성 보장
**근거**: 단순 "반대 의견 봇"이 아닌, 배경/경험/뉘앙스를 가진 입체적 캐릭터
**트레이드오프**: 프롬프트 복잡성 증가 vs 자연스러움

### ADR-V4-003: 모바일 하이라이트 — 탭 방식 전환

**결정**: 드래그→탭(문장 단위) 전환
**근거**: 모바일에서 드래그 텍스트 선택은 OS 기본 메뉴 충돌 + 정밀도 저하
**트레이드오프**: 세그먼트 분할 정확도 의존 vs 모바일 사용성 대폭 개선

### ADR-V4-004: 톤 체크 — 경고→제안 전환

**결정**: "공격적 표현 감지" 경고 → "더 잘 전달되는 표현" 제안
**근거**: 경고형은 reactance(반발) 유발. 제안형은 수용률 향상
**트레이드오프**: 제안 3개 생성 비용 vs 사용자 자율성 보장

### ADR-V4-005: Peak-End — 선물이 KPI보다 앞

**결정**: 감정 피크(선물/발견)를 KPI 설문보다 반드시 앞에 배치
**근거**: Peak-End Rule. 마지막 인상이 전체 기억을 결정
**트레이드오프**: KPI 응답률 미세 감소 가능 vs 경험 기억 품질 향상

### ADR-V4-006: 튜링 게임 — 투명성 우선

**결정**: 매칭 카드에서 "AI일 수 있음"을 사전 고지하고, 피크-엔드에서 튜링 게임으로 마무리
**근거**: 완전 비공개는 신뢰 리스크가 크고, 완전 공개는 대화 품질을 해칠 수 있어 균형점이 필요
**트레이드오프**: 일부 사용자가 상대를 과도하게 의심할 수 있음 vs 투명성과 몰입의 균형

### ADR-V4-007: AI/사람 통합 매칭 풀

**결정**: AI Agent와 실제 사람을 동일한 매칭 풀에서 통합 스코어링
**근거**: Cold Start를 별도 분기 없이 자연스럽게 흡수하고, 일관된 UX를 제공
**트레이드오프**: Agent 자연스러움 품질 요구치 상승, AI 비율 가드레일 필요

### ADR-V4-008: PersonaSelector 폐기 및 비구분 카드

**결정**: 사용자 대면 PersonaSelector UI를 제거하고 통합 매칭 카드만 노출
**근거**: "AI 연습" 프레이밍이 대화 태도를 왜곡하고 이중 트랙 UX 복잡도를 높임
**트레이드오프**: 내부 분기(친구 되기/후속 기능)의 서버 조건 로직이 복잡해짐

---

## 11. Dependency Graph {#11-dependency-graph}

```
P0-A1 (Trust Moment)         ─┐
P0-A2 (온보딩 문항)           ─┤── Sub-Phase A (기반)
P0-A3 (AI/사람 통합 매칭 기반) ─┘
         │
         ▼
P0-B1 (Thought Map) ←── P0-A2
P0-B2 (에너지 즉시반응)       ─┐
P0-B3 (통합 매칭 엔진) ←── P0-B2   ├── Sub-Phase B (온보딩→매칭)
P0-B4 (Trailer 생성) ←── P0-B3│
P0-B5 (비구분 매칭 카드+고지) ←── P0-B2, P0-B4
                               ─┘
         │
         ▼
P0-C1 (탭 하이라이트)         ─┐── Sub-Phase C (대화)
P0-C2 (톤 체크 제안)          ─┘
         │
         ▼
P0-D1 (리플렉션 경량화)       ─┐
P0-D2 (요약 카드) ←── P0-D1   ├── Sub-Phase D (리플렉션→피크엔드)
P0-D3 (피크엔드+튜링/통합CTA) ←── P0-D2
                               ─┘
         │
         ▼
P1-1 ~ P1-10 (루프 품질)
         │
         ▼
P2-1 ~ P2-10 (지속성 & 확장)
```

---

## 12. Quality Gates {#12-quality-gates}

### Per-Feature Quality Gate

모든 피처는 아래를 통과해야 "Done":

- [ ] **TDD**: 테스트 먼저 작성 → 구현 → 리팩토링
- [ ] **Build**: `pnpm build` 성공
- [ ] **Tests**: `pnpm test` 전체 통과
- [ ] **Lint**: `pnpm lint` 에러 0개
- [ ] **Clean Architecture**:
  - [ ] Domain에 외부 의존성 0
  - [ ] Use Case는 포트 인터페이스만 의존
  - [ ] DI Container 300줄 이하
- [ ] **이벤트 로깅**: 해당 피처의 모든 측정 이벤트 구현
- [ ] **Guardrail 메트릭**: 정의 + 모니터링 방법 명시
- [ ] **6대 UX 체크리스트**:
  - [ ] (A) 예측 가능성
  - [ ] (B) 통제감 (opt-out 상시 가능)
  - [ ] (C) 빈칸 공포 제거
  - [ ] (D) 안전 신호
  - [ ] (E) 피크-엔드
  - [ ] (F) 계측 가능성

### Per-Phase Quality Gate

각 Phase(P0/P1/P2) 완료 시:

- [ ] 해당 Phase의 모든 피처 Done
- [ ] 통합 테스트: 전체 루프 시나리오 통과
- [ ] 성능: 페이지 로드 <3초 (모바일 3G 기준)
- [ ] 접근성: 핵심 플로우 스크린리더 테스트

### Guardrail Metrics (전체)

| Guardrail | 임계값 | 위반 시 |
|-----------|--------|--------|
| 신고/차단 비율 | <1% / <2% | 즉시 조사 |
| "검열/설교" 민원 | <2% | 톤 체크 임계값 상향 |
| 부정 피드백 | <5% | A/B 중단 + 원인 분석 |
| AI "속은 느낌" 불만 | <2% | 투명성 고지 강화 |
| AI 매칭 비율 | 사람 후보 3명+ 구간에서 AI <30% | `pool_scarcity_bonus` 하향 |
| AI→사람 오인율 | >40% (목표) | 프롬프트/응답 딜레이 튜닝 |
| Agent 대화 만족도 | >3.0/5 | 페르소나 프로필/프롬프트 재설계 |
| Agent 대화 완료율 | >45% | UX/난이도 조정 |
| 과의심 행동 빈도 | "너 AI지?" 발화 <10% | 고지 문구 톤/위치 조정 |
| 앵커 필터 사용률 | 추적(하락 시 개선) | 노출 방식/기본값 재설계 |
| 프라이버시 불안 | <2% | Trust Moment 재설계 |
| JITAI "왜 이러지?" 혼란 | <3% | Rule 임계값 조정/비활성화 |

---

## Appendix A: 기능별 UX 스펙 템플릿

각 피처 구현 시 아래를 채운다:

```markdown
## [기능명]

### 1. 6대 체크리스트 점검
  (A) 예측 가능성: __
  (B) 통제감: __
  (C) 빈칸 공포 제거: __
  (D) 안전 신호: __
  (E) 피크-엔드: __
  (F) 계측 가능성: __

### 2. 사용자 심리 상태
  진입 시 감정: __
  주요 리스크: __

### 3. 화면 구성 (와이어프레임)

### 4. 마이크로 카피
  | 요소 | 카피 |
  |------|------|

### 5. 상태 전이
  진입 조건: __
  정상 완료: __
  이탈/에러: __
  JITAI 트리거: __

### 6. 측정 이벤트
  | 이벤트명 | 트리거 | 용도 |
  |---------|--------|------|

### 7. Primary 메트릭
### 8. Guardrail 메트릭
### 9. 실험 설계
```

---

## Appendix B: 실험 우선순위

### Quick Win (낮은 노력 × 높은 영향)
| # | 실험 | Primary 메트릭 |
|---|------|---------------|
| E1 | Trust Moment 카피 프레임 A/B | Trust Moment 이탈률 |
| E2 | 최종 CTA 1개 vs 다수 A/B | CTA 클릭률 |
| E3 | D+1 복기 길이 A/B | D+1 오픈율 |
| E4 | 알림 템플릿 A/B/C | 알림 오픈율 |

### Big Bet (높은 노력 × 높은 영향)
| # | 실험 | Primary 메트릭 |
|---|------|---------------|
| E5 | JITAI 전체 On/Off | 대화 완료율 + Feel Heard |
| E6 | 앵커 매칭 A/B | 대화 만족도 + 완료율 |
| E7 | 에너지 즉시 반응 A/B | 매칭 수락률 |
| E8 | 톤 체크 1안 vs 3안 | 톤 체크 수용률 |
| E9 | Agent 응답 딜레이 A/B | AI→사람 오인율 |

---

## Appendix C: 용어 정의

| 용어 | 정의 |
|------|------|
| JITAI | Just-In-Time Adaptive Intervention — 적시 적응형 개입 |
| Stance Vector | 사용자의 각 주제별 입장 수치화 다차원 벡터 (-1.0 ~ 1.0) |
| Opinion Distance | 두 사용자 간 stance vector의 코사인 거리 |
| Feel Heard | 상대에게 경청 받았다고 느끼는 정도 (1-5) |
| Conversation Trailer | 매칭 시 제공되는 대화 미리보기 |
| Steelman | 상대 입장을 가장 강력하게 재구성해보는 역할극 |
| Peak-End Rule | 경험의 기억은 가장 강렬한 순간과 마지막 순간에 의해 결정 |
| Scaffolding | 빈칸 앞에서 멈추지 않도록 예시/뼈대/코치를 제공하는 구조 |
| Downshift | 사용자 상태에 따라 난이도/거리/시간을 자동 하향 |
| Anchor | 매칭 시 공통 속성 (같은 성별, 직업군 등) |
| Cold Start | 초기 사람 매칭 풀이 부족한 상태 (통합 매칭 풀에서 AI 비율 자동 보정 대상) |
| OEC | Overall Evaluation Criterion — 전체 평가 기준 |
