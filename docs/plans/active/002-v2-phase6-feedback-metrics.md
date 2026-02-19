# V2-P6: Feel Heard Score + Affective Warmth + Receptiveness Points + 1주 후 체크인

**Status**: Pending
**Started**: -
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P5 (Perspective Exchange — 수용성 템플릿, Reflection)

---

## Overview

### Feature Description

Post-Dialogue Feedback을 v2 3층 KPI 프레임워크(경험/인지/정서)에 맞게 확장한다:

1. **Feel Heard Score** (1-5): "상대가 내 말을 제대로 이해했다고 느꼈나요?" — 재접촉의 핵심 매개변수
2. **Affective Warmth** (0-10): "이 대화 상대에 대한 호감/온도" — 정서적 양극화 변화 측정
3. **Receptiveness Points**: 수용성 템플릿 채택, Feel Heard Score 획득 등 '좋은 대화 기술' 추적
4. **1주 후 재측정 체크인**: "다른 의견 대화에 대한 회피감이 줄었나요?" + 재매칭 행동 지표

### Success Criteria

- [ ] `DialogueFeedback` entity에 `feelHeardScore`, `affectiveWarmth` 필드 추가
- [ ] Feedback UI에 Feel Heard Score (1-5), Affective Warmth (0-10) 입력 추가
- [ ] `ReceptivenessScore` VO: 사용자별 누적 수용성 점수 추적
- [ ] 수용성 템플릿 채택 → 점수 가산 로직
- [ ] Feel Heard Score 수신 → 점수 가산 로직
- [ ] 1주 후 체크인 알림 + 간단 설문 UI
- [ ] 행동 지표 추적 (재매칭 클릭/대기열 진입)

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `DialogueFeedback` 수정, `ReceptivenessScore` VO, `FollowUpCheckin` entity | 피드백 모델 확장 |
| Application | `SubmitFeedbackUseCase` 수정, `UpdateReceptivenessUseCase`, `ScheduleFollowUpUseCase`, `SubmitFollowUpCheckinUseCase` | 워크플로 |
| Infrastructure | Repository 수정, 스케줄러 (1주 후 알림) | 저장, 알림 |
| Presentation | Feedback UI 확장, 체크인 UI, 수용성 대시보드 | UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| `DialogueFeedback`에 필드 추가 (별도 entity 아님) | 같은 생명주기, 같은 수집 타이밍 | entity 커짐 |
| `ReceptivenessScore`를 사용자별 누적 VO로 | Competence 동기 (Layer 2) 강화용 | 별도 저장 필요 |
| 1주 후 체크인을 별도 entity로 | 별도 생명주기, 스케줄링 필요 | 복잡도 증가 |
| 행동 지표는 기존 EventTracker 재사용 | 인프라 추가 없음 | 이벤트 타입만 추가 |

---

## Implementation Phases

### Sub-Phase 6.1: Domain Layer — Feedback 확장 & ReceptivenessScore
**Goal**: Feel Heard, Affective Warmth, Receptiveness 도메인 모델

#### RED: Write Failing Tests First
- [ ] Test 6.1.1: `DialogueFeedback` — 새 필드 추가 테스트
  - File: `test/unit/domain/entities/dialogue-feedback.test.ts` 수정
  - `feelHeardScore: number` (1-5, 필수)
  - `affectiveWarmth: number` (0-10, 필수)
  - 유효 범위 밖 입력 시 에러
  - 기존 필드(만족도, 재매칭 의향 등) 유지
  - Expected: Tests FAIL

- [ ] Test 6.1.2: `ReceptivenessScore` VO 테스트
  - File: `test/unit/domain/value-objects/receptiveness-score.test.ts`
  - `totalPoints: number` (누적)
  - `templateAdoptions: number` (템플릿 채택 횟수)
  - `feelHeardReceived: number` (상대로부터 받은 Feel Heard 고득점 횟수)
  - `percentile?: number` (상위 N% — 계산 로직은 Application)
  - `addTemplateAdoption()` → 점수 가산
  - `addFeelHeardBonus(score)` → score >= 4 시 보너스 가산
  - Expected: Tests FAIL

