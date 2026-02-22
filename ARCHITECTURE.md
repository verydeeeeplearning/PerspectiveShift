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
| `src/app/` | Presentation (UI/API) | React 컴포넌트, API Route 핸들러 | 모든 레이어 (단, Domain 직접 접근 금지) |

### 교차 관심사 (Cross-Cutting Concerns)
교차 관심사는 **Providers** 인터페이스를 통해서만 진입한다:
- 인증 (Auth) — Supabase Auth
- 로깅 (Logging) — 구조화된 JSON 로거
- LLM 호출 (LLM Provider) — OpenAI API 추상화
- 모니터링 (Observability) — LangSmith

## 3. 도메인 경계

| 도메인 | 책임 | 외부 의존성 |
|--------|------|------------|
| Identity | 사용자 인증, 프로필, 프라이버시 레벨 | Supabase Auth |
| Stance | Stance Vector, Thought Map, 유형 분류 | OpenAI (via LLM port) |
| Dialogue | 구조화 대화, 매칭, Facilitation | OpenAI (via LLM port) |
| Relationship | 친구 시스템, 라이트 프로토콜, 실시간 채팅, 오프라인 만남 | Supabase Realtime |
| Safety | 피로 감지, 쿨다운, 일일 한도, 설득 방지 | — |

## 4. Domain Model Summary

> 상세 엔티티/VO/인터페이스 목록은 [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) 참조.

| 항목 | 수량 |
|------|------|
| Entities | 35 |
| Value Objects | 82 |
| Repository Interfaces (Port) | 19 |
| Service Interfaces (Port) | 15 |
| Domain Services | 2 |
| Domain Errors | 35 classes |
| Analytics Events | 70+ types |

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

주요 ADR은 git history의 계획 문서들에 기록되어 있음.

## 7. 현재 상태

| 레이어 | 파일 수 | 라인 수 |
|--------|---------|---------|
| Domain | ~155 | 6,895 |
| Application | ~135 | 6,009 |
| Infrastructure | ~55 | 5,635 |
| Presentation | ~195 | 13,995 |
| **프로덕션 합계** | **~540** | **32,534** |
| Tests | ~1,970 (370 files) | 26,573 |

> 최종 업데이트: 2026-02-22. 상세 현황은 [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) 참조.
