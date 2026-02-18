---
owner: "@agent"
status: active
last_reviewed: 2026-02-18
---

# Plan: Phase 2 Structured Dialogue Development

## 1. Goal
Phase 2의 핵심 가치인 "이견 기반 구조화 대화"를 운영 가능한 수준으로 구현한다.

구체 목표:
- Topic-level 매칭 엔진 구현 (opinion distance + readiness weighting)
- 4단계 비동기 Structured Dialogue 세션 구현 (입장 제시/질문/답변/reflection)
- LLM Facilitator 최소 개입 기능 구현 (톤 체크, 논점 이탈 감지, 리프레이밍)
- Post-Dialogue Feedback + Understanding Score + Summary Card 구현
- 품질 지표 수집/분석 루프 구축 (주간 threshold 튜닝 가능 상태)

## 2. Non-goals
- Phase 3 범위 기능 (친구 시스템, 실시간 채팅, 오프라인 만남)
- 음성/영상 대화
- 다국어/네이티브 앱 지원
- 커뮤니티 피드/고급 gamification

## 3. Scope Boundary
In Scope:
- 비동기 텍스트 기반 1:1 Structured Dialogue
- 주제 단위 매칭 제안/수락/재제안 플로우
- 대화 완료 후 피드백/요약 카드
- Phase 2 KPI 계측 파이프라인

Out of Scope:
- Friend graph 및 관계 에스컬레이션
- 실시간 websocket 채널 기반 채팅
- 오프라인 신원 검증/안전 기능

## 4. Preconditions (Phase 1 Gate)
본 계획 실행 전 확인 조건:
1. `specs/features/phase-2-structured-dialogue.spec.md` 작성/합의
2. 필요 시 ADR 추가:
   - `specs/decisions/ADR-001-dialogue-session-state-machine.md`
   - `specs/decisions/ADR-002-matching-score-calibration.md`
3. 데이터 저장소 설계 합의 (Supabase 스키마 + RLS)
4. OpenAI/LangSmith 키 운영 정책 확정 (`.env.example`만 저장)

## 5. Architecture Constraints (Must Keep)
- `arch-001`: Domain -> Application -> Infrastructure -> Presentation 의존성 강제
- `arch-002`: 인증/로깅/LLM/모니터링은 Provider 인터페이스를 통해 주입
- `arch-005`: Matching은 anonymized stance 데이터만 접근 (identity join 금지)
- `arch-006`: 사용자 텍스트의 모든 LLM 호출 전에 PII Scrubbing 필수
- `qual-001`: Domain/Application 신규 로직은 테스트 동반

## 6. Detailed Workstreams

### WS0. Spec and Decision Lock
목표:
- 구현 전 스펙/결정 고정으로 재작업 방지

실행:
1. 기능 스펙 작성: 입력/출력 DTO, 상태 전이, 실패 시나리오, KPI 정의
2. 상태 머신 ADR: step 전환 규칙, 타임아웃 정책(24h reminder, 48h expire)
3. 매칭 점수 ADR: `final_score = distance_fit * 0.6 + readiness * 0.4`
4. 프라이버시 설계 확인: identity/stance/dialogue 분리 원칙 문서화

산출물:
- `specs/features/phase-2-structured-dialogue.spec.md`
- `specs/decisions/ADR-001-dialogue-session-state-machine.md`
- `specs/decisions/ADR-002-matching-score-calibration.md`

