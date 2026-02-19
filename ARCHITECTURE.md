# Architecture — PerspectiveShift

> 이 문서는 프로젝트의 아키텍처 맵이다. 에이전트는 코드 변경 전 이 문서를 참조하여
> 의존성 방향과 레이어 경계를 준수해야 한다.

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  Next.js App (App Router) + Tailwind CSS + Framer Motion        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐       │
│  │Onboarding│ │ Thought  │ │ Dialogue │ │  Friend &   │       │
│  │  Flow    │ │   Map    │ │  Room    │ │  Real-time  │       │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (TLS 1.3)
┌──────────────────────────▼──────────────────────────────────────┐
│                        API Layer                                │
│  Next.js API Routes + Middleware (Auth, Rate Limit, PII Scrub)  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Agent Layer (LangGraph)                      │
│  Onboarding Agent │ Stance Extraction │ Facilitator │ Reflection │
│                     OpenAI GPT-5-mini                           │
│                     LangSmith Tracing                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      Data Layer (Supabase)                       │
│  PostgreSQL + RLS │ Realtime │ Auth │ Storage                    │
│  AES-256 Encryption at Rest                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Clean Architecture Layer Structure

### 의존성 방향 (반드시 이 방향으로만)
```
Domain (Entities) → Application (Use Cases) → Infrastructure (Adapters) → Presentation (UI/API)
```

Inner layers NEVER depend on outer layers. Dependency Inversion을 통해 외부 레이어가 내부 레이어의 인터페이스를 구현한다.

### 디렉토리 ↔ 레이어 매핑

| 디렉토리 | 레이어 | 책임 | 의존 가능 대상 |
|----------|--------|------|---------------|
| `src/domain/` | Domain (Entities) | 비즈니스 엔티티, 값 객체, 도메인 이벤트, 포트 인터페이스 | 없음 (최하위) |
| `src/application/` | Application (Use Cases) | 유스케이스, DTO, 앱 서비스 | Domain |
| `src/infrastructure/` | Infrastructure (Adapters) | DB 구현, API 클라이언트, 외부 서비스 어댑터 | Domain, Application |
| `src/presentation/` | Presentation (UI/API) | React 컴포넌트, API Route 핸들러 | 모든 레이어 (단, Domain 직접 접근 금지) |

### 교차 관심사 (Cross-Cutting Concerns)
교차 관심사는 **Providers** 인터페이스를 통해서만 진입한다:
- 인증 (Auth) — Supabase Auth
- 로깅 (Logging) — 구조화된 JSON 로거
- LLM 호출 (LLM Provider) — OpenAI API 추상화
- 모니터링 (Observability) — LangSmith

## 3. 도메인 경계

| 도메인 | 디렉토리 | 책임 | 외부 의존성 |
|--------|----------|------|------------|
| Identity | `src/domain/identity/` | 사용자 인증, 프로필, 프라이버시 레벨 | Supabase Auth |
| Stance | `src/domain/stance/` | Stance Vector, Thought Map, 유형 분류 | OpenAI (via LLM port) |
| Dialogue | `src/domain/dialogue/` | 구조화 대화, 매칭, Facilitation | OpenAI (via LLM port) |
| Relationship | `src/domain/relationship/` | 친구 시스템, 라이트 프로토콜, 실시간 채팅, 오프라인 만남 | Supabase Realtime |
| Statistics | `src/domain/statistics/` | 비교 통계, Baseline 데이터, K-Anonymity | Supabase PostgreSQL |
| Safety | `src/domain/safety/` | 피로 감지, 쿨다운, 일일 한도, 설득 방지 | — |

## 4. Domain Model Summary (v2.0)

### Entities (22개)

| Entity | 파일 | 핵심 책임 |
|--------|------|----------|
| UserProfile | `entities/user-profile.ts` | 사용자 프로필, 프라이버시 |
| StanceVector | `entities/stance-vector.ts` | 6차원 stance 좌표 + confidence map |
| StanceCalculator | `entities/stance-calculator.ts` | 코사인 거리 계산 |
| Question | `entities/question.ts` | 온보딩 질문 |
| Answer | `entities/answer.ts` | 사용자 응답 |
| ThoughtMap | `entities/thought-map.ts` | 사고 지도 (별명 + 비교 뷰) |
| MatchCandidate | `entities/match-candidate.ts` | 매칭 후보 |
| MatchProposal | `entities/match-proposal.ts` | 매칭 제안 |
| DialogueSession | `entities/dialogue-session.ts` | 6-step 대화 FSM |
| DialogueTurn | `entities/dialogue-turn.ts` | 개별 대화 턴 |
| DialogueFeedback | `entities/dialogue-feedback.ts` | Feel Heard Score + Affective Warmth |
| JointSummary | `entities/joint-summary.ts` | 공동 요약 카드 |
| UnderstandingScore | `entities/understanding-score.ts` | 이해도 점수 |
| SummaryCard | `entities/summary-card.ts` | 요약 카드 |
| FriendRequest | `entities/friend-request.ts` | 친구 요청 |
| Friendship | `entities/friendship.ts` | 친구 관계 + 라이트 프로토콜 카운트 + 실시간 적격성 |
| DisclosureSetting | `entities/disclosure-setting.ts` | 공개 레벨 |
| ChatMessage | `entities/chat-message.ts` | 실시간 채팅 메시지 |
| OfflineMeeting | `entities/offline-meeting.ts` | 오프라인 만남 |
| SafetyReport | `entities/safety-report.ts` | 신고 |
| FollowUpCheckin | `entities/follow-up-checkin.ts` | 1주 후 재측정 체크인 |
| LightProtocolSession | `entities/light-protocol-session.ts` | 라이트 프로토콜 세션 (3종) |

