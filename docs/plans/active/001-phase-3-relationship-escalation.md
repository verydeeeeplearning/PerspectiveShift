---
owner: "@agent"
status: active
last_reviewed: 2026-02-18
---

# Plan: Phase 3 — Relationship Escalation

## Goal
- Phase 2의 구조화된 대화 결과를 일회성 세션으로 끝내지 않고, 상호 신뢰를 기반으로 `친구 관계 → 실시간 대화 → 오프라인 만남`으로 확장 가능한 제품/기술 구조를 구축한다.
- Privacy by Design, Anonymity by Default, PII Scrubbing을 유지한 상태에서 관계 전환율과 30일 유지율을 측정 가능한 수준으로 만든다.

## Non-goals
- 음성/영상 실시간 대화 구현
- 공개 커뮤니티 피드/UGC 추천 시스템
- 대규모 랭킹/게이미피케이션 확장
- 자동 매치메이킹 고도화(추천 엔진 정교화)는 별도 계획에서 처리

## Background / Problem Statement
- 현재 레포는 Next.js 기본 스캐폴드 상태이며, Phase 3 기능에 필요한 도메인/데이터/API/UI 계층이 미구축 상태다.
- 제품 가설 H5(관계 전환) 검증을 위해서는 최소한 아래가 필요하다.
- 구조화 대화 완료 후 비대칭 부담 없는 친구 요청
- 친구 관계 기반 실시간 텍스트 채팅
- 단계적 공개(Level 0-3)와 안전 장치
- 오프라인 전환 시 검증/신고/차단/안전 확인 플로우
- 계측 가능한 이벤트/퍼널/회귀 테스트

## Scope
### In-scope
- Friend System 도메인 모델 및 유스케이스 구현
- Relationship 공개 레벨(Level 0-3) 전환 정책 구현
- 친구 기반 Realtime Chat(텍스트) 구현
- 오프라인 만남 제안/참여 의향/안전 확인 기능 구현
- 신고/차단/안전 운영 도메인 구축
- Phase 3 핵심 메트릭 계측 및 대시보드용 집계 경로 구성
- 테스트(단위/통합/E2E 스모크) + eval 회귀 세트 추가

### Out-of-scope
- 실제 결제/유료 기능
- 외부 이벤트 운영 시스템(파트너 연동)
- 신원 인증 벤더 고도화(서드파티 KYC)

## Prerequisites (Spec-first Gate)
- `specs/features/phase-3-relationship-escalation.spec.md` 작성 및 승인
- 데이터 구조 변경 시 `specs/decisions/ADR-001-phase-3-data-boundaries.md` 작성
- 안전 정책 세부 확정 시 `docs/domain-guides/safety-operations.md` 추가
- 오프라인 기능 정책은 POLICIES 및 Constitution D1-D4와 충돌 여부 검토

## Architecture Constraints (Must Keep)
- `ARCH-001`: Domain → Application → Infrastructure → Presentation 의존성 방향 준수
- `ARCH-005`: Identity / Stance / Dialogue / Relationship 데이터 경계 유지, direct join 금지
- `ARCH-006`: LLM 연동 지점은 반드시 PII Scrubbing 파이프라인 선행
- `QUAL-001`: 신규 유스케이스/유틸리티 테스트 필수
- `D2`: 기본 익명, 공개는 사용자 동의 기반

## Assumptions
- 인증은 Supabase Auth를 사용하며 사용자 기본 식별자는 UUID
- 실시간 인프라는 Supabase Realtime 기반
- 초기 런칭은 소규모 베타 네트워크이며 운영자 수동 개입(신고 처리)이 가능
- Phase 2에서 구조화 대화 완료 이벤트가 정상적으로 발행된다고 가정

## Deliverables
- 기능 스펙 1건 + ADR 1건 이상
- Relationship 도메인 코드(친구, 공개 레벨, 채팅, 오프라인, 안전)
- API Routes + DB migration + RLS 정책
- Phase 3 화면(친구 목록, 친구 상세, 실시간 채팅, 신고/차단, 오프라인 제안)
- 이벤트 계측 + 운영 리포트 쿼리
- 테스트/회귀 세트 + 문서 업데이트

## Steps
1. WS0 Planning & Spec Hardening
2. WS1 Domain Modeling (Relationship)
3. WS2 Data Model & Migration
4. WS3 API & Realtime Integration
5. WS4 Presentation (UX Flows)
6. WS5 Safety & Abuse Control
7. WS6 Observability & Metrics
8. WS7 QA / Eval / Release

