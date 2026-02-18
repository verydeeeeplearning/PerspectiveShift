# 🏗️ PerspectiveShift — 기술 아키텍처 설계서

> v1.0 | 2026.02.18

---

## 1. 아키텍처 개요

### 1.1 설계 원칙

| 원칙 | 설명 | 적용 |
|------|------|------|
| **Privacy by Design** | 프라이버시가 사후 조치가 아닌 아키텍처 수준에서 보장 | Identity와 Stance 데이터의 물리적 분리, PII scrubbing 파이프라인 |
| **Separation of Concerns** | 각 Agent와 서비스는 단일 책임만 가짐 | LangGraph 기반 Agent별 독립적 상태 머신 |
| **Progressive Disclosure** | 사용자 신뢰 수준에 따라 기능과 데이터 접근 범위가 단계적으로 확장 | Phase 1→2→3 기능 확장, Profile Level 0→3 |
| **Observability First** | 모든 LLM 호출과 Agent 동작을 추적 가능하게 설계 | LangSmith 기반 전 구간 트레이싱 |
| **Fail Graceful** | LLM 응답 실패, 네트워크 오류 시에도 사용자 경험 유지 | Fallback 전략, 비동기 재시도, 캐싱 |

### 1.2 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js App (App Router)                      │  │
│  │                                                           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │  │
│  │  │Onboarding│ │ Thought  │ │ Dialogue │ │  Friend &   │ │  │
│  │  │  Flow    │ │   Map    │ │  Room    │ │  Real-time  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │  │
│  │                                                           │  │
│  │  Tailwind CSS + Framer Motion + Recharts/D3.js            │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (TLS 1.3)
┌──────────────────────────▼──────────────────────────────────────┐
│                        API Layer                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes                            │  │
│  │                                                           │  │
│  │  /api/auth/*        → 인증/인가                            │  │
│  │  /api/onboarding/*  → 온보딩 질문 및 응답 처리              │  │
│  │  /api/profile/*     → Stance Profile, Thought Map          │  │
│  │  /api/matching/*    → 매칭 엔진                            │  │
│  │  /api/dialogue/*    → 구조화 대화 관리                      │  │
│  │  /api/friends/*     → 친구 시스템                           │  │
│  │  /api/realtime/*    → 실시간 대화 (WebSocket upgrade)       │  │
│  │  /api/stats/*       → 비교 통계                            │  │
│  └───────────────────┬───────────────────────────────────────┘  │
│                      │                                          │
│  ┌───────────────────▼───────────────────────────────────────┐  │
│  │             Middleware Layer                                │  │
│  │                                                           │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐ │  │
│  │  │    Auth     │ │  Rate Limit  │ │   PII Scrubbing    │ │  │
│  │  │ Middleware  │ │  Middleware   │ │    Middleware       │ │  │
│  │  └─────────────┘ └──────────────┘ └────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Agent Layer (LangGraph)                      │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │Onboarding│ │ Stance   │ │Facilitator│ │   Reflection     │ │
│  │  Agent   │ │Extraction│ │   Agent   │ │     Agent        │ │
│  │          │ │  Agent   │ │           │ │                  │ │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └───────┬──────────┘ │
│       │            │             │               │            │
│  ┌────▼────────────▼─────────────▼───────────────▼──────────┐ │
│  │                  OpenAI API (GPT-4o)                      │ │
│  └──────────────────────────┬───────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼───────────────────────────────┐ │
│  │                  LangSmith Tracing                        │ │
│  │         (모든 Agent 호출 로깅, 비용, 레이턴시 추적)         │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      Data Layer (Supabase)                       │
│                                                                 │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Users   │ │  Stance   │ │Dialogues │ │   Friends &      │ │
│  │(identity)│ │ Profiles  │ │  & Logs  │ │   Messages       │ │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘ │
│                                                                 │
│  Row Level Security (RLS) + AES-256 Encryption at Rest          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Realtime                             │  │
│  │       (실시간 채팅, 대화 알림, 상태 동기화)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    Infrastructure Layer                          │
│                                                                 │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────────────────┐  │
│  │  Vercel  │ │ Supabase  │ │      External Services       │  │
│  │ (Deploy) │ │  (BaaS)   │ │                              │  │
│  │          │ │           │ │  - OpenAI API                │  │
│  │          │ │           │ │  - LangSmith                 │  │
│  │          │ │           │ │  - OAuth Providers           │  │
│  │          │ │           │ │    (Google, Kakao, Apple)    │  │
│  └──────────┘ └───────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Architecture

### 2.1 데이터 분리 원칙

이 앱의 데이터 아키텍처 핵심은 **Identity ↔ Stance ↔ Dialogue의 논리적 분리**이다.

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Domain Separation                    │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Identity   │    │   Stance     │    │   Dialogue    │  │
│  │  Domain     │    │   Domain     │    │   Domain      │  │
│  │             │    │              │    │               │  │
│  │ - user_id   │    │ - stance_id  │    │ - dialogue_id │  │
│  │ - nickname  │    │ - vectors    │    │ - messages    │  │
│  │ - auth_info │    │ - readiness  │    │ - feedback    │  │
│  │ - demo-     │    │ - map_type   │    │ - summaries   │  │
│  │   graphics  │    │ - reasoning  │    │               │  │
│  └──────┬──────┘    └──────┬───────┘    └───────┬───────┘  │
│         │                  │                    │           │
│         └──────────────────┼────────────────────┘           │
│                            │                                │
│              user_id (FK)로만 연결                            │
│              직접 JOIN은 통계 집계 시에만 허용                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Access Rules                        │    │
│  │                                                     │    │
│  │  매칭 엔진     → Stance Domain만 접근 (anonymized)   │    │
│  │  통계 엔진     → Stance + Demographics (집계만)      │    │
│  │  대화 관리     → Dialogue Domain만 접근              │    │
│  │  사용자 본인   → 모든 자신의 데이터 (RLS)             │    │
│  │  Facilitator  → Dialogue 현재 세션만 접근            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 ERD (Entity-Relationship Diagram)

```
┌──────────────────────┐
│       users           │
├──────────────────────┤
│ PK  id: UUID          │
│     nickname: VARCHAR  │
│     auth_provider      │
│     auth_provider_id   │
│     created_at         │
│     updated_at         │
└──────────┬───────────┘
           │
     ┌─────┴──────────────────────────────┐
     │                │                    │
     ▼                ▼                    ▼
┌─────────────┐ ┌──────────────┐  ┌──────────────────┐
│user_demo-   │ │stance_       │  │ friends          │
│graphics     │ │profiles      │  │                  │
├─────────────┤ ├──────────────┤  ├──────────────────┤
│FK user_id   │ │PK id: UUID   │  │PK id: UUID       │
│  age_group  │ │FK user_id    │  │FK user_a_id      │
│  gender     │ │  tech_reg    │  │FK user_b_id      │
│  region     │ │  redistrib   │  │  status           │
│  updated_at │ │  work_life   │  │  disclosure_a     │
└─────────────┘ │  meritocracy │  │  disclosure_b     │
                │  tech_optim  │  │  created_at       │
                │  opp_equality│  └────────┬─────────┘
                │  reasoning   │           │
                │  readiness   │           ▼
                │  map_type    │  ┌──────────────────┐
                │  created_at  │  │ realtime_        │
                └──────────────┘  │ messages         │
                                  ├──────────────────┤
                                  │PK id: UUID       │
┌──────────────────┐              │FK friendship_id  │
│ dialogue_        │              │FK sender_id      │
│ sessions         │              │  content          │
├──────────────────┤              │  created_at       │
│PK id: UUID       │              └──────────────────┘
│FK user_a_id      │
│FK user_b_id      │
│  topic            │
│  status           │
│  phase            │       ┌──────────────────┐
│  created_at       │       │ dialogue_        │
│  completed_at     │       │ messages         │
└────────┬─────────┘       ├──────────────────┤
         │                  │PK id: UUID       │
         ├─────────────────►│FK session_id     │
         │                  │FK sender_id      │
         │                  │  content          │
         │                  │  step             │
         │                  │  tone_flagged     │
         │                  │  created_at       │
         │                  └──────────────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│ dialogue_        │       │ meetup_          │
│ feedback         │       │ requests         │
├──────────────────┤       ├──────────────────┤
│PK id: UUID       │       │PK id: UUID       │
│FK session_id     │       │FK friendship_id  │
│FK user_id        │       │FK requester_id   │
│  satisfaction    │       │  status           │
│  understanding   │       │  safety_ack      │
│  friend_request  │       │  created_at      │
│  emotion_check   │       └──────────────────┘
│  created_at      │
└──────────────────┘

┌──────────────────────────┐
│ stance_statistics (MV)   │
├──────────────────────────┤
│  age_group               │
│  gender                  │
│  region                  │
│  avg_* (각 축별 평균)     │
│  std_* (각 축별 표준편차)  │
│  group_size              │
└──────────────────────────┘
```

### 2.3 Row Level Security (RLS) 정책

```
┌─────────────────────────────────────────────────────────────┐
│                     RLS Policy Map                           │
│                                                             │
│  users                                                      │
│  ├── SELECT: auth.uid() = id                                │
│  ├── UPDATE: auth.uid() = id                                │
│  └── DELETE: auth.uid() = id                                │
│                                                             │
│  stance_profiles                                            │
│  ├── SELECT: auth.uid() = user_id                           │
│  ├── INSERT: auth.uid() = user_id                           │
│  └── DELETE: auth.uid() = user_id                           │
│                                                             │
│  dialogue_sessions                                          │
│  ├── SELECT: auth.uid() IN (user_a_id, user_b_id)          │
│  └── 생성/수정: API Server Role Only (service_role key)      │
│                                                             │
│  dialogue_messages                                          │
│  ├── SELECT: session의 참여자인 경우만                        │
│  ├── INSERT: auth.uid() = sender_id AND session 참여자       │
│  └── 세션 완료 후: 상대방 접근 차단 (본인 기록만 열람)          │
│                                                             │
│  friends                                                    │
│  ├── SELECT: auth.uid() IN (user_a_id, user_b_id)          │
│  └── 수정: 양쪽 모두의 동의 검증 (API layer에서 처리)         │
│                                                             │
│  realtime_messages                                          │
│  ├── SELECT: friendship의 참여자인 경우만                     │
│  └── INSERT: auth.uid() = sender_id AND friendship 참여자    │
│                                                             │
│  ⚠️ stance_statistics (Materialized View)                    │
│  └── SELECT: group_size >= 15 인 세그먼트만 반환 (K-anonymity)│
└─────────────────────────────────────────────────────────────┘
```

### 2.4 데이터 생명주기

```
┌─────────────────────────────────────────────────────────────┐
│                   Data Lifecycle Policy                      │
│                                                             │
│  온보딩 답변 원문 (raw text)                                  │
│  ├── 생성: 온보딩 질문 응답 시                                │
│  ├── 처리: Stance Extraction Agent가 stance vector 추출      │
│  ├── PII scrubbing 후 LLM API 전송                          │
│  └── 삭제: stance vector 추출 완료 즉시 원문 삭제 ⚠️          │
│                                                             │
│  Stance Vector                                              │
│  ├── 생성: 온보딩 완료 시                                    │
│  ├── 수정: 사용자 요청 시 재측정 가능                         │
│  └── 삭제: 계정 삭제 시 즉시                                 │
│                                                             │
│  대화 로그 (Dialogue Messages)                               │
│  ├── 생성: 대화 진행 중                                      │
│  ├── 보관: Facilitator 품질 개선 목적, 90일                   │
│  ├── 90일 후: 메시지 본문 삭제, 메타데이터(만족도 등)만 보관   │
│  └── 계정 삭제 시: 전체 즉시 삭제                             │
│                                                             │
│  실시간 대화 메시지 (Realtime Messages)                       │
│  ├── 생성: 실시간 대화 중                                    │
│  ├── 보관: 30일 (친구 간 대화 이력 열람용)                    │
│  ├── 30일 후: 자동 삭제                                      │
│  └── 친구 관계 해제 시: 즉시 삭제                             │
│                                                             │
│  Demographics                                               │
│  ├── 생성: 사용자 자발적 입력 시                              │
│  ├── 수정: 사용자 수시 변경 가능                              │
│  └── 삭제: 사용자 요청 또는 계정 삭제 시 즉시                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Agent Architecture (LangGraph)

### 3.1 Agent 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                   LangGraph Agent System                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Shared Components                       │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │    │
│  │  │ PII Scrubber │  │ Tone Analyzer│  │  Prompt  │  │    │
│  │  │              │  │              │  │  Registry │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Onboarding  │ │   Stance     │ │    Facilitator       │ │
│  │ Agent       │ │  Extraction  │ │    Agent             │ │
│  │             │ │   Agent      │ │                      │ │
│  │ Phase 1     │ │  Phase 1     │ │  Phase 2             │ │
│  └──────┬──────┘ └──────┬───────┘ └──────────┬───────────┘ │
│         │               │                    │             │
│  ┌──────▼───────────────▼────────────────────▼───────────┐ │
│  │                                                       │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ │ │
│  │  │  Framing     │ │  Reflection  │ │   Insight     │ │ │
│  │  │  Agent       │ │  Agent       │ │   Agent       │ │ │
│  │  │              │ │              │ │               │ │ │
│  │  │  Phase 2     │ │  Phase 2     │ │  Phase 1+2    │ │ │
│  │  └──────────────┘ └──────────────┘ └───────────────┘ │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────────┐ │
│  │                   OpenAI API                           │ │
│  │               GPT-4o (primary)                        │ │
│  │            GPT-4o-mini (lightweight tasks)            │ │
│  └───────────────────────┬───────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────────┐ │
│  │              LangSmith Tracing Hub                     │ │
│  │                                                       │ │
│  │  Projects:                                            │ │
│  │  ├── perspectiveshift/onboarding                      │ │
│  │  ├── perspectiveshift/extraction                      │ │
│  │  ├── perspectiveshift/facilitation                    │ │
│  │  ├── perspectiveshift/reflection                      │ │
│  │  └── perspectiveshift/insight                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Onboarding Agent — State Graph

```
┌─────────────────────────────────────────────────────────────┐
│                 Onboarding Agent State Graph                  │
│                 (Progressive Profiling)                       │
│                                                             │
│  State Schema:                                              │
│  {                                                          │
│    phase: "core" | "initial_result" | "extended" | "complete"│
│    current_question: number (1-10)                          │
│    answers: Answer[]                                        │
│    core_results: {q1-q5 answers}                            │
│    extended_results: {q6-q10 answers} (optional)            │
│    micro_insights: string[]                                 │
│    stance_vector: float[] | null                            │
│    profile_precision: "initial" | "refined"                 │
│  }                                                          │
│                                                             │
│                    ┌──────────┐                              │
│                    │  START   │                              │
│                    └────┬─────┘                              │
│                         ▼                                    │
│                  ┌──────────────┐                            │
│                  │  Core Phase  │ Q1(OX) → Q2(OX) → Q3(OX) │
│                  │  (Q1-Q5)     │ → Q4(Rubric) → Q5(Rubric) │
│                  └──────┬───────┘                            │
│                         ▼                                    │
│              ┌────────────────────┐                          │
│              │  Initial Stance    │ Core 5문항으로            │
│              │  Extraction        │ 초기 vector 생성          │
│              └──────────┬─────────┘                          │
│                         ▼                                    │
│              ┌────────────────────┐                          │
│              │  Initial Thought   │ 별명 + 상대적 포지션      │
│              │  Map Generation    │ + "A그룹과 N% 유사"       │
│              └──────────┬─────────┘                          │
│                         │                                    │
│                ┌────────┴────────┐                           │
│                ▼                 ▼                            │
│         ┌──────────┐     ┌──────────────┐                   │
│         │ 만족     │     │  교정 요청    │ 사용자가           │
│         │ → END    │     │  (Extended)   │ "다시 분석" 선택   │
│         └──────────┘     └──────┬───────┘                   │
│                                 ▼                            │
│                          ┌──────────────┐                   │
│                          │ Extended     │ Q6(OX) → Q7-8     │
│                          │ Phase       │ (Rubric) → Q9-10   │
│                          │ (Q6-Q10)    │ (서술형)            │
│                          └──────┬───────┘                   │
│                                 │ (1문항마다 실시간 업데이트)  │
│                                 ▼                            │
│              ┌────────────────────┐                          │
│              │  PII Scrubbing     │ 서술형 답변 개인정보 제거  │
│              └──────────┬─────────┘                          │
│                         ▼                                    │
│              ┌────────────────────┐                          │
│              │  Refined Stance    │ 정밀화된 6차원 vector     │
│              │  Extraction        │                          │
│              └──────────┬─────────┘                          │
│                         ▼                                    │
│              ┌────────────────────┐                          │
│              │  Updated Thought   │ 별명 재계산 +             │
│              │  Map Generation    │ 정밀도 표시               │
│              └──────────┬─────────┘                          │
│                         ▼                                    │
│                    ┌──────────┐                              │
│                    │   END    │                              │
│                    └──────────┘                              │
│                                                             │
│  중단/재진입: 모든 state는 DB에 persist.                      │
│  Extended Phase는 사용자가 원하는 시점에 중단 가능.            │
│  중단 시 현재까지의 답변으로 vector 업데이트.                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Stance Extraction Agent — State Graph

```
┌─────────────────────────────────────────────────────────────┐
│             Stance Extraction Agent State Graph               │
│                                                             │
│  Input: OX answers + Rubric scores + Open-ended texts        │
│  Output: Stance Profile                                      │
│                                                             │
│         ┌───────────────────┐                                │
│         │  Quantitative     │ OX (binary) + Rubric (scale)   │
│         │  Score Assembly   │ → 4+4 = 8개 수치 정규화        │
│         └─────────┬─────────┘                                │
│                   ▼                                          │
│         ┌───────────────────┐                                │
│         │  Qualitative      │ Q9, Q10 텍스트를 LLM이 분석    │
│         │  Analysis (LLM)   │                                │
│         │                   │ 추출:                          │
│         │                   │ - value_priorities             │
│         │                   │ - reasoning_pattern            │
│         │                   │ - conflict_topic               │
│         │                   │ - dialogue_readiness           │
│         │                   │ - concern_type                 │
│         └─────────┬─────────┘                                │
│                   ▼                                          │
│         ┌───────────────────┐                                │
│         │  Vector Synthesis │ 정량 + 정성 결합               │
│         │                   │ → 6차원 stance vector 생성     │
│         │                   │ → reasoning_tags 조합          │
│         └─────────┬─────────┘                                │
│                   ▼                                          │
│         ┌───────────────────┐                                │
│         │  Type             │ stance vector 패턴으로          │
│         │  Classification   │ 유형 분류                      │
│         │                   │ (균형 탐색가, 원칙 수호자 등)    │
│         └─────────┬─────────┘                                │
│                   ▼                                          │
│         ┌───────────────────┐                                │
│         │  Profile          │ DB 저장 + Thought Map 데이터    │
│         │  Persistence      │ 조합하여 반환                   │
│         └───────────────────┘                                │
│                                                             │
│  Model 선택:                                                │
│  - Quantitative Score Assembly: 코드 로직 (LLM 불필요)       │
│  - Qualitative Analysis: GPT-4o (정확도 중요)                │
│  - Type Classification: GPT-4o-mini (패턴 매칭 수준)         │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Facilitator Agent — State Graph

```
┌─────────────────────────────────────────────────────────────┐
│              Facilitator Agent State Graph                    │
│                                                             │
│  트리거: 사용자가 대화 메시지를 제출할 때마다 실행             │
│                                                             │
│          ┌───────────────────┐                               │
│          │  Message Received │ 사용자 입력 수신               │
│          └─────────┬─────────┘                               │
│                    ▼                                         │
│          ┌───────────────────┐                               │
│          │  Tone Analysis    │ 공격성, 비하, 인신공격 감지    │
│          │  (GPT-4o-mini)    │                               │
│          └─────────┬─────────┘                               │
│                    │                                         │
│           ┌───────┴────────┐                                │
│           ▼                ▼                                 │
│     ┌──────────┐    ┌──────────────┐                        │
│     │   PASS   │    │    FLAG      │                        │
│     │          │    │              │                        │
│     │ 메시지를  │    │ 리프레이밍   │                        │
│     │ 그대로   │    │ 제안 생성    │                        │
│     │ 전달     │    │ (GPT-4o)     │                        │
│     └────┬─────┘    └──────┬───────┘                        │
│          │                 │                                 │
│          │          ┌──────┴───────┐                         │
│          │          ▼              ▼                         │
│          │   ┌──────────┐  ┌──────────┐                     │
│          │   │  Accept   │  │  Reject  │ 사용자가            │
│          │   │  Reframe  │  │  Reframe │ 제안 수락/거절      │
│          │   └────┬──────┘  └────┬─────┘                    │
│          │        │              │                           │
│          │        ▼              ▼                           │
│          │   리프레이밍된   원본 메시지 전달                   │
│          │   메시지 전달   (톤 경고 로깅)                     │
│          │        │              │                           │
│          └────────┴──────┬───────┘                           │
│                          ▼                                   │
│                 ┌────────────────┐                            │
│                 │ Topic Drift    │ 현재 토론 주제에서          │
│                 │ Detection      │ 벗어났는지 감지            │
│                 └────────┬───────┘                            │
│                          │                                   │
│                   ┌──────┴───────┐                           │
│                   ▼              ▼                           │
│            ┌──────────┐  ┌──────────────┐                   │
│            │ On Topic │  │  Off Topic   │                   │
│            │ → 진행   │  │  → Redirect  │                   │
│            │          │  │    Suggestion │                   │
│            └──────────┘  └──────────────┘                   │
│                                                             │
│  Facilitator는 Phase 3 실시간 대화에서는 경미하게만 개입:      │
│  - 톤 체크만 수행 (topic drift 감지 비활성화)                 │
│  - 구조화 유도 없음 (자유 대화 보장)                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 Reflection Agent — State Graph

```
┌─────────────────────────────────────────────────────────────┐
│               Reflection Agent State Graph                   │
│                                                             │
│  트리거: 구조화된 대화 세션 완료 시 실행                       │
│  입력: 대화 전체 로그 + 양측 stance profile                   │
│                                                             │
│          ┌───────────────────┐                               │
│          │  Dialogue Log     │ 전체 대화 내용 수집            │
│          │  Collection       │                               │
│          └─────────┬─────────┘                               │
│                    ▼                                         │
│          ┌───────────────────┐                               │
│          │  Argument         │ 양측의 핵심 주장을             │
│          │  Extraction       │ 각각 추출 및 구조화            │
│          │  (GPT-4o)         │                               │
│          └─────────┬─────────┘                               │
│                    ▼                                         │
│          ┌───────────────────┐                               │
│          │  Common Ground    │ 양측이 동의한 지점,            │
│          │  Detection        │ 공유된 가치관 도출             │
│          └─────────┬─────────┘                               │
│                    ▼                                         │
│          ┌───────────────────┐                               │
│          │  Blind Spot       │ 대화에서 다뤄지지 않은          │
│          │  Identification   │ 관점이나 논점 식별             │
│          └─────────┬─────────┘                               │
│                    ▼                                         │
│          ┌───────────────────┐                               │
│          │  Summary Card     │ User A용, User B용 각각       │
│          │  Generation       │ 개인화된 요약 카드 생성         │
│          └─────────┬─────────┘                               │
│                    ▼                                         │
│          ┌───────────────────┐                               │
│          │  Understanding    │ 각 사용자의 "상대방 요약"과     │
│          │  Score Calc       │ 실제 주장을 비교하여 점수 산출  │
│          └───────────────────┘                               │
│                                                             │
│  출력 (User별 개인화):                                       │
│  {                                                          │
│    my_key_arguments: string[]                               │
│    their_key_arguments: string[]                            │
│    common_ground: string[]                                  │
│    blind_spots: string[]                                    │
│    unresolved_questions: string[]                           │
│    understanding_score: float                               │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.6 Insight Agent — Micro Insight & Statistics

```
┌─────────────────────────────────────────────────────────────┐
│                    Insight Agent                             │
│                                                             │
│  역할: 온보딩 중 마이크로 인사이트 생성 +                     │
│        Thought Map 비교 통계 인사이트 생성                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Micro Insight Generation (온보딩 중)                │    │
│  │                                                     │    │
│  │  Input: 현재까지의 답변 + baseline 통계               │    │
│  │                                                     │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Pattern       │ 답변 패턴 분석                    │    │
│  │  │ Detection     │ (일관성, 혼합, 극단 등)           │    │
│  │  └───────┬───────┘                                  │    │
│  │          ▼                                          │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Percentile    │ baseline 대비 위치 계산           │    │
│  │  │ Calculation   │ (코드 로직, LLM 불필요)           │    │
│  │  └───────┬───────┘                                  │    │
│  │          ▼                                          │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Copy          │ 패턴 + 위치 → 자연어 인사이트     │    │
│  │  │ Generation    │ (GPT-4o-mini)                    │    │
│  │  └───────────────┘                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Statistics Insight Generation (Thought Map)         │    │
│  │                                                     │    │
│  │  Input: user stance + demographics + baseline/stats  │    │
│  │                                                     │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Baseline      │ cold start 단계에 따라            │    │
│  │  │ Selection     │ 외부 데이터 / 혼합 / 앱 데이터    │    │
│  │  └───────┬───────┘                                  │    │
│  │          ▼                                          │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Segment       │ demographic 필터 적용             │    │
│  │  │ Filtering     │ K-anonymity (K≥15) 체크          │    │
│  │  └───────┬───────┘                                  │    │
│  │          ▼                                          │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Gap Analysis  │ 전체 vs 세그먼트 vs 나의 차이     │    │
│  │  │               │ 가장 두드러진 차이점 추출          │    │
│  │  └───────┬───────┘                                  │    │
│  │          ▼                                          │    │
│  │  ┌───────────────┐                                  │    │
│  │  │ Narrative     │ 차이점을 자연어 인사이트로 변환    │    │
│  │  │ Generation    │ (GPT-4o-mini)                    │    │
│  │  └───────────────┘                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.7 Model 선택 전략

| Agent / Task | Model | 이유 |
|-------------|-------|------|
| Onboarding 대화 흐름 | GPT-4o-mini | 질문 전달 + 간단한 분기. 비용 효율 우선 |
| Stance Extraction (정성) | GPT-4o | 서술형 답변 분석. 정확도가 핵심 |
| Micro Insight 생성 | GPT-4o-mini | 짧은 카피 생성. 속도 우선 |
| Facilitator 톤 체크 | GPT-4o-mini | 실시간 처리. 레이턴시 최소화 필수 |
| Facilitator 리프레이밍 | GPT-4o | 섬세한 언어 조정. 품질 중요 |
| Framing Agent | GPT-4o | 탐구적 질문 설계. 창의성 필요 |
| Reflection 요약 | GPT-4o | 복잡한 대화 합성. 정확도 중요 |
| Understanding Score | GPT-4o | 의미적 유사도 평가. 판단력 필요 |
| 유형 분류 | GPT-4o-mini | 패턴 매칭 수준. 비용 효율 |
| Statistics 인사이트 | GPT-4o-mini | 숫자 기반 카피. 속도 우선 |

### 3.8 Prompt Registry 설계

```
┌─────────────────────────────────────────────────────────────┐
│                    Prompt Registry                           │
│                                                             │
│  모든 프롬프트를 중앙 관리. 버전 관리 + A/B 테스트 가능.      │
│                                                             │
│  구조:                                                      │
│  prompts/                                                   │
│  ├── onboarding/                                            │
│  │   ├── ox_question_delivery.yaml                          │
│  │   ├── rubric_question_delivery.yaml                      │
│  │   ├── open_ended_question_delivery.yaml                  │
│  │   └── adaptive_followup.yaml                             │
│  ├── extraction/                                            │
│  │   ├── qualitative_analysis.yaml                          │
│  │   ├── vector_synthesis.yaml                              │
│  │   └── type_classification.yaml                           │
│  ├── facilitation/                                          │
│  │   ├── tone_check.yaml                                    │
│  │   ├── reframe_suggestion.yaml                            │
│  │   └── topic_drift_detection.yaml                         │
│  ├── framing/                                               │
│  │   └── exploratory_question_design.yaml                   │
│  ├── reflection/                                            │
│  │   ├── argument_extraction.yaml                           │
│  │   ├── common_ground_detection.yaml                       │
│  │   ├── blind_spot_identification.yaml                     │
│  │   ├── summary_card_generation.yaml                       │
│  │   └── understanding_score_evaluation.yaml                │
│  └── insight/                                               │
│      ├── micro_insight_ox.yaml                              │
│      ├── micro_insight_rubric.yaml                          │
│      └── statistics_narrative.yaml                          │
│                                                             │
│  각 프롬프트 파일:                                           │
│  - version: "1.2"                                           │
│  - model: "gpt-4o" | "gpt-4o-mini"                         │
│  - temperature: 0.0 ~ 1.0                                  │
│  - system_prompt: "..."                                     │
│  - user_prompt_template: "..."                              │
│  - output_schema: {...}  (JSON Schema for structured output)│
│  - langsmith_tag: "extraction/v1.2"                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Matching Engine Architecture

### 4.1 매칭 파이프라인

```
┌─────────────────────────────────────────────────────────────┐
│                   Matching Pipeline                          │
│                                                             │
│  ┌───────────────┐                                          │
│  │  매칭 요청     │ 사용자가 "대화 상대 찾기" 클릭           │
│  │  수신          │                                         │
│  └───────┬───────┘                                          │
│          ▼                                                   │
│  ┌───────────────────────────────────────────────────┐      │
│  │  1. Candidate Pool Assembly                       │      │
│  │                                                   │      │
│  │  - 같은 주제에 대화 의향을 표시한 유저 필터        │      │
│  │  - 이미 대화한 적 있는 유저 제외                   │      │
│  │  - 차단한/차단된 유저 제외                         │      │
│  │  - 대화 중인 유저 제외                            │      │
│  │                                                   │      │
│  │  ⚠️ 이 단계에서 stance_profiles 테이블만 접근       │      │
│  │     user identity 정보에 접근하지 않음              │      │
│  └───────────┬───────────────────────────────────────┘      │
│              ▼                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │  2. Opinion Distance Calculation                  │      │
│  │                                                   │      │
│  │  요청자의 stance vector와 각 후보의 cosine distance│      │
│  │  계산 (해당 주제 축만 사용)                        │      │
│  │                                                   │      │
│  │  distance = 1 - cosine_similarity(A, B)           │      │
│  └───────────┬───────────────────────────────────────┘      │
│              ▼                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │  3. Sweet Spot Filtering                          │      │
│  │                                                   │      │
│  │  0.4 ≤ distance ≤ 0.7 인 후보만 통과              │      │
│  │                                                   │      │
│  │  ┌─────────────────────────────────────────────┐  │      │
│  │  │ 0.0   0.2   0.4       0.7   0.9   1.0     │  │      │
│  │  │  ├─────┼─────┼─────────┼─────┼─────┤       │  │      │
│  │  │  너무 가까움   ████ Sweet Spot ████  너무 멂  │  │      │
│  │  └─────────────────────────────────────────────┘  │      │
│  │                                                   │      │
│  │  threshold는 대화 만족도 데이터로 A/B 테스트 튜닝  │      │
│  └───────────┬───────────────────────────────────────┘      │
│              ▼                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │  4. Dialogue Readiness Weighting                  │      │
│  │                                                   │      │
│  │  Sweet Spot 통과 후보 중 dialogue_readiness가      │      │
│  │  높은 순으로 가중 정렬                             │      │
│  │                                                   │      │
│  │  final_score = distance_fit * 0.6                 │      │
│  │              + readiness * 0.4                     │      │
│  │                                                   │      │
│  │  (초기 N회 대화는 readiness 가중치를 0.6으로 상향)  │      │
│  └───────────┬───────────────────────────────────────┘      │
│              ▼                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │  5. Match Proposal                                │      │
│  │                                                   │      │
│  │  최고 점수 후보를 매칭 제안                        │      │
│  │  양쪽 모두 수락 시 대화 세션 생성                  │      │
│  │                                                   │      │
│  │  한쪽 거절 시: 다음 순위 후보로 재제안              │      │
│  │  제안 시 노출 정보: 해당 주제 stance만              │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 매칭 품질 피드백 루프

```
대화 완료 → 만족도 피드백 수집 → (distance, readiness, satisfaction) 데이터 축적
                                         │
                                         ▼
                              ┌────────────────────┐
                              │ 주기적 분석 (주 1회) │
                              │                    │
                              │ satisfaction과      │
                              │ distance의 상관관계  │
                              │ 분석                │
                              └─────────┬──────────┘
                                        ▼
                              Sweet Spot threshold 업데이트
                              (0.4-0.7 → 데이터 기반 최적값)
```

---

## 5. Realtime Architecture

### 5.1 비동기 구조화 대화 (Phase 2)

```
┌─────────────────────────────────────────────────────────────┐
│            Structured Dialogue Flow (Async)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Dialogue Session Manager             │       │
│  │                                                  │       │
│  │  State: {                                        │       │
│  │    session_id, user_a, user_b, topic,            │       │
│  │    current_step: 1|2|3|4,                        │       │
│  │    step_submissions: {a: bool, b: bool},         │       │
│  │    messages: Message[],                          │       │
│  │    status: "active"|"step_complete"|"done"       │       │
│  │  }                                               │       │
│  └──────────────────────┬───────────────────────────┘       │
│                         │                                    │
│  Step 진행 흐름:                                             │
│                                                             │
│  Step 1 (입장 제시)                                          │
│  ├── User A 제출 → Facilitator 톤 체크 → 저장               │
│  ├── User B 제출 → Facilitator 톤 체크 → 저장               │
│  └── 양쪽 완료 시 → Step 2로 전환 + 상대 입장 공개           │
│                                                             │
│  Step 2 (질문)                                              │
│  ├── 상대 입장 읽기 → 질문 작성 → 톤 체크 → 저장            │
│  └── 양쪽 완료 시 → Step 3으로 전환                          │
│                                                             │
│  Step 3 (답변)                                              │
│  ├── 상대 질문에 답변 → 톤 체크 → 저장                       │
│  └── 양쪽 완료 시 → Step 4로 전환                            │
│                                                             │
│  Step 4 (Reflection)                                        │
│  ├── Guided Reflection Template 작성                        │
│  └── 양쪽 완료 시 → Reflection Agent 실행 → 세션 종료        │
│                                                             │
│  알림: 상대방 제출 완료 시 Push/In-app 알림                   │
│  타임아웃: 각 Step 24시간. 초과 시 리마인더 → 48시간 후 만료  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 실시간 대화 (Phase 3)

```
┌─────────────────────────────────────────────────────────────┐
│              Realtime Chat Architecture                      │
│                                                             │
│  ┌──────────┐         ┌──────────────┐        ┌──────────┐ │
│  │  User A  │◄───────►│   Supabase   │◄──────►│  User B  │ │
│  │ (Client) │  WS     │   Realtime   │  WS    │ (Client) │ │
│  └──────────┘         └──────┬───────┘        └──────────┘ │
│                              │                              │
│              ┌───────────────┴───────────────┐              │
│              │    Realtime Channel            │              │
│              │    "chat:{friendship_id}"      │              │
│              │                               │              │
│              │  Subscription:                │              │
│              │  - new message 이벤트          │              │
│              │  - typing indicator           │              │
│              │  - read receipt               │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│              ┌───────────────▼───────────────┐              │
│              │    Message Processing          │              │
│              │                               │              │
│              │  1. Client에서 메시지 전송     │              │
│              │  2. Supabase INSERT trigger    │              │
│              │  3. Edge Function 실행:        │              │
│              │     - Facilitator 톤 체크      │              │
│              │       (경미 개입, 차단 아닌     │              │
│              │        경고 수준)              │              │
│              │  4. Realtime broadcast         │              │
│              └───────────────────────────────┘              │
│                                                             │
│  접근 제어:                                                  │
│  - friendship 테이블에서 양쪽 참여자 확인                     │
│  - friendship status = "active"인 경우에만 채널 접근 허용     │
│  - 친구 해제 시 채널 즉시 폐쇄 + 메시지 삭제                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. PII Scrubbing Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                  PII Scrubbing Pipeline                      │
│                                                             │
│  적용 지점: LLM API 호출 전 모든 사용자 생성 텍스트           │
│                                                             │
│  ┌───────────────┐                                          │
│  │  Raw User Text │                                         │
│  └───────┬───────┘                                          │
│          ▼                                                   │
│  ┌───────────────────────────────────────┐                  │
│  │  Stage 1: Regex-based Detection       │                  │
│  │                                       │                  │
│  │  - 이메일 주소 (xxx@xxx.xxx)          │                  │
│  │  - 전화번호 (010-XXXX-XXXX 등)        │                  │
│  │  - 주민등록번호 패턴                   │                  │
│  │  - URL                                │                  │
│  └───────────┬───────────────────────────┘                  │
│              ▼                                               │
│  ┌───────────────────────────────────────┐                  │
│  │  Stage 2: NER-based Detection         │                  │
│  │  (Named Entity Recognition)           │                  │
│  │                                       │                  │
│  │  - 인명 (한국어 + 영문)               │                  │
│  │  - 조직명 (회사, 학교, 기관)          │                  │
│  │  - 지명 (구체적 주소)                 │                  │
│  │                                       │                  │
│  │  경량 NER 모델 사용 (LLM 호출 아님)    │                  │
│  │  예: spaCy ko_core_news_lg            │                  │
│  └───────────┬───────────────────────────┘                  │
│              ▼                                               │
│  ┌───────────────────────────────────────┐                  │
│  │  Stage 3: Replacement                 │                  │
│  │                                       │                  │
│  │  감지된 PII를 일반화된 토큰으로 대체:  │                  │
│  │  "삼성전자" → "[회사명]"              │                  │
│  │  "김태환" → "[이름]"                  │                  │
│  │  "서울대학교" → "[학교명]"            │                  │
│  │  "010-1234-5678" → "[전화번호]"       │                  │
│  └───────────┬───────────────────────────┘                  │
│              ▼                                               │
│  ┌───────────────┐                                          │
│  │  Scrubbed Text │ → LLM API로 전송                        │
│  └───────────────┘                                          │
│                                                             │
│  로깅: 원본은 저장하지 않음. scrubbing 수행 여부만 기록.      │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Statistics Engine Architecture

### 7.1 Baseline 전환 로직

```
┌─────────────────────────────────────────────────────────────┐
│              Statistics Engine                                │
│                                                             │
│  getComparison(user_stance, filter):                        │
│                                                             │
│  ┌───────────────────────────────────────┐                  │
│  │  1. Real User Count Check             │                  │
│  │                                       │                  │
│  │  real_count = COUNT(stance_profiles   │                  │
│  │               WHERE filter matches)   │                  │
│  └───────────┬───────────────────────────┘                  │
│              │                                               │
│       ┌──────┴──────────────┬────────────────────┐          │
│       ▼                     ▼                    ▼          │
│  real_count < 50      50 ≤ count < 100     count ≥ 100     │
│       │                     │                    │          │
│       ▼                     ▼                    ▼          │
│  ┌──────────┐        ┌──────────┐         ┌──────────┐     │
│  │ External │        │  Blended │         │ App Data │     │
│  │ Baseline │        │   Mix    │         │   Only   │     │
│  │ Only     │        │          │         │          │     │
│  │          │        │ weighted │         │          │     │
│  │ KGSS /   │        │ average  │         │          │     │
│  │ 사회조사 │        │ of both  │         │          │     │
│  └──────────┘        └──────────┘         └──────────┘     │
│       │                     │                    │          │
│       ▼                     ▼                    ▼          │
│  Label:               Label:               Label:          │
│  "한국 사회조사       "사회조사 +           "앱 참여자       │
│   데이터 기준         앱 참여자 기준"       N명 기준"        │
│   (N=1,500)"                                               │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│                                                             │
│  2. Segment Filter + K-Anonymity                            │
│                                                             │
│  IF filter(age_group, gender, region) applied:              │
│    segment_count = COUNT(matching segment)                  │
│    IF segment_count < 15:                                   │
│      → 해당 필터 비활성화                                    │
│      → "아직 이 그룹의 참여자가 충분하지 않습니다"            │
│    ELSE:                                                    │
│      → 필터 적용된 통계 반환                                 │
│                                                             │
│  3. Percentile Calculation                                  │
│                                                             │
│  각 stance 축별로:                                           │
│  percentile = PERCENT_RANK(user_value)                      │
│               WITHIN distribution(filtered_group)            │
│                                                             │
│  4. Gap Analysis                                            │
│                                                             │
│  전체 vs 세그먼트 percentile 차이가 가장 큰 축을 추출        │
│  → Insight Agent에게 전달하여 자연어 인사이트 생성            │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Materialized View 갱신

```
stance_statistics Materialized View

갱신 전략:
- 새 stance_profile INSERT 시 → 즉시 갱신은 비효율
- Cron Job 기반 주기적 갱신: 매 6시간마다 REFRESH
- 사용자 수 500명 이하: 매 1시간마다 REFRESH (변화 체감 위해)
- 사용자 수 500명 이상: 매 6시간

Supabase pg_cron 활용:
SELECT cron.schedule('refresh_stats', '0 */6 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY stance_statistics');
```

---

## 8. LangSmith Observability

### 8.1 트레이싱 구조

```
┌─────────────────────────────────────────────────────────────┐
│              LangSmith Project Structure                     │
│                                                             │
│  perspectiveshift/                                          │
│  ├── onboarding                                             │
│  │   ├── trace: question_delivery                           │
│  │   ├── trace: adaptive_followup                           │
│  │   └── trace: micro_insight_generation                    │
│  │                                                          │
│  ├── extraction                                             │
│  │   ├── trace: qualitative_analysis                        │
│  │   ├── trace: vector_synthesis                            │
│  │   └── trace: type_classification                         │
│  │                                                          │
│  ├── facilitation                                           │
│  │   ├── trace: tone_check                                  │
│  │   ├── trace: reframe_suggestion                          │
│  │   └── trace: topic_drift_detection                       │
│  │                                                          │
│  ├── reflection                                             │
│  │   ├── trace: argument_extraction                         │
│  │   ├── trace: common_ground_detection                     │
│  │   ├── trace: blind_spot_identification                   │
│  │   ├── trace: summary_card_generation                     │
│  │   └── trace: understanding_score_evaluation              │
│  │                                                          │
│  └── insight                                                │
│      ├── trace: micro_insight_generation                    │
│      └── trace: statistics_narrative                        │
│                                                             │
│  각 Trace에 포함되는 메타데이터:                              │
│  - user_id (anonymized hash)                                │
│  - session_type: "onboarding" | "dialogue" | "reflection"   │
│  - model: "gpt-4o" | "gpt-4o-mini"                         │
│  - prompt_version: "v1.2"                                   │
│  - token_usage: {input, output, total}                      │
│  - latency_ms                                               │
│  - success: boolean                                         │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 핵심 모니터링 대시보드