### Value Objects (34개)

| Category | Value Objects |
|----------|--------------|
| Stance | StanceAxis, StanceDimension (6축), ConfidenceLevel, ConfidenceMap |
| Self-Affirmation | SelfAffirmation, CoreValue |
| Thought Map | ThoughtMapAlias, MisperceptionResult, MapType |
| Matching | OpinionDistance, DistanceBand, TopicLevel, EffortGrade, MatchScore, ReadinessScore |
| Dialogue | DialogueStep (6단계), PersonalContext, ReflectionItem, SessionStatus |
| Feedback | ReceptivenessScore, FatigueScore, CooldownMode, MetricTier |
| Relationship | FriendRequestStatus, FriendshipStatus, DisclosureLevel, RelationshipEventType |
| Protocol | LightProtocolType (COMMON_GROUND, JOINT_QUESTION, SWITCH_SIDES) |
| Question | QuestionType |
| Safety | SafetyReason, SafetyCheckinStatus, SafetyReportStatus, MeetingStatus, ProposalStatus |

### Repository Interfaces (Port) — 25개

| Interface | 주요 메서드 |
|-----------|------------|
| UserRepository | findById, save |
| StanceRepository | findByUserId, save |
| MatchRepository | findCandidates, save |
| DialogueRepository | findById, findByParticipant, save, updateStep |
| FeedbackRepository | save, findBySession |
| FriendRepository | findById, findByUserId, save |
| FriendshipRepository | findById, findByUsers, save, update |
| DisclosureRepository | findByFriendship, save |
| MessageRepository | findByFriendship, save |
| MeetingRepository | findById, save |
| SafetyRepository | save, findByReporter |
| BlockRepository | findByUser, save |
| ReceiptRepository | save, findBySession |
| FollowUpCheckinRepository | save, findByFriendship |
| ReceptivenessRepository | save, findByUser |
| LightProtocolRepository | save, findById, findByFriendship, findActiveByFriendship |

### Service Interfaces (Port) — 8개

LlmStanceExtractor, PiiScrubber, SummaryGenerator, Facilitator,
ValueExtractor, BaselineProvider, RealtimeBroadcaster, RateLimiter, EventTracker

### Dialogue FSM (6-Step)

```
AFFIRMATION → POSITION → QUESTION → ANSWER → REFLECTION → JOINT_SUMMARY
```

### Friendship Realtime Eligibility

```
isRealtimeEligible() = ACTIVE && dialogueCount >= 2 && completedLightProtocols >= 1
```

## 5. 데이터 분리 원칙

**Identity ↔ Stance ↔ Dialogue의 논리적 분리**

- 매칭 엔진: Stance Domain만 접근 (anonymized)
- 통계 엔진: Stance + Demographics (집계만)
- 대화 관리: Dialogue Domain만 접근
- Facilitator: 현재 세션만 접근 (stance data 접근 차단 — ADR-007)
- 사용자 본인: 모든 자신의 데이터 (RLS)

## 6. 주요 설계 결정

→ 상세 ADR은 [specs/decisions/](specs/decisions/) 참조
→ v2 ADR은 [docs/plans/active/002-v2-enhancement-blueprint.md](docs/plans/active/002-v2-enhancement-blueprint.md) §3 참조

## 7. 현재 상태 (v2.0 Complete)

| 레이어 | 파일 수 | 상태 |
|--------|---------|------|
| Domain (entities + VOs + interfaces + services) | ~80 | v1 + v2 P1-P8 구현 완료 |
| Application (use cases + DTOs + services) | ~70 | v1 + v2 P1-P8 구현 완료 |
| Infrastructure (repos + adapters + config) | ~45 | v1 + v2 P1-P8 구현 완료 |
| Presentation (pages + components + API routes) | ~65 | v1 + v2 P1-P8 구현 완료 |
| Tests | 877 (149 files) | 전체 통과 |