## Workstreams

### WS0. Planning & Spec Hardening
#### Objective
- 구현 전 의사결정 고정 및 리스크 노출

#### Tasks
1. 기능 스펙 작성 (`specs/features/phase-3-relationship-escalation.spec.md`)
2. 데이터 경계 ADR 작성 (`specs/decisions/ADR-001-phase-3-data-boundaries.md`)
3. KPI 정의 확정 (요청률/수락률/전환률/유지율)
4. 정책 체크리스트 작성 (익명성, 신고, 차단, 보관기간)

#### Exit Criteria
- 스펙/ADR 리뷰 완료
- 사용자 시나리오(정상/예외/악성) 합의 완료

### WS1. Domain Modeling (Relationship)
#### Objective
- Phase 3의 핵심 상태 전이를 도메인 객체로 명확화

#### Tasks
1. 엔티티 정의
- `FriendRequest` (PENDING/ACCEPTED/DECLINED/SILENT_REJECTED)
- `Friendship` (ACTIVE/UNMATCHED/BLOCKED)
- `DisclosureLevel` (0-3, 비대칭 허용)
- `RealtimeSession` (OPEN/CLOSED)
- `OfflineMeetingIntent` (PROPOSED/CONFIRMED/CANCELLED)
- `SafetyReport` (OPEN/REVIEWING/RESOLVED)
2. 유스케이스 정의
- `requestFriendship`, `acceptFriendshipSilently`, `listFriendships`
- `updateDisclosureLevel`, `openRealtimeSession`
- `sendRealtimeMessage`, `createOfflineProposal`
- `submitSafetyReport`, `blockUser`, `unfriend`
3. 불변 조건 정의
- 상호 친구 성립은 양측 동의시에만
- 실시간 오픈 조건: 구조화 대화 2회 이상 완료
- 오프라인 제안 조건: 실시간 3회 + Level 2 이상

#### Exit Criteria
- Domain/Application 계층 타입 및 규칙 테스트 통과

### WS2. Data Model & Migration
#### Objective
- 상태 전이를 안전하게 저장하고 RLS로 보호

#### Tasks
1. 테이블 설계
- `friend_requests`
- `friendships`
- `friend_disclosures`
- `realtime_messages`
- `realtime_receipts`
- `offline_meeting_proposals`
- `safety_reports`
- `user_blocks`
2. 인덱스/제약
- 유니크: 동일 쌍 중복 friend request 제한
- 체크: disclosure level 0-3 범위
- FK: 삭제 시 CASCADE/RESTRICT 정책 정의
3. RLS 정책
- 본인 관계 데이터만 조회 가능
- 친구 상태 ACTIVE일 때만 메시지 INSERT/SELECT 허용
- 차단 관계에서는 채팅/요청 전부 차단
4. 감사 로그
- 신고/차단/해제 이벤트 별도 audit 테이블 기록

#### Exit Criteria
- Migration 적용/롤백 검증
- RLS 정책 테스트 통과

### WS3. API & Realtime Integration
#### Objective
- 프론트/백엔드/리얼타임을 일관된 계약으로 연결

#### Tasks
1. API Route 설계/구현
- `POST /api/relationship/friend-request`
- `POST /api/relationship/friend-request/{id}/accept`
- `GET /api/relationship/friends`
- `POST /api/relationship/disclosure-level`
- `POST /api/realtime/session/open`
- `POST /api/realtime/message`
- `POST /api/offline/proposals`
- `POST /api/safety/report`
- `POST /api/relationship/block`
2. 입력 검증
- 모든 경계에서 Zod 스키마 검증 (`ARCH-003`)
3. Realtime 채널
- 채널 키: `chat:{friendship_id}`
- 이벤트: message, typing, read-receipt, moderation-warning
4. 메시지 처리
- 저장 전 정책 검증 (친구 상태/차단 여부/레이트 리밋)
- 필요 시 톤 경고 이벤트 발행 (차단이 아닌 경미 개입)

#### Exit Criteria
- API contract 테스트 + Realtime 양방향 수신 테스트 통과

### WS4. Presentation (UX Flows)
#### Objective
- 전환 퍼널을 방해하지 않는 최소 마찰 UX 제공