```
┌─────────────────────────────────────────────────────────────┐
│              Key Monitoring Metrics                          │
│                                                             │
│  품질 메트릭:                                                │
│  ├── Stance extraction 일관성                                │
│  │   (같은 입력 3회 실행 시 vector 분산 < 0.05)              │
│  ├── Facilitator false positive rate                        │
│  │   (불필요한 톤 플래그 비율 < 10%)                          │
│  ├── Reflection 요약 정확도                                  │
│  │   (사용자 "이건 내 주장이 아닌데" 피드백 비율 < 5%)        │
│  └── Type classification 재현율                              │
│      (같은 vector → 같은 유형 분류 비율 > 95%)               │
│                                                             │
│  비용 메트릭:                                                │
│  ├── 온보딩 1회당 총 토큰 사용량 / 비용                      │
│  ├── 대화 세션 1회당 총 토큰 사용량 / 비용                   │
│  ├── Agent별 토큰 비율 (어디서 비용이 집중되는지)             │
│  └── 일별 / 주별 총 비용 추이                                │
│                                                             │
│  성능 메트릭:                                                │
│  ├── Agent별 평균 레이턴시                                   │
│  │   (Facilitator 톤 체크 < 1초 필수)                        │
│  ├── LLM API 실패율                                         │
│  ├── Timeout 발생률                                         │
│  └── 재시도 성공률                                           │
│                                                             │
│  사용자 행동 메트릭:                                         │
│  ├── 온보딩 단계별 이탈률 (어느 질문에서 이탈하는지)          │
│  ├── Facilitator 리프레이밍 수용률                            │
│  ├── 대화 완료율 (세션 시작 → 4단계 완료)                    │
│  └── Understanding Score 분포                                │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 알림 설정

```
Alert Rules:
├── LLM API 실패율 > 5% (5분간)      → Slack #ops-alert
├── Facilitator 레이턴시 > 3초 (p95)  → Slack #ops-alert  
├── 일일 비용 > $10 (MVP 기준)        → Email
├── Stance extraction 분산 > 0.1      → Slack #quality
└── 톤 체크 false positive > 20%      → Slack #quality
```

---

## 9. Error Handling & Fallback Strategy

```
┌─────────────────────────────────────────────────────────────┐
│              Error Handling Strategy                         │
│                                                             │
│  LLM API 호출 실패 시:                                       │
│                                                             │
│  ┌─────────────────────────────────────────────┐            │
│  │  Retry Policy                               │            │
│  │                                             │            │
│  │  1차 재시도: 1초 후 (같은 모델)             │            │
│  │  2차 재시도: 3초 후 (같은 모델)             │            │
│  │  3차 재시도: 5초 후 (fallback 모델로 전환)  │            │
│  │                                             │            │
│  │  Fallback 모델:                             │            │
│  │  GPT-4o 실패 → GPT-4o-mini로 전환          │            │
│  │  GPT-4o-mini 실패 → 캐시된 응답 사용        │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  Agent별 Fallback:                                          │
│                                                             │
│  Onboarding Agent 실패:                                     │
│  → 현재까지의 state 저장                                     │
│  → "잠시 문제가 발생했어요. 잠시 후 다시 시도해주세요"        │
│  → 재진입 시 마지막 state에서 재개                            │
│                                                             │
│  Facilitator 톤 체크 실패:                                   │
│  → 메시지를 그대로 전달 (fail-open)                          │
│  → 로그에 "unchecked" 플래그 기록                            │
│  → 이유: 사용자 경험을 차단하지 않기 위함                     │
│  → 사후 배치 분석으로 놓친 건 확인                            │
│                                                             │
│  Reflection Agent 실패:                                     │
│  → 대화 기록은 보존                                          │
│  → "요약을 생성하는 중 문제가 발생했어요. 곧 다시 시도합니다"│
│  → 백그라운드 재시도 (최대 3회)                               │
│  → 최종 실패 시: 간소화된 요약 (LLM 없이 메시지 하이라이트)  │
│                                                             │
│  Stance Extraction 실패:                                    │
│  → 정량 데이터 (OX + Rubric)만으로 4차원 벡터 생성 (degraded)│
│  → 서술형 분석은 백그라운드 재시도                            │
│  → 성공 시 6차원으로 업그레이드                               │
│                                                             │
│  Supabase 연결 실패:                                        │
│  → 읽기: 클라이언트 캐시에서 최근 데이터 표시                 │
│  → 쓰기: 로컬 큐에 저장 → 연결 복구 시 동기화                │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Security Architecture