- [ ] Test 6.1.3: `FollowUpCheckin` entity 테스트
  - File: `test/unit/domain/entities/follow-up-checkin.test.ts`
  - `dialogueSessionId: string`
  - `scheduledAt: Date` (대화 1주 후)
  - `avoidanceReduction: number | null` (1-5)
  - `completedAt: Date | null`
  - `isExpired()` (2주 후 만료)
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 6.1.4: `DialogueFeedback` 수정
  - File: `src/domain/entities/dialogue-feedback.ts`
  - `feelHeardScore`, `affectiveWarmth` 필드 추가

- [ ] Task 6.1.5: `ReceptivenessScore` VO 구현
  - File: `src/domain/value-objects/receptiveness-score.ts`

- [ ] Task 6.1.6: `FollowUpCheckin` entity 구현
  - File: `src/domain/entities/follow-up-checkin.ts`

- [ ] Task 6.1.7: `FollowUpCheckinRepository` 인터페이스
  - File: `src/domain/interfaces/follow-up-checkin-repository.ts`

#### Quality Gate
- [ ] Domain 외부 의존성 없음
- [ ] 기존 DialogueFeedback 테스트 호환

---

### Sub-Phase 6.2: Application Layer — Use Cases
**Goal**: Feedback 제출, Receptiveness 업데이트, 체크인 스케줄링

#### RED: Write Failing Tests First
- [ ] Test 6.2.1: `SubmitFeedbackUseCase` 수정 — 새 필드 포함
  - File: `test/unit/application/use-cases/submit-feedback.test.ts` 수정
  - Feel Heard Score + Affective Warmth 입력 검증
  - 제출 후 상대방의 ReceptivenessScore 갱신 (Feel Heard 보너스)
  - Expected: Tests FAIL

- [ ] Test 6.2.2: `UpdateReceptivenessUseCase` 테스트
  - File: `test/unit/application/use-cases/update-receptiveness.test.ts`
  - 수용성 템플릿 채택 → 점수 가산
  - Feel Heard 고득점 수신 → 보너스 가산
  - 상위 N% 계산
  - Mock: ReceptivenessRepository, StanceRepository (전체 사용자 수)
  - Expected: Tests FAIL

- [ ] Test 6.2.3: `ScheduleFollowUpUseCase` 테스트
  - File: `test/unit/application/use-cases/schedule-follow-up.test.ts`
  - 대화 완료 → 1주 후 FollowUpCheckin 생성
  - Expected: Tests FAIL

- [ ] Test 6.2.4: `SubmitFollowUpCheckinUseCase` 테스트
  - File: `test/unit/application/use-cases/submit-follow-up-checkin.test.ts`
  - 회피감 감소 점수 제출
  - 만료된 체크인 제출 시 에러
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 6.2.5: `SubmitFeedbackUseCase` 수정
  - File: `src/application/use-cases/submit-feedback.ts`
  - Feel Heard + Affective Warmth 처리
  - ReceptivenessScore 갱신 트리거

- [ ] Task 6.2.6: `UpdateReceptivenessUseCase` 구현
  - File: `src/application/use-cases/update-receptiveness.ts`

- [ ] Task 6.2.7: `ScheduleFollowUpUseCase` 구현
  - File: `src/application/use-cases/schedule-follow-up.ts`

- [ ] Task 6.2.8: `SubmitFollowUpCheckinUseCase` 구현
  - File: `src/application/use-cases/submit-follow-up-checkin.ts`

- [ ] Task 6.2.9: DTOs 추가
  - File: `src/application/dtos/feedback-input.ts` 수정
  - File: `src/application/dtos/follow-up-input.ts`
  - File: `src/application/dtos/receptiveness-output.ts`

#### Quality Gate
- [ ] Feedback 제출 → Receptiveness 갱신 → 체크인 스케줄 전체 흐름
- [ ] 기존 Feedback 테스트 호환

---

### Sub-Phase 6.3: Infrastructure Layer — Repository & 스케줄링
**Goal**: 새 데이터 저장, 1주 후 알림 스케줄링

#### RED: Write Failing Tests First
- [ ] Test 6.3.1: `SupabaseFeedbackRepository` — 새 필드 저장/조회
  - File: `test/unit/infrastructure/persistence/supabase-feedback-repository.test.ts` 수정
  - feel_heard_score, affective_warmth 컬럼
  - Expected: Tests FAIL