#### Tasks
1. 화면 추가
- 친구 요청 CTA(대화 종료 화면)
- 친구 목록 페이지
- 친구 상세(공개 레벨, 대화 히스토리 진입)
- 실시간 채팅 페이지
- 오프라인 만남 제안/응답 페이지
- 신고/차단 UI + 안전 안내
2. UX 규칙 반영
- 단방향 요청은 상대에게 노출하지 않음 (silent reject)
- 공개 레벨 변경은 명시적 동작으로만 반영
- 만남 기능은 조건 충족 전 비활성 + 이유 노출
3. 접근성/국제화 준비
- 키보드 내비게이션, ARIA role 보강
- UI 텍스트 분리(ko 기본, i18n 확장 대비)

#### Exit Criteria
- 핵심 5개 사용자 플로우 E2E 스모크 통과

### WS5. Safety & Abuse Control
#### Objective
- 악성 행위 대응 및 사용자 보호 체계 구축

#### Tasks
1. 차단 정책
- 차단 즉시 채팅 채널 폐쇄
- 기존 친구 관계 상태 BLOCKED 전환
2. 신고 정책
- 신고 사유 표준화(괴롭힘/위협/개인정보요구/사칭/기타)
- 신고 접수 시 자동 티켓 생성
3. 레이트 리밋
- 메시지 폭주/친구요청 스팸 제한
4. 오프라인 안전 체크
- 만남 후 24시간 내 안전 확인 알림
- 미응답/위험 응답 시 운영자 검토 큐 등록

#### Exit Criteria
- 악성 시나리오 테스트(스팸, 차단 우회, 신고 남용) 통과

### WS6. Observability & Metrics
#### Objective
- Go/No-Go 지표를 실시간에 가깝게 추적

#### Core Metrics
- 대화 후 친구 요청률
- 친구 요청 상호 수락률
- 친구 중 실시간 대화 전환율
- 실시간 유저 중 오프라인 제안 전환율
- 친구 관계 30일 유지율

#### Events
- `friend_request_sent`
- `friend_request_mutual_accepted`
- `friendship_created`
- `realtime_session_opened`
- `realtime_message_sent`
- `offline_proposal_created`
- `offline_proposal_confirmed`
- `user_blocked`
- `safety_report_submitted`

#### Tasks
1. 이벤트 스키마 정의 + 타입 안전 래퍼 구현
2. 일별 집계 쿼리/뷰 생성
3. 운영 대시보드용 export 경로 정의
4. 퍼널 드롭오프 분석 리포트 자동 생성(주 1회)

#### Exit Criteria
- 주간 리포트에서 5개 핵심 KPI 산출 가능

### WS7. QA / Eval / Release
#### Objective
- 회귀 없는 배포 및 점진적 런칭

#### Tasks
1. 테스트 전략
- 단위: 도메인 규칙/정책
- 통합: API + DB + RLS
- E2E: 친구요청→실시간→신고/차단 시나리오
2. eval 등록
- `evals/regression/phase-3-relationship/` 케이스 추가
- 안전/프라이버시 실패 케이스 골든화
3. 배포 전략
- 내부 베타(10-20명) → 제한 베타(50-100명) → 공개 베타
4. 검증 루프
- `./tools/doctor` → `./tools/ci` 반복 통과

#### Exit Criteria
- CI clean + 베타 전환 승인

## Planned File Changes
### New Files (planned)
- `specs/features/phase-3-relationship-escalation.spec.md`
- `specs/decisions/ADR-001-phase-3-data-boundaries.md`
- `docs/domain-guides/safety-operations.md`
- `src/domain/relationship/entities/friend-request.ts`
- `src/domain/relationship/entities/friendship.ts`
- `src/domain/relationship/entities/disclosure-level.ts`
- `src/domain/relationship/entities/safety-report.ts`
- `src/application/relationship/use-cases/request-friendship.ts`
- `src/application/relationship/use-cases/accept-friendship.ts`
- `src/application/relationship/use-cases/update-disclosure-level.ts`
- `src/application/relationship/use-cases/open-realtime-session.ts`
- `src/application/relationship/use-cases/create-offline-proposal.ts`
- `src/infrastructure/supabase/relationship-repository.ts`
- `src/infrastructure/realtime/chat-channel.ts`
- `src/infrastructure/moderation/tone-warning-service.ts`
- `src/presentation/api/relationship/friend-request/route.ts`
- `src/presentation/api/relationship/disclosure-level/route.ts`
- `src/presentation/api/realtime/message/route.ts`
- `src/presentation/api/offline/proposals/route.ts`
- `src/presentation/api/safety/report/route.ts`
- `src/app/(phase3)/friends/page.tsx`
- `src/app/(phase3)/friends/[friendshipId]/page.tsx`
- `src/app/(phase3)/chat/[friendshipId]/page.tsx`
- `src/app/(phase3)/offline/page.tsx`
- `src/app/(phase3)/safety/report/page.tsx`
- `src/test/relationship/request-friendship.test.ts`
- `src/test/relationship/disclosure-level.test.ts`
- `src/test/relationship/realtime-guard.test.ts`
- `evals/regression/phase-3-relationship/friend-request-mutual.json`
- `evals/regression/phase-3-relationship/blocking-flow.json`
- `supabase/migrations/20260218_phase3_relationship.sql`