### 10.1 전체 보안 레이어

```
┌─────────────────────────────────────────────────────────────┐
│                 Security Layers                              │
│                                                             │
│  Layer 1: Transport                                         │
│  ├── TLS 1.3 (모든 클라이언트-서버 통신)                      │
│  ├── WebSocket도 WSS (TLS over WebSocket)                    │
│  └── HSTS 헤더 설정                                          │
│                                                             │
│  Layer 2: Authentication                                    │
│  ├── OAuth 2.0 (Google, Kakao, Apple)                       │
│  ├── Supabase Auth (JWT 기반)                                │
│  ├── Access Token 만료: 1시간                                │
│  ├── Refresh Token 만료: 7일                                 │
│  └── 비밀번호 직접 저장 없음                                  │
│                                                             │
│  Layer 3: Authorization                                     │
│  ├── Supabase RLS (Row Level Security)                      │
│  ├── 모든 테이블에 RLS 정책 적용                              │
│  ├── API Route에서 추가 권한 검증                             │
│  └── 매칭 엔진: service_role key (서버 사이드 전용)           │
│                                                             │
│  Layer 4: Data Protection                                   │
│  ├── AES-256 encryption at rest (Supabase 기본)              │
│  ├── Stance vector ↔ User identity 분리 저장                 │
│  ├── PII Scrubbing Pipeline (LLM 전송 전)                    │
│  ├── 온보딩 원문 즉시 삭제                                    │
│  └── 대화 로그 90일 후 자동 삭제                              │
│                                                             │
│  Layer 5: API Security                                      │
│  ├── Rate Limiting (per user, per endpoint)                 │
│  │   ├── 온보딩: 1회/일                                     │
│  │   ├── 매칭 요청: 5회/시간                                │
│  │   ├── 메시지 전송: 60회/분                               │
│  │   └── 통계 조회: 30회/분                                 │
│  ├── Input Validation (zod schema)                          │
│  ├── CORS 설정 (허용 origin 제한)                            │
│  └── CSP (Content Security Policy) 헤더                     │
│                                                             │
│  Layer 6: Monitoring & Incident Response                    │
│  ├── LangSmith 기반 LLM 호출 전수 로깅                      │
│  ├── 이상 패턴 감지 (비정상 다량 요청 등)                     │
│  └── 보안 이벤트 Slack 알림                                  │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 API Key 관리

```
┌─────────────────────────────────────────────────────────────┐
│                 Secret Management                            │
│                                                             │
│  Vercel Environment Variables:                              │
│  ├── OPENAI_API_KEY              (서버 사이드 전용)          │
│  ├── LANGSMITH_API_KEY           (서버 사이드 전용)          │
│  ├── SUPABASE_SERVICE_ROLE_KEY   (서버 사이드 전용, 매칭용)  │
│  ├── NEXT_PUBLIC_SUPABASE_URL    (클라이언트 노출 가능)      │
│  └── NEXT_PUBLIC_SUPABASE_ANON_KEY (클라이언트, RLS로 보호)  │
│                                                             │
│  원칙:                                                      │
│  - NEXT_PUBLIC_ prefix가 없는 키는 절대 클라이언트에 노출 불가│
│  - OpenAI API Key는 API Route 내에서만 사용                  │
│  - Supabase service_role key는 매칭 엔진에서만 사용          │
│  - 주기적 키 로테이션 (90일 단위)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Deployment Topology                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Vercel                             │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────────────┐ │    │
│  │  │  Static  │  │   SSR     │  │  API Routes      │ │    │
│  │  │  Assets  │  │  Pages    │  │  (Serverless Fn)  │ │    │
│  │  │  (CDN)   │  │           │  │                  │ │    │
│  │  │          │  │  Thought  │  │  /api/onboarding │ │    │
│  │  │  CSS/JS  │  │  Map      │  │  /api/matching   │ │    │
│  │  │  Images  │  │  render   │  │  /api/dialogue   │ │    │
│  │  │          │  │           │  │  /api/friends    │ │    │
│  │  └──────────┘  └───────────┘  └──────────────────┘ │    │
│  │                                                     │    │
│  │  Edge Middleware:                                    │    │
│  │  - Auth check                                       │    │
│  │  - Rate limiting                                    │    │
│  │  - Geo routing (한국 리전 우선)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Supabase                           │    │
│  │                                                     │    │
│  │  Region: Northeast Asia (ap-northeast-1/2)          │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │PostgreSQL│  │ Realtime │  │     Auth         │  │    │
│  │  │          │  │          │  │                  │  │    │
│  │  │ Tables   │  │ WebSocket│  │ OAuth Providers  │  │    │
│  │  │ RLS      │  │ Channels │  │ JWT Management   │  │    │
│  │  │ MV       │  │          │  │                  │  │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────────────────────────────┐ │    │
│  │  │  Storage │  │      Edge Functions              │ │    │
│  │  │          │  │                                  │ │    │
│  │  │  공유    │  │  - 실시간 메시지 톤 체크 trigger │ │    │
│  │  │  카드    │  │  - 대화 로그 자동 삭제 cron     │ │    │
│  │  │  이미지  │  │  - MV refresh cron              │ │    │
│  │  └──────────┘  └──────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              External Services                       │    │
│  │                                                     │    │
│  │  OpenAI API ──── LLM 추론                           │    │
│  │  LangSmith ───── Agent 트레이싱                     │    │
│  │  Google OAuth ── 인증                               │    │
│  │  Kakao OAuth ─── 인증                               │    │
│  │  Apple OAuth ─── 인증                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Scalability Considerations

현재 MVP (50-500명)에서는 아래 항목이 불필요하지만, 스케일 시 대비할 아키텍처 결정을 미리 기록한다.

| 영역 | 현재 (MVP) | 스케일 시 |
|------|-----------|----------|
| 매칭 엔진 | 순차 탐색 (candidate pool 작음) | pgvector 기반 ANN 검색으로 전환 |
| 통계 집계 | Materialized View + cron refresh | 실시간 집계 또는 별도 analytics DB |
| 실시간 대화 | Supabase Realtime (내장) | 전용 WebSocket 서버 또는 Redis Pub/Sub |
| LLM 호출 | 동기 호출 | 큐 기반 비동기 처리 (BullMQ 등) |
| Agent 실행 | Vercel Serverless Function | 장기 실행 Agent는 별도 worker (Railway 등) |
| 파일 저장 | Supabase Storage | CDN + S3 호환 스토리지 |
| 검색 | PostgreSQL LIKE / 정규식 | Elasticsearch 또는 Supabase Full-text Search |

---

*문서 버전: v1.0*
*최종 수정: 2026.02.18*
*PerspectiveShift Architecture Team*