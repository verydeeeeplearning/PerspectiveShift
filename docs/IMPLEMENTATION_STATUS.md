# PerspectiveShift 구현 현황 상세 문서

**최종 업데이트**: 2026-02-22 (사용자 피드백 버그 수정 반영)
**브랜치**: main

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [코드베이스 통계](#3-코드베이스-통계)
4. [아키텍처](#4-아키텍처)
5. [Domain Layer 상세](#5-domain-layer-상세)
6. [Application Layer 상세](#6-application-layer-상세)
7. [Infrastructure Layer 상세](#7-infrastructure-layer-상세)
8. [Presentation Layer 상세](#8-presentation-layer-상세)
9. [API Routes 전체 목록](#9-api-routes-전체-목록)
10. [데이터베이스 마이그레이션](#10-데이터베이스-마이그레이션)
11. [테스트 현황](#11-테스트-현황)
12. [버전별 구현 이력](#12-버전별-구현-이력)
13. [설계 문서 및 계획](#13-설계-문서-및-계획)
14. [알려진 이슈](#14-알려진-이슈)

---

## 1. 프로젝트 개요

**PerspectiveShift**는 LLM 에이전트 기반의 구조화된 대화 플랫폼(civic-tech)입니다.

### 핵심 컨셉

사용자는 온보딩 질문지를 통해 **6차원 입장 벡터(Stance Vector)**를 구축하고, 자신과 **다른 의견을 가진 사람과 매칭**되어 **AI 퍼실리테이터가 중재하는 6단계 구조화된 대화**에 참여합니다.

### 핵심 흐름

```
온보딩 (입장 발견) → 매칭 (상대 탐색) → 대화 (구조화된 교환) → 관계 (심화)
```

### 설계 철학

- **Identity-Stance-Dialogue 데이터 분리**: 매칭 엔진은 익명화된 Stance 데이터만 접근
- **Privacy by Design**: 모든 LLM 호출 전 PII 스크러빙 필수
- **Anonymous-First**: UUID 세션 기반, 로그인은 선택사항
- **Graceful Degradation**: 모든 LLM 어댑터에 Fallback 구현

---

## 2. 기술 스택

| 분류 | 기술 | 버전/상세 |
|------|------|----------|
| **언어** | TypeScript | strict mode |
| **프레임워크** | Next.js (App Router) | 15.5 |
| **패키지 매니저** | pnpm | — |
| **스타일링** | Tailwind CSS | v4 |
| **애니메이션** | Framer Motion | — |
| **단위 테스트** | Vitest | jsdom 환경 |
| **E2E 테스트** | Playwright | — |
| **린팅** | ESLint 9 | flat config |
| **포매팅** | Prettier | — |
| **LLM** | OpenAI GPT-5-mini | — |
| **에이전트** | LangGraph | StateGraph 기반 |
| **모니터링** | LangSmith | 트레이싱 |
| **데이터베이스** | Supabase (PostgreSQL) | RLS 적용 |
| **인증** | Supabase Auth | Google, Kakao, Apple OAuth |
| **실시간** | Supabase Realtime | 채팅/알림 |
| **배포** | Vercel | — |

---

## 3. 코드베이스 통계

### 파일 규모

| 구분 | 파일 수 | 라인 수 |
|------|--------|---------|
| **전체 프로덕션 코드** | 555 | 32,522 |
| **전체 테스트 코드** | 377 | 26,573 |
| **합계** | **932** | **59,095** |

### 레이어별 분포

| 레이어 | 프로덕션 파일 | 프로덕션 라인 |
|--------|-------------|-------------|
| Domain (entities + VOs + interfaces + services + events + errors) | ~160 | 6,895 |
| Application (use cases + DTOs + services) | ~140 | 6,009 |
| Infrastructure (persistence + external + config + agent) | ~60 | 5,635 |
| Presentation (pages + components + hooks + API routes) | ~198 | 13,995 |

### 테스트 현황 요약

| 항목 | 수치 |
|------|------|
| **총 테스트** | 1,939개 |
| **통과** | 1,925개 |
| **실패** | 14개 (기존 알려진 이슈, 버그 수정과 무관) |
| **테스트 파일** | 342개 (단위/통합 312 + E2E 30) |

---

## 4. 아키텍처

### Clean Architecture 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│  Presentation (Next.js App Router, React Components)    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Infrastructure (Supabase, OpenAI, LangGraph)   │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │  Application (103 Use Cases, 33 DTOs)   │    │    │
│  │  │  ┌─────────────────────────────────┐    │    │    │
│  │  │  │  Domain (37 Entities, 84 VOs)   │    │    │    │
│  │  │  │  34 Port Interfaces             │    │    │    │
│  │  │  └─────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 아키텍처 불변식 (Integration Test로 강제)

1. **의존성 규칙**: Domain → Application → Infrastructure → Presentation (역방향 금지)
2. **파일 크기 제한**: 프로덕션 파일 300줄 초과 금지
3. **Domain 순수성**: Domain에 외부 라이브러리 import 금지

### 디렉토리 구조

```
src/
├── domain/                         # 순수 비즈니스 로직
│   ├── entities/         (37개)    # 비즈니스 엔티티
│   ├── value-objects/    (84개)    # 불변 값 객체
│   ├── interfaces/       (34개)    # 포트 인터페이스
│   ├── services/         (2개)     # 도메인 서비스
│   ├── events/           (1개)     # 도메인 이벤트
│   └── errors/           (1개)     # 도메인 에러 (35 클래스)
│
├── application/                    # 유스케이스 & 오케스트레이션
│   ├── use-cases/       (104개)    # 애플리케이션 비즈니스 규칙
│   ├── dtos/            (33개)     # 데이터 전송 객체
│   └── services/        (1개)      # 애플리케이션 서비스
│
├── infrastructure/                 # 외부 시스템 어댑터
│   ├── config/          (9개)      # DI 컨테이너, 환경변수
│   ├── persistence/     (25개)     # Supabase/InMemory 리포지토리
│   ├── external/        (25개)     # LLM, PII, 베이스라인 어댑터
│   └── agent/           (2개)      # LangGraph 대화 에이전트
│
└── app/                            # Next.js App Router
    ├── (funnel)/                   # 사전 인증 흐름
    ├── (main)/                     # 인증 후 메인 앱
    ├── (immersive)/                # 전체화면 실시간
    ├── _shared/                    # 공유 컴포넌트, 훅
    └── api/             (43개)     # API 라우트

test/
├── integration/         (4개)      # 아키텍처/흐름 통합 테스트
└── e2e/                 (30개)     # Playwright E2E 테스트
```

---

## 5. Domain Layer 상세

### 5.1 엔티티 (37개)

#### 사용자 & 입장

| 엔티티 | 설명 | 핵심 로직 |
|--------|------|----------|
| `UserProfile` | 사용자 프로필 | 별명, 세션 ID 관리 |
| `StanceVector` | 6차원 입장 좌표 | 코사인 거리 계산, 차원별 스코어 |
| `StanceCalculator` | 입장 계산기 | 답변→벡터 변환, LLM 축 0.3 가중 병합 |
| `StanceDrift` | 입장 변화 추적 | 시간에 따른 벡터 변화 기록 |
| `Answer` | 질문 답변 | OX/RUBRIC/OPEN_ENDED 타입 지원 |
| `Question` | 온보딩 질문 | 질문 메타데이터 |
| `QuestionBank` | 정적 질문 풀 | 고정 질문 세트 |
| `DynamicQuestionBank` | 동적 질문 풀 | 시드 질문 + LLM 생성 배치, 차원 커버리지 추적 |

#### 대화 시스템

| 엔티티 | 설명 | 핵심 로직 |
|--------|------|----------|
| `DialogueSession` | 대화 세션 | **6단계 FSM**: AFFIRMATION→POSITION→QUESTION→ANSWER→REFLECTION→JOINT_SUMMARY; 참여자 규칙, 중복 방지, 24h 리마인더/48h 만료; `topic` 필드로 대화 주제 저장 |
| `DialogueTurn` | 대화 턴 | 단계 내 개별 발언 |
| `DialogueFeedback` | 대화 피드백 | Feel Heard Score + Affective Warmth |
| `JointSummary` | 공동 요약 | 대화 종료 시 생성 |
| `JointSummaryCard` | 요약 카드 | 공동 요약의 카드 표현 |
| `SummaryCard` | 개인 요약 카드 | 개인별 대화 요약 |
| `UnderstandingScore` | 이해도 점수 | 상대 이해 수준 측정 |
| `Highlight` | 텍스트 하이라이트 | 대화 중 생성된 강조 |

#### 매칭

| 엔티티 | 설명 | 핵심 로직 |
|--------|------|----------|
| `MatchCandidate` | 매칭 후보 | 잠재적 대화 파트너 |
| `MatchProposal` | 매칭 제안 | PENDING/ACCEPTED/REJECTED/EXPIRED 생명주기 |
| `ThoughtMap` | 사고 지도 | 별명 + 비교 뷰 |
| `PersonaProfile` | AI 페르소나 | 이름, 연령대, 직업, 입장 벡터, 대화 스타일, 경험 뱅크 |
| `SavedPersona` | 저장된 페르소나 | 사용자가 저장한 AI 페르소나 |

#### 관계 시스템

| 엔티티 | 설명 | 핵심 로직 |
|--------|------|----------|
| `FriendRequest` | 친구 요청 | PENDING/ACCEPTED/REJECTED 상태 |
| `Friendship` | 친구 관계 | 대화 횟수, 라이트 프로토콜 추적; `isRealtimeEligible()` = ACTIVE && 대화≥2 && 프로토콜≥1 |
| `DisclosureSetting` | 공개 수준 | 1~5 레벨 (증가만 가능) |
| `ChatMessage` | 실시간 채팅 | 메시지 엔티티 |
| `LightProtocolSession` | 경량 프로토콜 | COMMON_GROUND / JOINT_QUESTION / SWITCH_SIDES |
| `OfflineMeeting` | 오프라인 모임 | 대면 모임 제안 |

#### 안전 & 분석

| 엔티티 | 설명 | 핵심 로직 |
|--------|------|----------|
| `SafetyReport` | 안전 신고 | 사용자 제출 안전 보고 |
| `FollowUpCheckin` | 후속 체크인 | D+7 재측정 |
| `TuringGuess` | 튜링 테스트 | 인간 vs AI 추측 |
| `PerspectivePassport` | 관점 여권 | 여정 마일스톤 배지 |
| `RecoveryRoutine` | 복구 루틴 | 나쁜 경험 후 복구 절차 |
| `ReflectionFlow` | 성찰 흐름 | 리플렉션 단계 관리 |
| `ReflectionQuiz` | 성찰 퀴즈 | 리플렉션 내 퀴즈 |
| `PeakEndFlow` | 피크엔드 흐름 | 피크엔드 경험 플로우 |
| `ShareCard` | 공유 카드 | 공유 가능한 카드 |
| `AbExperiment` | A/B 실험 | 실험 변형 추적 |

### 5.2 값 객체 (84개)

#### 입장 관련 (8개)
| VO | 설명 |
|----|------|
| `StanceAxis` | −1.0~+1.0, 소수점 3자리 정밀도 |
| `StanceDimension` | 6축: TECH_REGULATION, REDISTRIBUTION, WORK_LIFE, MERITOCRACY, TECH_OPTIMISM, OPPORTUNITY_EQUALITY (한국어 라벨 + 양극 정의) |
| `ConfidenceLevel` | LOW / MEDIUM / HIGH |
| `ConfidenceMap` | 차원별 신뢰도 매핑 |
| `QuestionType` | OX / RUBRIC / OPEN_ENDED |
| `QuestionItem` | 질문 항목 |
| `QuestionPrecision` | LITE(10q) / STANDARD(20q) / DEEP(30q) / COMPREHENSIVE(50q) |
| `GeneratedQuestion` | LLM 생성 질문 |

#### 온보딩 관련 (6개)
| VO | 설명 |
|----|------|
| `OnboardingMode` | 온보딩 모드 |
| `PrecisionScore` | 정밀도 점수 |
| `SelfAffirmation` | 자기 긍정 |
| `CoreValue` | 8대 핵심 가치: FAIRNESS/FREEDOM/CARING/ACHIEVEMENT/SAFETY/TRUTH/RESPONSIBILITY/GROWTH |
| `MisperceptionResult` | 오인 편향 결과 |
| `ThoughtMapAlias` | 사고 지도 별명 |

#### 대화 FSM (6개)
| VO | 설명 |
|----|------|
| `DialogueStep` | AFFIRMATION→POSITION→QUESTION→ANSWER→REFLECTION→JOINT_SUMMARY; `nextStep()`, `isFinalStep()`, `getStepsForEffort()` |
| `SessionStatus` | 세션 상태 |
| `PersonalContext` | 개인 맥락 |
| `ReflectionItem` | 성찰 항목 |
| `ToneSuggestion` | 톤 제안 |
| `ScaffoldTemplate` | 스캐폴드 템플릿 |

#### 대화 UX (16개)
| VO | 설명 |
|----|------|
| `CoachSuggestion` | 코치 제안 |
| `RoleplaySteelman` | 역할극 스틸맨 |
| `HighlightCount` | 하이라이트 수 |
| `MutualVerification` | 상호 검증 |
| `GiftMessage` | 선물 메시지 |
| `BlindSpotDiscovery` | 사각지대 발견 |
| `CommonGroundDiscovery` | 공통 기반 발견 |
| `NextQuestionSave` | 다음 질문 저장 |
| `DialogueReplayCard` | 대화 리플레이 카드 |
| `MapType` | 맵 유형 |
| `TextSegment` | 텍스트 세그먼트 |
| `ConversationTrailer` | 대화 트레일러 |
| `PeakEndKpi` | 피크엔드 KPI |
| `PeakEndStep` | 피크엔드 단계 |
| `ReviewResponse` | 리뷰 응답 |
| `ShareCardType` | 공유 카드 유형 |

#### 매칭 관련 (12개)
| VO | 설명 |
|----|------|
| `OpinionDistance` | 의견 거리 |
| `OpinionDistanceLabel` | 거리 라벨 |
| `DistanceBand` | 거리 밴드 |
| `TopicLevel` | 주제 수준 |
| `EffortGrade` | QUICK / STRUCTURED / DEEP |
| `MatchScore` | 매칭 점수 |
| `ReadinessScore` | 준비도 점수 |
| `DeclineReason` | 거절 사유 |
| `PersonaResponseDelay` | 페르소나 응답 지연 |
| `AnchorType` + `AnchorAttribute` | 앵커 기준 매칭 |
| `AdjustmentBadge` | 조정 배지 |

#### 피드백 & 안전 (10개)
| VO | 설명 |
|----|------|
| `ReceptivenessScore` | 수용성 점수 |
| `ReceptivenessTemplate` | 수용성 템플릿 |
| `FatigueScore` | 피로도 점수 |
| `CooldownMode` | 쿨다운 모드 |
| `MetricTier` | 지표 등급 |
| `BadExperienceDetector` | 나쁜 경험 감지 |
| `AntiAbusePolicy` | 악용 방지 정책 |
| `InterventionPolicy` + `InterventionAction` | 개입 정책 |
| `SafetyReason` + `SafetyReportStatus` + `SafetyCheckinStatus` | 안전 관련 상태 |

#### 관계 관련 (6개)
`FriendRequestStatus`, `FriendshipStatus`, `DisclosureLevel`, `RelationshipEventType`, `LightProtocolType`, `MeetingStatus`, `ProposalStatus`

#### 사용자 여정 (8개)
`HomeState`, `JourneyProgress`, `PassportBadge`, `NextStepAction`, `FinalCtaType`, `ContextualRecommendation`, `DifferenceLevel`, `EnergyLevel`

#### 시스템 (12개)
`FeatureFlag`, `JitaiRule`, `JitaiSignal`, `NotificationTemplate`, `Microcopy`, `RecoveryAction`, `RecoveryPromise`, `TuringReward`, `Microcopy`

### 5.3 도메인 인터페이스 (포트) — 34개

#### 리포지토리 포트 (19개)

```
UserRepository, StanceRepository, MatchRepository,
DialogueRepository, FeedbackRepository, FriendRepository,
FriendshipRepository, DisclosureRepository, BlockRepository,
SafetyRepository, MessageRepository, ReceiptRepository,
MeetingRepository, ReceptivenessRepository, FollowUpCheckinRepository,
LightProtocolRepository, PersonaRepository, SavedPersonaRepository,
TuringGuessRepository
```

#### 서비스 포트 (15개)

| 포트 | 역할 |
|------|------|
| `PiiScrubber` | PII 스크러빙 + 유형 감지 |
| `LlmStanceExtractor` | 주관식 답변에서 입장 축 + 추론 + 준비도 추출 |
| `Facilitator` | 톤 체크, 드리프트 감지, 수용성 템플릿 제안, 수용적 표현 감지 |
| `SummaryGenerator` | 대화 요약 생성 |
| `TrailerGenerator` | 대화 트레일러 생성 |
| `QuestionGenerator` | 동적 질문 배치 생성 |
| `ValueExtractor` | 텍스트에서 핵심 가치 추출 |
| `BaselineProvider` | KGSS 인구 베이스라인 데이터 |
| `TextSegmenter` | 한국어 텍스트 분절 |
| `RealtimeBroadcaster` | Supabase Realtime 이벤트 |
| `RateLimiter` | 요청 속도 제한 |
| `EventTracker` + `EventEmitter` | 이벤트 추적/발행 |
| `PersonaDialogueGenerator` | AI 페르소나 응답 생성 |
| `DialogueAgent` | LangGraph 대화 에이전트 |

### 5.4 도메인 서비스 (2개)

| 서비스 | 역할 |
|--------|------|
| `DialogueLimit` | 일일 대화 한도 확인: MAX_DAILY=2, 잔여 횟수 + CooldownMode 반환 |
| `DistanceSafetyPackage` | 안전 거리 밴드 계산 |

### 5.5 도메인 에러 (35개 클래스)

`DomainError` 기반 클래스: 입장 검증, 대화 FSM 위반, 매칭, 친구, 공개, 안전, 속도 제한, 온보딩 티어, 질문 생성 관련 에러

### 5.6 도메인 이벤트

`AnalyticsEventType` — 3개 단계(온보딩, 대화, 관계)에 걸친 **70+ 이벤트 타입** 정의. 팩토리 함수 `createAnalyticsEvent()`.

---

## 6. Application Layer 상세

### 6.1 유스케이스 (104개)

#### 온보딩 / 입장 (11개)

| 유스케이스 | 역할 |
|-----------|------|
| `ExtractStanceUseCase` | 주관식 답변에서 LLM으로 입장 추출 |
| `SubmitAnswerUseCase` | 답변 제출 처리 |
| `SubmitConfidenceUseCase` | 신뢰도 제출 |
| `SubmitSelfAffirmationUseCase` | 자기긍정 제출 |
| `SelectOnboardingModeUseCase` | 온보딩 모드 선택 |
| `StartDynamicOnboardingUseCase` | 동적 온보딩 시작 |
| `GenerateNextBatchUseCase` | 다음 질문 배치 생성 |
| `CalculateMisperceptionUseCase` | 오인 편향 계산 |
| `CalculatePrecisionUseCase` | 정밀도 계산 |
| `ChangePrecisionMidwayUseCase` | 도중 정밀도 변경 |
| `CheckRetakeLimitUseCase` | 재시도 제한 확인 |

#### 매칭 (10개)

| 유스케이스 | 역할 |
|-----------|------|
| `FindMatchCandidatesUseCase` | 매칭 후보 검색 |
| `CreateMatchProposalUseCase` | 매칭 제안 생성 |
| `RespondToProposalUseCase` | 제안 응답 |
| `AdaptiveMatchingUseCase` | 적응형 매칭 |
| `ApplyAnchorFilterUseCase` | 앵커 필터 적용 |
| `CheckMatchingPoolUseCase` | 매칭 풀 확인 |
| `SelectPersonaUseCase` | AI 페르소나 선택 |
| `SelectEnergyLevelUseCase` | 에너지 수준 선택 |
| `RecordDeclineReasonUseCase` | 거절 사유 기록 |
| `BuildMatchCardUseCase` | 매칭 카드 구성 |

#### 대화 (33개)

| 유스케이스 | 역할 |
|-----------|------|
| `SubmitDialogueTurnUseCase` | 대화 턴 제출 |
| `SubmitAgentDialogueTurnUseCase` | 에이전트 대화 턴 제출 |
| `CreateAgentDialogueSessionUseCase` | 에이전트 대화 세션 생성 |
| `GetDialogueSessionUseCase` | 대화 세션 조회 |
| `CheckExpiredSessionsUseCase` | 만료 세션 확인 |
| `CheckToneUseCase` | 톤 확인 |
| `ApplyDownshiftUseCase` | 다운시프트 적용 |
| `GenerateSummaryCardUseCase` | 요약 카드 생성 |
| `GenerateJointSummaryUseCase` | 공동 요약 생성 |
| `BuildJointSummaryCardUseCase` | 공동 요약 카드 구성 |
| `SubmitReflectionUseCase` | 성찰 제출 |
| `GenerateReflectionQuizUseCase` | 성찰 퀴즈 생성 |
| `SubmitQuizAnswerUseCase` | 퀴즈 답변 제출 |
| `SubmitRoleplaySteelmanUseCase` | 역할극 스틸맨 제출 |
| `CollectPeakEndKpiUseCase` | 피크엔드 KPI 수집 |
| `SubmitMutualVerificationUseCase` | 상호 검증 제출 |
| `SubmitFeedbackUseCase` | 피드백 제출 |
| `ExcludeDialogueFromRecordUseCase` | 대화 기록 제외 |
| `CreateHighlightUseCase` / `CreateHighlightByTapUseCase` | 하이라이트 생성 |
| `GetScaffoldForStepUseCase` | 단계별 스캐폴드 조회 |
| `GetCoachSuggestionsUseCase` | 코치 제안 조회 |
| `HandleThoughtChangeUseCase` | 생각 변화 처리 |
| `GetChatHistoryUseCase` | 채팅 이력 조회 |
| `SegmentTextUseCase` | 텍스트 분절 |
| `EvaluateUnderstandingUseCase` | 이해도 평가 |
| `GenerateThoughtMapUseCase` | 사고 지도 생성 |
| `DetermineNextStepUseCase` | 다음 단계 결정 |
| `GenerateShareCardUseCase` | 공유 카드 생성 |
| `GenerateReplayCardUseCase` | 리플레이 카드 생성 |
| `GenerateConversationTrailerUseCase` | 대화 트레일러 생성 |
| `GetTrailerQualityStatsUseCase` | 트레일러 품질 통계 |

#### 관계 (27개)

| 유스케이스 | 역할 |
|-----------|------|
| `RequestFriendshipUseCase` | 친구 요청 |
| `RespondToFriendRequestUseCase` | 친구 요청 응답 |
| `ListFriendsUseCase` | 친구 목록 |
| `UnfriendUseCase` | 친구 해제 |
| `BlockUserUseCase` / `UnblockUserUseCase` | 차단/해제 |
| `UpdateDisclosureLevelUseCase` | 공개 수준 업데이트 |
| `GetDisclosureLevelsUseCase` | 공개 수준 조회 |
| `SendChatMessageUseCase` | 채팅 메시지 전송 |
| `MarkMessagesReadUseCase` | 읽음 표시 |
| `CheckRealtimeEligibilityUseCase` | 실시간 자격 확인 |
| `StartLightProtocolUseCase` | 라이트 프로토콜 시작 |
| `SubmitLightProtocolUseCase` | 라이트 프로토콜 제출 |
| `SubmitFollowUpCheckinUseCase` | 후속 체크인 제출 |
| `ScheduleFollowUpUseCase` | 후속 체크인 예약 |
| `CreateOfflineProposalUseCase` | 오프라인 제안 생성 |
| `RespondToOfflineProposalUseCase` | 오프라인 제안 응답 |
| `SubmitSafetyCheckinUseCase` | 안전 체크인 제출 |
| `SaveCommonGroundUseCase` | 공통 기반 저장 |
| `SaveNextQuestionUseCase` | 다음 질문 저장 |
| `WriteGiftMessageUseCase` / `RevealGiftMessageUseCase` | 선물 메시지 작성/공개 |
| `ExtractBlindSpotUseCase` | 사각지대 추출 |
| `GeneratePersonaResponseUseCase` | 페르소나 응답 생성 |
| `ResumePersonaConversationUseCase` | 페르소나 대화 재개 |
| `SavePersonaUseCase` | 페르소나 저장 |
| `SubmitTuringGuessUseCase` | 튜링 추측 제출 |
| `GetTuringStatsUseCase` | 튜링 통계 조회 |
| `UpdatePerspectivePassportUseCase` | 관점 여권 업데이트 |

#### 안전 & 분석 (23개)

| 유스케이스 | 역할 |
|-----------|------|
| `SubmitSafetyReportUseCase` | 안전 신고 제출 |
| `DetectBadExperienceUseCase` | 나쁜 경험 감지 |
| `ApplyRecoveryRoutineUseCase` | 복구 루틴 적용 |
| `CalculateFatigueUseCase` | 피로도 계산 |
| `EnforceDailyLimitUseCase` | 일일 한도 강제 |
| `EvaluateJitaiRulesUseCase` | JITAI 규칙 평가 |
| `DetermineReflectionPolicyUseCase` | 리플렉션 정책 결정 |
| `CalculateStanceDriftUseCase` | 입장 드리프트 계산 |
| `SendDriftNotificationUseCase` | 드리프트 알림 발송 |
| `ManageDriftPreferenceUseCase` | 드리프트 선호 관리 |
| `TrackEventUseCase` | 이벤트 추적 |
| `GetExperimentVariantUseCase` | 실험 변형 조회 |
| `CheckFeatureFlagUseCase` | 피처 플래그 확인 |
| `ClaimSessionUseCase` | 세션 클레임 (익명→인증) |
| `SuggestReceptivenessTemplateUseCase` | 수용성 템플릿 제안 |
| `UpdateReceptivenessUseCase` | 수용성 업데이트 |
| `GetMicrocopyForContextUseCase` | 맥락별 마이크로카피 |
| `GetContextualRecommendationsUseCase` | 맥락별 추천 |
| `DetermineHomeStateUseCase` | 홈 상태 결정 |
| `ManageNotificationPreferenceUseCase` | 알림 선호 관리 |
| `RequestNotificationPermissionUseCase` | 알림 권한 요청 |
| `BuildNotificationUseCase` | 알림 구성 |
| `GetExperimentVariantUseCase` | 실험 변형 조회 |

### 6.2 DTO (33개)

입출력 데이터 경계 객체: auth, chat, confidence, dialogue (input + output — `DialogueSessionOutput`에 `topic` 필드 포함), disclosure, feedback, friend, joint-summary, light-protocol, match (input + output), meeting, misperception, reflection, safety, self-affirmation, stance-result, submit-answer, thought-map 등.

### 6.3 애플리케이션 서비스 (1개)

| 서비스 | 역할 |
|--------|------|
| `OnboardingSession` | 단계 전이 관리 (warmup → core → initial_result → extended → complete), 답변 누적, 정밀도 상태 |

---

## 7. Infrastructure Layer 상세

### 7.1 DI 컨테이너 (`src/infrastructure/config/`)

| 파일 | 역할 |
|------|------|
| `di-container.ts` | 싱글톤 `getContainer()` / `resetContainer()` (HMR 대응) |
| `container-core.ts` (248줄) | 26개 리포지토리 + 서비스 어댑터 배선; OpenAI API 키 부재 시 Fallback으로 전환 |
| `container-usecases-core.ts` (219줄) | ~60개 핵심 유스케이스 인스턴스화 |
| `container-usecases-extended.ts` (142줄) | ~43개 확장 유스케이스 인스턴스화 |
| `container-usecases.ts` | core + extended 병합 |
| `env.ts` | 환경변수 접근 |
| `auth-session.ts` / `anonymous-session.ts` | 세션 헬퍼 |

### 7.2 Supabase 리포지토리 (19개)

도메인 인터페이스를 구현하는 Supabase 기반 영속성 어댑터:

```
SupabaseStanceRepository, SupabaseMatchRepository,
SupabaseDialogueRepository, SupabaseFeedbackRepository,
SupabaseUserRepository, SupabaseFriendRepository,
SupabaseFriendshipRepository, SupabaseDisclosureRepository,
SupabaseBlockRepository, SupabaseSafetyRepository,
SupabaseMessageRepository, SupabaseReceiptRepository,
SupabaseMeetingRepository, SupabaseEventRepository,
SupabaseLightProtocolRepository, SupabaseReceptivenessRepository,
SupabaseFollowUpRepository, SupabaseTuringGuessRepository,
SupabaseSavedPersonaRepository
```

### 7.3 인메모리 리포지토리 (3개)

세션 범위 데이터용:
`InMemoryPersonaRepository`, `InMemorySavedPersonaRepository`, `InMemoryTuringGuessRepository`

### 7.4 LLM 어댑터 (모두 Fallback 포함)

| 어댑터 | Fallback | 역할 |
|--------|----------|------|
| `OpenAiStanceExtractor` | 정적 벡터 반환 | 주관식 답변에서 입장 축 추출 |
| `OpenAiFacilitator` | `FallbackFacilitator` | 톤 체크, 드리프트 감지, 수용성 |
| `OpenAiSummaryGenerator` | `FallbackSummaryGenerator` | 대화 요약 생성 |
| `OpenAiTrailerGenerator` | `FallbackTrailerGenerator` | 대화 트레일러 생성 |
| `OpenAiQuestionGenerator` | `FallbackQuestionGenerator` | 동적 질문 배치 생성; 모델명 환경변수화(`OPENAI_MODEL`), 풀 고갈 방어 로직 포함 |
| `OpenAIValueExtractor` | `FallbackValueExtractor` | 핵심 가치 추출 |
| `OpenAiPersonaGenerator` | `PersonaLlmAdapter` | AI 페르소나 응답 생성 |

### 7.5 기타 외부 어댑터

| 어댑터 | 역할 |
|--------|------|
| `RegexPiiScrubber` | 한국어 PII 패턴 (주민번호, 전화번호, 이메일, URL, 카드/계좌번호) |
| `KgssBaselineProvider` | 한국종합사회조사 인구 베이스라인 |
| `DemographicBaselineProvider` | 인구통계 베이스라인 비교 |
| `KoreanTextSegmenter` | 한국어 텍스트 분절 |
| `SupabaseRealtimeBroadcaster` | Supabase 채널 실시간 이벤트 |
| `InMemoryRateLimiter` | 인프로세스 속도 제한 |
| `InMemoryEventEmitter` | 도메인 이벤트 발행 |
| `MicroCheckinScheduler` | 20분 주기 체크인 스케줄링 |
| `LangSmithTracer` | LangSmith 트레이싱 |
| `LlmEvaluator` | LLM 기반 평가 지표 |

### 7.6 프롬프트 템플릿

| 파일 | 용도 |
|------|------|
| `facilitator-prompts.ts` | 톤/드리프트/수용성 프롬프트 |
| `facilitator-safety.ts` | 안전 프롬프트 |
| `stance-extraction-prompt.ts` | 입장 추출 프롬프트 |
| `summary-prompts.ts` | 요약 생성 프롬프트 |
| `trailer-prompts.ts` | 트레일러 생성 프롬프트 |
| `question-generation-prompts.ts` | 동적 질문 생성 프롬프트 |
| `persona-prompts.ts` | 페르소나 응답 프롬프트 |

### 7.7 LangGraph 에이전트

| 파일 | 역할 |
|------|------|
| `dialogue-agent-graph.ts` | `LangGraphDialogueAgent`: StateGraph — evaluate → route → [facilitate \| coach \| toneCheck \| scaffold \| passthrough] → end; `InterventionPolicy` 기반 행동 결정; 한국어 프롬프트 |
| `agent-state.ts` | `DialogueAgentState` Zod 스키마 |

### 7.8 정적 데이터

| 파일 | 내용 |
|------|------|
| `questions.json` | 기본 온보딩 질문 10개 |
| `expanded-questions.json` | 확장 질문 풀 30개 |
| `kgss-baseline.json` | KGSS 인구 베이스라인 |
| `demographic-baseline.json` | 인구통계 분석 베이스라인 |

### 7.9 데이터베이스 마이그레이션

| 마이그레이션 | 내용 |
|-------------|------|
| `001-stance-discovery.sql` | `stance_profiles` 테이블 (6 float 컬럼 + RLS) |
| `002-phase2-dialogue.sql` | 대화 세션 + 턴 + 피드백 테이블 |
| `003-phase3-relationship.sql` | 친구 요청, 친구 관계, 메시지, 모임 테이블 |
| `004-phase3-metrics-views.sql` | 분석 뷰 |
| `005-add-profile-extras.sql` | 프로필 확장 컬럼 |
| `006-seed-30-users.sql` | 30명 시드 사용자 |
| `006-v4-persistence.sql` | v4 영속성 |
| `007-fix-dialogue-step-constraint.sql` | 대화 단계 제약조건 수정 |
| `008-fix-dialogue-turns-step-constraint.sql` | 턴 제약조건 수정 |
| `009-add-demographic-columns.sql` | 인구통계 컬럼 추가 |
| `010-add-demographic-columns.sql` | 인구통계 컬럼 추가 (리넘버링) |
| `011-add-dialogue-topic.sql` | `dialogue_sessions` 테이블에 `topic` 컬럼 추가 |

---

## 8. Presentation Layer 상세

### 8.1 라우트 그룹

#### (funnel) — 사전 인증 흐름

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/auth/login` | 로그인 | OAuth: Google, Kakao, Apple |
| `/auth/callback` | 콜백 | OAuth 콜백 처리 |
| `/onboarding` | 온보딩 | `OnboardingFlow` 또는 `DynamicOnboardingFlow` |
| `/onboarding/result` | 결과 | 입장 결과 + 사고 지도 + 공유 카드; localStorage(`ps-thought-map`) 캐싱으로 재접근 가능 |

#### (main) — 인증 후 메인 앱

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 홈 | `HomeStateView` — 동적 상태 기반 홈 |
| `/matching` | 매칭 | 후보 목록 + AI 페르소나 선택 + 에너지/앵커 필터; 입장 기반 매칭 설명 카피 포함 |
| `/dialogue` | 대화 목록 | 세션 리스트 |
| `/dialogue/[id]` | 대화 상세 | 턴별 인터페이스, 에이전트 타이핑, 톤/드리프트 경고, 주제 배지 표시 |
| `/dialogue/[id]/feedback` | 피드백 | 대화 후 피드백 폼 |
| `/dialogue/[id]/summary` | 요약 | 세션 요약 카드 |
| `/friends` | 친구 목록 | 친구 리스트 |
| `/friends/[id]` | 친구 상세 | 라이트 프로토콜, 공동 질문, 공통 기반, 실시간 채팅 |
| `/passport` | 관점 여권 | 배지 그리드, 발견 카드, 저장된 페르소나, "내 사고 지도" 섹션 |
| `/offline` | 오프라인 모임 | 모임 목록 |
| `/offline/[id]` | 모임 상세 | 개별 모임 |
| `/settings` | 설정 | 알림, 데이터 관리 |
| `/settings/notifications` | 알림 설정 | 푸시 알림 선호 |
| `/settings/data-management` | 데이터 관리 | 데이터 내보내기/삭제 |
| `/safety/report` | 안전 신고 | 안전 보고 제출 |
| `/types/[slug]` | 입장 유형 | 입장 유형 상세 |

#### (immersive) — 전체화면 실시간

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/chat/[friendshipId]` | 실시간 채팅 | 채팅방 + 마이크로 체크인 프롬프트 |

### 8.2 주요 컴포넌트

#### 공유 UI 컴포넌트 (`_shared/`)

| 컴포넌트 | 설명 |
|---------|------|
| `PrimaryButton` | Framer Motion 애니메이션 CTA (그라데이션, pill/card 반경, 로딩 스피너) |
| `SecondaryButton` | 아웃라인 버튼 변형 |
| `PaperCard` | 핵심 카드 컨테이너 (종이 메타포) |
| `AppBackground` | 페이지 배경 레이어 |
| `AppHeader` / `TopAppBar` | 네비게이션 헤더 |
| `BottomTabBar` | 메인 네비게이션 탭 |
| `AnimatedList` | 모션 리스트 컨테이너 |
| `MicrocopyBanner` | 맥락적 카피 배너 |
| `PageTransition` | 페이지 전환 래퍼 |
| `Skeleton` | 로딩 스켈레톤 |
| `InstallPrompt` | PWA 설치 프롬프트 |
| `ServiceWorkerRegister` | SW 등록 |

#### 온보딩 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `OnboardingFlow` | 정적 온보딩 (고정 질문) |
| `DynamicOnboardingFlow` | 동적 온보딩 (LLM 생성 배치); 정밀도 변경 시 기존 답변 보존 |
| `useBatchLoader` | 잔여 3문항 시 다음 배치 프리페치 |
| `BatchLoadingIndicator` | 배치 로딩 UI; 에러 시 "기본 질문으로 계속하기" Fallback 제공 |
| `OnboardingQuestionRenderer` | OX/Rubric/OpenEnded 라우팅; `key` prop으로 질문 간 상태 초기화 보장 |
| `OxQuestion` / `RubricQuestion` / `OpenEndedQuestion` | 질문 유형별 렌더러 |
| `PrecisionSelector` / `PrecisionGauge` | 정밀도 선택기 |
| `SelfAffirmationStep` | 자기긍정 웜업 |
| `DemographicStep` / `EmailStep` | 데이터 수집 |
| `ProgressBar` | 진행 표시기 |
| `ThoughtMapChart` / `ThoughtMapResult` | 사고 지도 시각화 |
| `PercentileDisplay` | 백분위 표시 |
| `MisperceptionCard` | 오인 편향 교정 카드 |
| `ShareCardPreview` | 공유 카드 미리보기 (결과 페이지에 직접 노출) |

#### 대화 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `TurnSubmissionForm` | 메시지 입력 폼; POSITION 단계에서 대화 주제(`topic`) 표시 |
| `TurnDisplay` | 현재 단계 전체 턴 렌더링 |
| `WaitingForOpponent` | 상대 대기 UI |
| `FacilitatorWarning` | 톤/드리프트 경고 |
| `StepIndicator` | FSM 단계 진행 표시 |
| `TypingIndicator` | 에이전트 타이핑 |
| `CoachBottomSheet` | 코치 제안 바텀시트 |
| `ScaffoldSwiper` / `ScaffoldPlaceholder` | 스캐폴드 스와이퍼 |
| `ToneCheckPanel` / `ToneSuggestionCard` | 톤 확인 패널 |
| `ReflectionForm` / `ReflectionProgressHeader` | 성찰 폼 |
| `ReflectionQuizCard` | 성찰 퀴즈 카드 |
| `RoleplaySteelmanCard` | 역할극 스틸맨 |
| `PeakEndFlow` / `PeakEndKPISliders` | 피크엔드 플로우 |
| `JointSummaryCard` / `JointSummaryCardView` | 공동 요약 카드 |
| `HighlightPopup` / `TapHighlight` | 하이라이트 |
| `FeelHeardSlider` / `AffectiveWarmthSlider` | 피드백 슬라이더 |
| `MutualVerificationSlider` | 상호 검증 |
| `ReceptivenessNudge` / `ReceptivenessTemplateList` | 수용성 넛지 |
| `RecoveryRoutinePanel` | 복구 루틴 |
| `TuringTestPanel` | 튜링 테스트 |
| `GiftMessageInput` / `GiftRevealCard` | 선물 메시지 |
| `BlindSpotCard` / `CommonGroundCard` | 사각지대/공통기반 |
| `NextQuestionInput` | 다음 질문 입력 |
| `FollowUpReviewCard` | 후속 리뷰 카드 |

#### 매칭 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `IntegratedMatchCard` | 통합 매칭 카드 |
| `MatchCardV3` | v3 매칭 카드 |
| `EnergyReactiveMatchCard` | 에너지 반응형 카드 |
| `CandidateList` | 후보 리스트 |
| `PersonaSelector` | AI 페르소나 선택 |
| `EnergySelector` | 에너지 수준 선택 |
| `AnchorFilterPanel` | 앵커 필터 |
| `ProposalCard` | 제안 카드 |
| `DeclineBadge` / `DeclineReasonModal` | 거절 배지/사유 |
| `AiDisclaimerBanner` | AI 면책 배너 |
| `DailyLimitNotice` | 일일 한도 안내 |
| `EffortGradeSelector` / `TopicLevelSelector` | 노력도/주제 수준 선택 |

### 8.3 공유 훅

| 훅 | 역할 |
|----|------|
| `useAnonymousSession` | localStorage `ps-session-id`에서 UUID 세션 생성/조회 |
| `useAuth` | Supabase 인증 상태 |
| `useInactivityTimer` | 사용자 비활성 감지 |
| `useRealtimeChat` | Supabase Realtime 채팅 구독 |

### 8.4 프로바이더

| 프로바이더 | 역할 |
|-----------|------|
| `AuthProvider` | Supabase 인증 컨텍스트 |
| `motion.ts` | Framer Motion 스프링 설정 (`springSnappy` 등) |
| `api-client.ts` | `apiGet` / `apiPost` fetch 헬퍼 |

---

## 9. API Routes 전체 목록 (43개)

### 인증 (4개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/callback` | OAuth 콜백 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/claim-session` | 세션 클레임 |

### 온보딩 (6개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/onboarding/answer` | 답변 제출 |
| POST | `/api/onboarding/confidence` | 신뢰도 제출 |
| POST | `/api/onboarding/misperception` | 오인 계산 |
| POST | `/api/onboarding/next-batch` | 다음 질문 배치 |
| GET | `/api/onboarding/result` | 결과 조회 |
| POST | `/api/onboarding/self-affirmation` | 자기긍정 제출 |

### 대화 (8개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| GET/POST | `/api/dialogue/sessions` | 세션 목록/생성 |
| GET | `/api/dialogue/sessions/[id]` | 세션 조회 |
| POST | `/api/dialogue/sessions/[id]/turns` | 턴 제출 |
| GET | `/api/dialogue/sessions/[id]/summary` | 요약 조회 |
| POST | `/api/dialogue/sessions/[id]/reflection` | 성찰 제출 |
| POST | `/api/dialogue/sessions/[id]/joint-summary` | 공동 요약 |
| POST | `/api/dialogue/sessions/[id]/feedback` | 피드백 제출 |

### 매칭 (4개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/matching/candidates` | 후보 조회 |
| GET | `/api/matching/personas` | 페르소나 조회 |
| POST | `/api/matching/proposals` | 제안 생성 |
| POST | `/api/matching/proposals/[id]/respond` | 제안 응답 |

### 채팅 (4개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/chat/[friendshipId]/messages` | 메시지 조회 |
| POST | `/api/chat/[friendshipId]/messages` | 메시지 전송 |
| POST | `/api/chat/[friendshipId]/read` | 읽음 표시 |
| GET | `/api/chat/[friendshipId]/eligibility` | 자격 확인 |

### 관계 (8개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/relationship/friend-request` | 친구 요청 |
| POST | `/api/relationship/friend-request/[id]/respond` | 요청 응답 |
| GET | `/api/relationship/friends` | 친구 목록 |
| GET/DELETE | `/api/relationship/friends/[id]` | 친구 조회/삭제 |
| POST/DELETE | `/api/relationship/block` | 차단/해제 |
| GET/PUT | `/api/relationship/disclosure` | 공개 수준 조회/변경 |

### 라이트 프로토콜 (3개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/light-protocol` | 프로토콜 시작 |
| GET | `/api/light-protocol/[id]` | 프로토콜 조회 |
| POST | `/api/light-protocol/[id]/submit` | 프로토콜 제출 |

### 후속/오프라인/안전 (6개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/follow-up` | 후속 체크인 |
| POST | `/api/follow-up/[id]` | 체크인 제출 |
| POST | `/api/offline/proposals` | 오프라인 제안 |
| POST | `/api/offline/proposals/[id]/respond` | 제안 응답 |
| POST | `/api/offline/proposals/[id]/checkin` | 체크인 |
| POST | `/api/safety/report` | 안전 신고 |

### 사용자/유틸리티 (4개)
| 메소드 | 경로 | 설명 |
|--------|------|------|
| GET/POST | `/api/receptiveness` | 수용성 조회/제출 |
| GET | `/api/user/fatigue` | 피로도 조회 |
| GET | `/api/user/daily-limit` | 일일 한도 |
| GET | `/api/og-image` | OG 이미지 생성 |

> 모든 API 라우트 패턴: `X-Session-Id` 헤더 → `getContainer()` → 유스케이스 실행 → `NextResponse.json` 반환

---

## 10. 데이터베이스 마이그레이션

총 **11개 마이그레이션** 파일:

| # | 파일 | 생성 테이블/변경 사항 |
|---|------|---------------------|
| 001 | `stance-discovery.sql` | `stance_profiles` (6 float 컬럼, RLS) |
| 002 | `phase2-dialogue.sql` | `dialogue_sessions`, `dialogue_turns`, `dialogue_feedback` |
| 003 | `phase3-relationship.sql` | `friend_requests`, `friendships`, `messages`, `offline_meetings` |
| 004 | `phase3-metrics-views.sql` | 분석용 뷰 생성 |
| 005 | `add-profile-extras.sql` | 프로필 추가 컬럼 |
| 006a | `seed-30-users.sql` | 30명 시드 사용자 데이터 |
| 006b | `v4-persistence.sql` | v4 영속성 테이블 |
| 007-008 | `fix-dialogue-*-constraint.sql` | 대화 단계 제약조건 수정 |
| 009 | `add-demographic-columns.sql` | 인구통계 컬럼 추가 |

---

## 11. 테스트 현황

### 11.1 단위/통합 테스트 (Vitest)

| 레이어 | 테스트 파일 수 | 주요 대상 |
|--------|-------------|----------|
| Domain entities | 38 | 모든 엔티티 (1:1 매핑) |
| Domain VOs | 73 | 모든 값 객체 |
| Domain events | 1 | AnalyticsEvent |
| Domain services | 2 | DialogueLimit, DistanceSafety |
| Application use cases | 98 | 유스케이스별 시나리오 |
| Application DTOs | 3 | DTO 검증 |
| Application services | 1 | OnboardingSession |
| Infrastructure config | 1 | DI 컨테이너 |
| Infrastructure external | 17 | LLM 어댑터, PII 스크러빙 |
| Infrastructure persistence | 8 | 리포지토리 구현 |
| Pages/Components | ~100+ | 페이지 렌더링 테스트 |

### 11.2 통합 테스트 (`test/integration/`)

| 테스트 | 검증 내용 |
|--------|----------|
| `architecture-compliance.test.ts` | Domain 외부 import 금지, 레이어 간 의존 방향, 파일 300줄 제한 |
| `dynamic-onboarding-flow.test.ts` | E2E 동적 온보딩 흐름 |
| `stance-discovery-flow.test.ts` | 입장 추출 + 매칭 흐름 |
| `env-validation.test.ts` | 환경변수 검증 |

### 11.3 E2E 테스트 (Playwright, 30 스펙)

| 그룹 | 테스트 | 대상 |
|------|--------|------|
| funnel/ | 랜딩, 로그인(익명/인증), 온보딩 | 사전 인증 흐름 |
| main/ | 대화, 친구, 매칭, 오프라인, 여권, 안전, 설정, 알림 | 메인 기능 |
| immersive/ | 채팅 | 실시간 채팅 |
| navigation/ | 바텀탭, 미들웨어 리다이렉트 | 네비게이션 |
| quality/ | 접근성, 반응형 | 품질 |
| smoke/ | 전체 페이지 렌더링 (익명/인증) | 스모크 테스트 |

### 11.4 현재 실패 테스트 (14개, 기존 미해결)

| 파일 | 실패 수 | 원인 |
|------|--------|------|
| `src/app/page.test.tsx` | 2 | 홈 페이지 CTA/로그인 링크 렌더링 |
| `architecture-compliance.test.ts` | 1 | 300줄 초과 파일 존재 |
| `in-memory-persona-repository.test.ts` | 4 | 시드 페르소나 데이터 불일치 |
| `matching/page.test.tsx` | 3 | 매칭 페이지 통합 테스트 |
| `data-management/page.test.tsx` | 4 | 데이터 관리 페이지 테스트 |

> 사용자 피드백 버그 수정(B1~B8)으로 인한 새로운 실패는 0건. 위 14개는 모두 수정 이전부터 존재하던 이슈.

---

## 12. 버전별 구현 이력

### v1 (Phase 1-3) — 기반 구축

| 단계 | 구현 내용 |
|------|----------|
| Phase 1: Stance Discovery | 온보딩 질문, 입장 벡터 계산, 사고 지도 |
| Phase 2: Structured Dialogue | 대화 세션 FSM, 턴 관리, 피드백 |
| Phase 3: Relationship Escalation | 친구 요청, 친구 관계, 채팅, 오프라인 모임 |

### v2 (P1-P8) — 전체 완료

| 단계 | 구현 내용 | 핵심 산출물 |
|------|----------|-----------|
| **V2-P1** | Self-Affirmation Warmup + Core Value | SelfAffirmation VO, CoreValue VO (8대 가치) |
| **V2-P2** | Stance Profile 확장 (6차원 + Confidence) | ConfidenceMap, StanceDimension 6축 |
| **V2-P3** | Thought Map v2 | 별명 시스템, 오인 편향 교정 카드 |
| **V2-P4** | Adaptive Matching | Distance-Safety Package, Topic Ladder |
| **V2-P5** | Perspective Exchange 구조 개편 | 대화 FSM 6단계, PersonalContext, ReflectionItem |
| **V2-P6** | Feedback 확장 | FeelHeardScore, AffectiveWarmth, 수용성 포인트, D+7 체크인 |
| **V2-P7** | Light Protocol 3종 | COMMON_GROUND/JOINT_QUESTION/SWITCH_SIDES, 실시간 조건, 20분 체크인 |
| **V2-P8** | Analytics & Safety | 피로 감지, 일일 한도(MAX=2), 쿨다운, LLM 평가 지표 |

### v3 Dynamic Questions — 완료

| 구현 내용 |
|----------|
| Feature flag: `NEXT_PUBLIC_DYNAMIC_QUESTIONS=true` |
| 4-tier 정밀도: LITE(10q) → STANDARD(20q) → DEEP(30q) → COMPREHENSIVE(50q) |
| 시드 10문항 고정 → LLM이 5문항 배치 생성 → 차원 커버리지 추적 |
| `DynamicOnboardingFlow`, `useBatchLoader`, `BatchLoadingIndicator` |
| `DynamicQuestionBank` 엔티티, `GeneratedQuestion` VO, `QuestionGenerator` 포트 |
| `OpenAiQuestionGenerator`, `FallbackQuestionGenerator`, `expanded-questions.json` |
| API: `POST /api/onboarding/next-batch` |

### v4 Blueprint — 기획 완료, 구현 진행 중

| 티어 | 피처 수 | 상태 |
|------|--------|------|
| **P0 (Core Loop MVP)** | 12개 | 도메인/유스케이스 구현 완료, UI 컴포넌트 구현 완료 |
| **P1 (Loop Quality)** | 10개 | 도메인/유스케이스 구현 완료, UI 컴포넌트 구현 완료 |
| **P2 (Persistence & Scale)** | 10개 | 도메인/유스케이스 구현 완료, UI 컴포넌트 구현 완료 |

### 사용자 피드백 버그 수정 (2026-02-22) — 완료

사용자 테스트(민정, 서채원, 김태환)에서 발견된 8개 이슈를 5개 Phase로 수정. 상세 계획: `docs/plans/PLAN_user-feedback-bugfix.md`

| 버그 | 심각도 | 수정 내용 | 영향 범위 |
|------|--------|----------|----------|
| **B1**: 정밀도 변경 시 기존 답변 초기화 | Critical | `handlePrecisionSelect`에 답변 보존 로직 (`filterAnswersByQuestionSet` + `firstUnansweredIndex`) | `DynamicOnboardingFlow.tsx` |
| **B2**: 특정 화면에서 다음 단계 진행 불가 | Critical | `OnboardingQuestionRenderer`에 `key={String(question.id)}` 추가 + `DemographicStep` 미선택 안내 텍스트 | `OnboardingQuestionRenderer.tsx`, `DemographicStep.tsx` |
| **B3**: 질문 이동 시 이전 답변 잔존 | High | B2와 동일 `key` prop 수정으로 해결 | `OnboardingQuestionRenderer.tsx` |
| **B4**: 확장 질문 생성 계속 실패 | High | LLM 모델명 환경변수화(`OPENAI_MODEL`), Fallback 풀 고갈 방어, 에러 메시지 개선, "기본 질문으로 계속하기" UX | `openai-question-generator.ts`, `fallback-question-generator.ts`, `next-batch/route.ts`, `BatchLoadingIndicator.tsx` |
| **B5**: 대화 시 주제 미표시 | High | `DialogueSession` 엔티티에 `topic` 필드 추가, DTO/UseCase/API/UI 전 레이어 관통 구현 | Domain→Application→Infrastructure→Presentation |
| **B6**: Thought Map 결과 재접근 불가 | High | 결과 데이터 localStorage(`ps-thought-map`) 캐싱 + Passport 페이지 "내 사고 지도" 섹션 | `result/page.tsx`, `passport/page.tsx` |
| **B7**: 공유카드 안 보임 | Medium | ShareCard를 `<details>` 접힘 패널에서 독립 섹션("나의 입장 카드")으로 이동 | `ThoughtMapResult.tsx` |
| **B8**: 매칭 기준 설명 부재 | Low | 입장 기반 매칭 설명 카피 추가 + "TODAY'S MATCH" → "입장 기반 추천" 변경 | `matching/page.tsx`, `MatchCardV3.tsx` |

---

## 13. 설계 문서 및 계획

### 거버넌스 문서 (프로젝트 루트)

| 문서 | 내용 |
|------|------|
| `ARCHITECTURE.md` | 아키텍처 개요 |
| `AGENTS.md` | AI 에이전트 규약 |
| `CONSTITUTION.md` | 프로젝트 헌법 |
| `PROTOCOL.md` | 개발 프로토콜 |
| `PR_POLICY.md` | PR 정책 |
| `POLICIES.md` | 정책 모음 |
| `BOOTSTRAP.md` | 부트스트랩 가이드 |
| `PerspectiveShift_v4.md` | v4 기획서 |

### 설계 문서

| 문서 | 내용 |
|------|------|
| `docs/design/FRONTEND_DESIGN_SPEC.md` | "Intellectual Serenity" 디자인 시스템 — 5개 레이아웃 템플릿, 20개 컴포넌트, 전체 토큰 정의, Korean-first 타이포그래피 |
| `docs/_meta/doc-conventions.md` | 문서 규약 |

### 계획 문서 (20+ 개)

v2 (8개, 전체 완료), v3 (1개 블루프린트), v4 (4개: 블루프린트 + P0 세부 + P1 세부 + P2 세부), 브라우저 테스트 시나리오(69 케이스), 테스트 실행 로그, 사용자 피드백 버그 수정(`PLAN_user-feedback-bugfix.md`), 코드베이스 정리(`PLAN_codebase-cleanup.md`)

---

## 14. 알려진 이슈

### 14.1 해결된 이슈 (사용자 피드백 버그 수정, 2026-02-22)

아래 8개 버그는 사용자 테스트에서 보고되어 수정 완료됨. 상세: `docs/plans/PLAN_user-feedback-bugfix.md`

| 버그 | 상태 |
|------|------|
| B1: 정밀도 변경 시 기존 답변 초기화 | **해결** |
| B2: 특정 화면에서 다음 단계 진행 불가 | **해결** |
| B3: 질문 이동 시 이전 답변 잔존 | **해결** |
| B4: 확장 질문 생성 계속 실패 | **해결** |
| B5: 대화 시 주제 미표시 | **해결** |
| B6: Thought Map 결과 재접근 불가 | **해결** |
| B7: 공유카드 안 보임 | **해결** |
| B8: 매칭 기준 설명 부재 | **해결** |

### 14.2 실패 테스트 (14개, 기존 미해결)

- 홈 페이지 CTA 렌더링 (2개) — 최근 상위/하위 → 스펙트럼 리팩터링 후 미동기화
- 300줄 파일 제한 초과 (1개) — 일부 파일 길이 초과
- InMemory 페르소나 시드 데이터 (4개) — 시드 데이터 구조 변경 후 미동기화
- 매칭 페이지 통합 테스트 (3개) — 컴포넌트 구조 변경 후 미동기화
- 데이터 관리 페이지 (4개) — 페이지 구조 변경 후 미동기화

### 14.3 기술 부채

- `.tmp-prodcheck/` 디렉토리 미정리 (임시 파일)
- `.tmp_live_app.html`, `.tmp_vercel_page.html` — 임시 HTML 파일 미정리
- 일부 Supabase 리포지토리는 실제 DB 연동 테스트 미완

---

*이 문서는 2026-02-22 기준 코드베이스를 기반으로 작성되었습니다. 사용자 피드백 버그 수정(8건) 반영.*