### Existing Files to Update (planned)
- `ARCHITECTURE.md` (Phase 3 흐름/경계 반영)
- `specs/environment.spec.md` (필수 경로 추가 시 반영)
- `evals/eval-config.yaml` (회귀 세트 등록)
- `tools/doctor` (필수 파일 체크 확장 필요 시)

## Detailed Task Breakdown (commit-sized)
1. Phase 3 spec + ADR 작성
2. Relationship domain types/enum/guards 작성
3. Friend request use-case + 단위 테스트
4. Friendship state transition + 단위 테스트
5. Disclosure level 정책 + 단위 테스트
6. DB migration + RLS + 통합 테스트
7. Friend API routes + contract 테스트
8. Realtime infra adapter + 채널 접근 제어
9. Realtime message API + moderation warning hook
10. Friends list/detail UI + 상태 표시
11. Chat UI + typing/read receipt
12. Offline proposal UI/API + 조건 가드
13. Safety report + block flow + 운영 로깅
14. Metric events + 집계 쿼리 + 리포트 스크립트
15. E2E smoke + regression eval + CI 정리

## Timeline (recommended)
- Week 1: WS0, WS1
- Week 2: WS2
- Week 3: WS3 (friend + disclosure API)
- Week 4: WS3 (realtime) + WS4 일부
- Week 5: WS4 완료 + WS5
- Week 6: WS6 + WS7 + 베타 롤아웃

## Dependencies
- Supabase 프로젝트/키/Realtime 활성화
- 환경변수 세팅 (`.env.example` 기준 placeholder 유지)
- Phase 2 대화 완료 이벤트 소스
- 운영자 알림 채널(신고 triage)

## Risks
- R1. 실시간 메시지 악용(스팸/괴롭힘) 가능성
- R2. 공개 레벨 동의 UX 혼선으로 신뢰 저하
- R3. RLS 정책 누락 시 데이터 노출 위험
- R4. 오프라인 제안 기능에서 안전 이슈 발생
- R5. 소규모 유저 풀로 KPI 변동성 과대

## Mitigations
- M1. 레이트 리밋 + 차단 즉시 반영 + 신고 SLA 운영
- M2. 공개 레벨 변경 UI에 명확한 상태/영향 문구 제공
- M3. RLS 테스트를 CI 필수 게이트로 설정
- M4. 그룹 만남 우선 정책 + 안전 체크인 자동화
- M5. 지표를 절대값과 신뢰구간으로 함께 해석

## Rollback Plan
- 기능 플래그 단위로 단계적 롤백
- 순서: 오프라인 기능 OFF → 실시간 기능 OFF → 친구 요청 기능 유지
- DB rollback은 destructive migration 회피, soft-disable 컬럼 우선
- 신고/차단 데이터는 롤백 중에도 유지(안전 로그 보존)

## Definition of Done
- 기능: 친구 요청/상호 수락/친구 목록/해제/차단 동작 완료
- 기능: 공개 레벨 0-3 전환 및 비대칭 노출 동작 완료
- 기능: 친구 관계 기반 실시간 채팅 동작 완료
- 기능: 오프라인 제안 조건 검증 동작 완료
- 안전: 신고/차단/레이트 리밋 시나리오 동작 완료
- 안전: 악성 시나리오 회귀 테스트 통과
- 품질: 단위/통합/E2E 스모크 통과
- 품질: `./tools/doctor` 통과
- 품질: `./tools/ci` 통과
- 측정: Phase 3 핵심 KPI 5종 산출 가능

## Status Log (append-only)
- 2026-02-18: Phase 3 상세 계획 문서 초안 작성
- 2026-02-18: WS0~WS7, 파일 변경 목록, 위험/롤백/DoD 정의 완료