완료 기준:
- 스펙 내 API 계약, 에러 계약, KPI 계산식까지 명시
- 리뷰 코멘트 0 또는 후속 TODO(#issue)로 해소

### WS1. Domain Modeling and Persistence
목표:
- Phase 2 도메인 객체와 저장 구조를 확정하고 추후 확장 가능성 확보

실행:
1. Domain 엔티티 정의:
   - MatchCandidate, MatchProposal, DialogueSession, DialogueTurn
   - DialogueFeedback, UnderstandingScore, SummaryCard
2. Value Object 정의:
   - OpinionDistance, ReadinessScore, DialogueStep, SessionStatus
3. DB 스키마 설계/마이그레이션:
   - `topics`, `stance_vectors`, `match_proposals`, `dialogue_sessions`
   - `dialogue_turns`, `dialogue_feedback`, `dialogue_summary_cards`
4. RLS 정책:
   - 대화 참여자 본인만 세션/턴/피드백 접근 가능
5. 인덱스:
   - topic + readiness + updated_at 기반 매칭 후보 조회 최적화

완료 기준:
- 마이그레이션 up/down 동작
- RLS 정책 테스트 통과
- domain 레이어 단위 테스트 작성

### WS2. Matching Engine (Topic-Level)
목표:
- "너무 가깝지도 멀지도 않은" 후보 추천 자동화

실행:
1. distance 계산 모듈 구현 (cosine distance)
2. sweet spot 필터 구현 (`0.4 <= distance <= 0.7`)
3. readiness 가중 정렬 구현
4. 제안 라이프사이클:
   - proposed -> accepted/rejected/expired
5. 수락 시 dialogue_session 자동 생성
6. 거절/만료 시 next-ranked 후보 재제안 큐 처리
7. 초기 N회 대화 사용자 대상 readiness 가중치 상향 옵션 플래그 적용

완료 기준:
- 매칭 서비스 단위 테스트: 경계값/동점/후보 없음 케이스 포함
- 통합 테스트: 제안 생성 -> 양측 수락 -> 세션 생성 검증

### WS3. Dialogue Session State Machine
목표:
- 4단계 대화 흐름을 예측 가능하고 복구 가능한 상태 머신으로 구현

실행:
1. Step 정의:
   - STEP_1_POSITION
   - STEP_2_QUESTION
   - STEP_3_ANSWER
   - STEP_4_REFLECTION
2. 전이 규칙:
   - 양측 제출 완료 전까지 다음 단계 잠금
3. 타임아웃 정책:
   - 24시간 리마인더
   - 48시간 무응답 시 expired
4. 중복 제출/수정 가능 윈도우 정의
5. idempotent API 설계 (재요청 시 중복 저장 방지)

완료 기준:
- 상태 전이 테스트(정상/비정상) 100%
- expire/recovery 시나리오 E2E 테스트 통과

### WS4. Facilitator and Safety Pipeline
목표:
- 대화 품질 저하를 줄이되 과도한 검열 없이 최소 개입

실행:
1. PII Scrubber 구성:
   - regex stage (email/phone/url 등)
   - NER stage (인명/조직/지명)
   - 치환 stage (`[이름]`, `[회사명]` 등)
2. 톤 체크 정책:
   - 공격성 점수 임계치 초과 시 재작성 제안
3. 논점 이탈 감지:
   - 세션 주제 대비 편차 탐지 후 리다이렉트 문구 제공
4. Structured Dialogue Technique 프롬프트:
   - "상대 주장 재진술" 유도

완료 기준:
- LLM 호출 경로 100%에서 scrubber 선행 보장
- 톤 체크 false-positive 모니터링 지표 수집

### WS5. Reflection, Feedback, Summary Card
목표:
- 대화 이후 학습 효과와 재참여 유인을 데이터화

실행:
1. Guided Reflection 템플릿 고정
2. Feedback 폼:
   - 만족도(1~5)
   - 재매칭 의향
   - 감정 체크인
3. Understanding Score 계산:
   - 사용자 요약 vs 상대 실제 주장 유사도 평가
4. Summary Card 생성:
   - 핵심 주장/공통점/미해결 질문/blind spot

완료 기준:
- 피드백 저장/조회 API 및 테스트 통과
- Summary Card 스키마 검증 + 생성 실패 fallback 정의

### WS6. Presentation/API Integration
목표:
- 사용자 플로우를 끊김 없이 연결

실행:
1. API 라우트 구현:
   - 매칭 제안 조회/수락/거절
   - 세션 조회/턴 제출/리마인더 상태 확인
   - 피드백 제출/요약 카드 조회
2. UI 플로우 구현:
   - 매칭 수락 화면
   - 단계별 대화 화면
   - 완료 후 피드백 및 요약 카드 화면
3. 접근 제어:
   - 세션 참여자 검증
   - 만료 세션 쓰기 차단
4. 에러 UX:
   - 만료/중복 제출/권한 없음 케이스 명시

완료 기준:
- 핵심 사용자 여정 E2E 3종 통과
- 모바일 뷰포트(최소 390px) 동작 확인

### WS7. Observability, Eval, and Tuning Loop
목표:
- 대화 품질을 주간 단위로 개선할 수 있는 관측 체계 확보

실행:
1. 구조화 로깅 이벤트 정의:
   - match_proposed, match_accepted, step_completed, session_expired, feedback_submitted
2. LangSmith trace 연결:
   - facilitator/reflection 요청 단위 trace id 저장
3. eval 세트 구축:
   - `evals/golden/phase-2/`
   - `evals/regression/phase-2/`
4. 주간 리포트 템플릿:
   - distance 구간별 만족도
   - readiness 구간별 완료율
   - 톤 체크 개입률/수용률
5. threshold 튜닝 프로세스:
   - 0.4~0.7 시작, 주 1회 업데이트

완료 기준:
- `./tools/ci` 통과
- 주간 리포트 샘플 1회 생성 성공

### WS8. Release and Phase Gate
목표:
- 기능 완성뿐 아니라 운영 가능 상태까지 검증

실행:
1. 내부 베타(10~20명)에서 phase2 플로우 검증
2. 안전 이슈 대응 runbook 작성
3. KPI 측정 기간 운영 (최소 2주)
4. Go/No-Go 판정

Phase 2 Exit KPI (Phase 3 진입 조건):
- 대화 완료율 > 50%
- 대화 만족도 > 3.5 / 5
- 재매칭 의향률 > 35%

완료 기준:
- KPI 기준 충족 또는 미달 원인/개선안 문서화

## 7. Commit-Level Task Breakdown
아래 항목은 "1 커밋 = 1 의미 단위" 원칙으로 분리한다.

1. Phase 2 스펙 문서 작성
2. 상태 머신 ADR 작성
3. 매칭 점수 ADR 작성
4. Domain 엔티티/값 객체 추가
5. DB 마이그레이션 + RLS 정책 추가
6. 매칭 거리 계산 모듈 + 테스트
7. 매칭 제안 서비스 + 테스트
8. 세션 상태 머신 구현 + 테스트
9. 턴 제출 API + 유효성 검증
10. PII scrubber 구현 + 테스트
11. facilitator provider 연동
12. reflection/summary provider 연동
13. feedback + understanding score 구현
14. summary card 저장/조회 API
15. 매칭/대화 UI 화면 구현
16. E2E 시나리오 테스트 추가
17. eval golden/regression 세트 추가
18. 운영 리포트 템플릿/문서 추가
19. `./tools/doctor` + `./tools/ci` 통과
20. Plan 문서 status 업데이트 후 handoff

## 8. Expected Change Files
핵심 변경 예상 경로:

문서:
- `specs/features/phase-2-structured-dialogue.spec.md`
- `specs/decisions/ADR-001-dialogue-session-state-machine.md`
- `specs/decisions/ADR-002-matching-score-calibration.md`
- `docs/plans/active/001-phase-2-structured-dialogue.md`

Domain/Application:
- `src/domain/dialogue/*`
- `src/domain/stance/*`
- `src/application/use-cases/*`
- `src/application/ports/*`
- `src/application/dtos/*`

Infrastructure:
- `src/infrastructure/persistence/*`
- `src/infrastructure/external/openai/*`
- `src/infrastructure/external/langsmith/*`
- `src/infrastructure/config/*`

Presentation/API:
- `src/app/api/matching/*/route.ts`
- `src/app/api/dialogue/*/route.ts`
- `src/app/(dialogue)/*`
- `src/app/(matching)/*`

Eval/Test:
- `test/unit/*`
- `test/integration/*`
- `test/e2e/*`
- `evals/golden/phase-2/*`
- `evals/regression/phase-2/*`

데이터/운영:
- `supabase/migrations/*`
- `scripts/reports/phase-2-metrics.ts`

## 9. Risky Operations
고위험 작업과 대응:

1. DB 스키마 및 RLS 변경
- 위험: 데이터 접근권한 오설정
- 대응: migration review + 정책 테스트 + 샘플 계정 검증

2. LLM 품질/비용 변동
- 위험: 요약 품질 불안정, 비용 급증
- 대응: 프롬프트 버전 고정, 토큰 상한, 실패 fallback 템플릿

3. Tone check 과민 반응
- 위험: 사용자 피로/검열 인식
- 대응: 차단보다 "제안" 중심, false-positive 모니터링

4. 매칭 품질 미달
- 위험: 수락률/완료율 하락
- 대응: readiness weight 조정 실험, threshold 주간 튜닝

5. PII scrub 누락
- 위험: 개인정보 유출
- 대응: LLM 호출 래퍼 단일화 + scrub 필수 assertion + 회귀 테스트

## 10. Definition of Done
기술 DoD:
- Phase 2 핵심 유스케이스 단위/통합/E2E 테스트 통과
- `./tools/doctor` 통과
- `./tools/ci` 통과
- LLM 호출 경로에서 PII scrub 선행 검증 통과

제품 DoD:
- 매칭 제안 -> 수락 -> 4단계 대화 -> 피드백 -> 요약 카드 플로우 완주 가능
- 운영 로그로 완료율/만족도/재매칭 의향 추적 가능

운영 DoD:
- 주간 튜닝 리포트 생성 가능
- 장애/안전 이슈 대응 runbook 작성 완료

## 11. Rollback Strategy
원칙:
- 기능 플래그 기반 단계적 비활성화
- 데이터 손실 없는 다운그레이드 우선

롤백 절차:
1. 매칭 제안 API 비활성화 (`FEATURE_MATCHING=false`)
2. 신규 세션 생성 차단, 기존 active 세션 read-only 전환
3. facilitator/reflection 호출 fallback 템플릿 모드로 전환
4. 심각 이슈 시 phase2 UI entry 제거 후 waitlist 화면 대체
5. DB 롤백 필요 시 down migration 실행 (사전 백업 필수)

롤백 성공 기준:
- 기존 Phase 1 기능 정상 동작
- active 세션 데이터 무결성 보존
- 에러율이 기준치 이하로 복귀

## 12. Status Log (Append-only)
- 2026-02-18: Plan 초안 작성 (Phase 2 상세 실행계획)
- 2026-02-18: 사용자 요청 기준으로 Workstream/Commit 단위 상세화