- [ ] Test 6.3.2: `SupabaseFollowUpRepository` 테스트
  - File: `test/unit/infrastructure/persistence/supabase-follow-up-repository.test.ts`
  - 체크인 생성, 조회, 완료 마킹
  - Expected: Tests FAIL

- [ ] Test 6.3.3: `ReceptivenessRepository` 테스트
  - File: `test/unit/infrastructure/persistence/supabase-receptiveness-repository.test.ts`
  - 사용자별 점수 저장/조회/갱신
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 6.3.4: `SupabaseFeedbackRepository` 수정
  - File: `src/infrastructure/persistence/supabase-feedback-repository.ts`

- [ ] Task 6.3.5: `SupabaseFollowUpRepository` 구현
  - File: `src/infrastructure/persistence/supabase-follow-up-repository.ts`

- [ ] Task 6.3.6: `SupabaseReceptivenessRepository` 구현
  - File: `src/infrastructure/persistence/supabase-receptiveness-repository.ts`

- [ ] Task 6.3.7: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`

#### Quality Gate
- [ ] 저장/조회 정상
- [ ] 1주 후 체크인 스케줄링 동작

---

### Sub-Phase 6.4: Presentation Layer — Feedback & 수용성 UI
**Goal**: 확장된 Feedback 폼, 수용성 대시보드, 체크인 UI

#### RED: Write Failing Tests First
- [ ] Test 6.4.1: 확장된 Feedback 폼 테스트
  - File: `test/unit/presentation/components/feedback-form.test.tsx` 수정
  - Feel Heard Score (1-5 별점/슬라이더) 표시
  - Affective Warmth (0-10 슬라이더) 표시
  - 기존 만족도, 재매칭 의향 유지
  - 감정 체크인 유지
  - Expected: Tests FAIL

- [ ] Test 6.4.2: 수용성 대시보드 테스트
  - File: `test/unit/presentation/components/receptiveness-dashboard.test.tsx`
  - 누적 점수, 템플릿 채택 횟수, 상위 N% 표시
  - "당신의 대화 수용성이 상위 20%입니다" 문구
  - Expected: Tests FAIL

- [ ] Test 6.4.3: 1주 후 체크인 UI 테스트
  - File: `test/unit/presentation/components/follow-up-checkin.test.tsx`
  - "다른 의견 대화에 대한 회피감이 줄었나요?" (1-5)
  - 간단한 인라인 폼
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 6.4.4: Feedback 폼 확장
  - File: `src/app/dialogue/[id]/feedback/page.tsx` 수정
  - Feel Heard Score (1-5 별점)
  - Affective Warmth (0-10 슬라이더, "춥다/따뜻하다" 라벨)
  - 기존 항목 유지

- [ ] Task 6.4.5: 수용성 대시보드
  - File: `src/app/_components/ReceptivenessDashboard.tsx`
  - 프로필 또는 대화 완료 후 접근 가능
  - 누적 점수 + 상위 N% + 트렌드

- [ ] Task 6.4.6: 1주 후 체크인 UI
  - File: `src/app/_components/FollowUpCheckin.tsx`
  - 앱 진입 시 미완료 체크인 팝업/배너
  - 1-5 슬라이더 + 제출

- [ ] Task 6.4.7: API Routes
  - File: `src/app/api/dialogue/sessions/[id]/feedback/route.ts` 수정
  - File: `src/app/api/follow-up/[id]/route.ts`
  - File: `src/app/api/receptiveness/route.ts`

#### Quality Gate
- [ ] 확장된 Feedback 전체 제출 동작
- [ ] 수용성 대시보드 렌더링
- [ ] 1주 후 체크인 팝업 → 제출 동작
- [ ] 모바일 반응형

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 1주 후 체크인 응답률 매우 낮음 | High | Medium | 앱 진입 시 배너로 가시성 확보, 간단한 1문항 |
| Receptiveness 점수가 게임화로 변질 | Low | Medium | 공개 리더보드 없음, 개인 대시보드만 |
| Feedback 항목 과다로 이탈 | Medium | Medium | 핵심 2개(Feel Heard, Warmth)만 필수, 나머지 선택 |

## Progress Tracking

- Sub-Phase 6.1 (Domain): 0%
- Sub-Phase 6.2 (Application): 0%
- Sub-Phase 6.3 (Infrastructure): 0%
- Sub-Phase 6.4 (Presentation): 0%
- **Overall**: 0%
