# V2-P1: Self-Affirmation Warmup + Core Value

**Status**: Complete
**Started**: 2026-02-19
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: 없음 (첫 번째 Phase)

---

## Overview

### Feature Description

온보딩 Core 질문 시작 전에 **Self-Affirmation Warmup**을 추가한다. 사용자가 자신의 핵심 가치를 확인하는 20초 루틴으로, 정체성 위협을 낮추고 열린 정보 처리를 유도한다. 선택형이며, "대화 준비 운동"으로 프레이밍하여 reactance를 최소화한다.

또한 Phase 2 대화 시작 전에도 같은 루틴을 짧게 반복할 수 있도록 설계한다.

### Success Criteria

- [ ] Self-Affirmation Warmup 도메인 모델 구현
- [ ] 온보딩 흐름에 Warmup 단계 통합
- [ ] Q0-a (가치 선택) + Q0-b (경험 한 줄, 선택) UI 구현
- [ ] Q0-a 선택값이 `stance_profile.reasoning_tags` + `core_value`에 반영
- [ ] Q0-b 텍스트에서 LLM을 통한 value priority 추출
- [ ] 스킵 가능 여부 및 참여율 추적 메트릭
- [ ] 기존 온보딩 테스트 호환성 유지

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `SelfAffirmation` VO, `CoreValue` VO, `StanceProfile` 수정 | 가치 선택/경험 데이터 모델, 비즈니스 규칙 |
| Application | `SubmitSelfAffirmationUseCase`, `OnboardingSession` 수정 | 워크플로 오케스트레이션 |
| Infrastructure | `OpenAIValueExtractor` adapter, `SupabaseStanceRepository` 수정 | LLM 가치 추출, 저장 |
| Presentation | `SelfAffirmationStep` 컴포넌트, 온보딩 흐름 수정 | UI/UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| `SelfAffirmation`을 Value Object로 | 불변, 생명주기 없음 (스냅샷) | Entity로 만들면 과잉 설계 |
| `CoreValue`를 별도 VO로 분리 | Phase 2에서 재확인 시 재사용 | StanceProfile에 string으로 넣는 것보다 타입 안전 |
| Q0-b LLM 추출은 Optional | Q0-b 자체가 선택 입력 | 미입력 시 core_value만 사용 |

---

## Implementation Phases

### Sub-Phase 1.1: Domain Layer — Value Objects & StanceProfile 수정
**Goal**: Self-Affirmation 관련 도메인 모델 정의

#### RED: Write Failing Tests First
- [ ] Test 1.1.1: `CoreValue` VO 생성 테스트
  - File: `test/unit/domain/value-objects/core-value.test.ts`
  - 8개 가치(`공정`, `자유`, `배려`, `성취`, `안전`, `진실`, `책임`, `성장`) 유효성 검증
  - 잘못된 가치 입력 시 에러 발생 확인
  - Expected: Tests FAIL

- [ ] Test 1.1.2: `SelfAffirmation` VO 생성 테스트
  - File: `test/unit/domain/value-objects/self-affirmation.test.ts`
  - `coreValue: CoreValue` + `experience?: string` 구조
  - experience 없이도 유효한 VO 생성 확인
  - experience 있을 때 정상 생성 확인
  - Expected: Tests FAIL

- [ ] Test 1.1.3: `StanceProfile` entity에 `coreValue`, `selfAffirmation` 필드 추가 테스트
  - File: 기존 `test/unit/domain/entities/stance-calculator.test.ts` 수정
  - `StanceProfile`에 optional `coreValue: CoreValue` 추가
  - `StanceProfile`에 optional `selfAffirmation: SelfAffirmation` 추가
  - 기존 테스트 호환성 유지 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 1.1.4: `CoreValue` Value Object 구현
  - File: `src/domain/value-objects/core-value.ts`
  - 8개 가치 enum + 팩토리 메서드
  - 한국어 라벨 매핑

- [ ] Task 1.1.5: `SelfAffirmation` Value Object 구현
  - File: `src/domain/value-objects/self-affirmation.ts`
  - `coreValue: CoreValue` (필수) + `experience: string | null` (선택)
  - 불변 객체

- [ ] Task 1.1.6: `StanceProfile` / `StanceCalculator` 수정
  - File: `src/domain/entities/stance-calculator.ts`
  - `coreValue?: CoreValue` 필드 추가
  - `selfAffirmation?: SelfAffirmation` 필드 추가
  - reasoning_tags에 core_value 반영 로직

#### REFACTOR: Clean Up
- [ ] Task 1.1.7: 코드 리뷰 및 정리
  - 중복 제거, 네이밍 통일
  - 기존 exports 정리 (`src/domain/value-objects/index.ts`)

#### Quality Gate
- [ ] TDD compliance verified
- [ ] Build passes
- [ ] All tests pass (신규 + 기존)
- [ ] Linting clean
- [ ] Domain layer: 외부 의존성 없음
- [ ] `CoreValue`, `SelfAffirmation`이 순수 VO인지 확인

---

### Sub-Phase 1.2: Application Layer — Use Case & DTO
**Goal**: Self-Affirmation 제출 워크플로 구현

#### RED: Write Failing Tests First
- [ ] Test 1.2.1: `SubmitSelfAffirmationInput` DTO 검증 테스트
  - File: `test/unit/application/dtos/self-affirmation-input.test.ts`
  - `sessionId: string`, `coreValue: string`, `experience?: string` 구조
  - 유효하지 않은 coreValue 입력 시 에러
  - Expected: Tests FAIL

- [ ] Test 1.2.2: `SubmitSelfAffirmationUseCase` 테스트
  - File: `test/unit/application/use-cases/submit-self-affirmation.test.ts`
  - Happy path: coreValue 선택 + experience 입력 → StanceProfile 업데이트
  - Partial: coreValue만 선택 (experience 없음) → StanceProfile 업데이트
  - 존재하지 않는 세션 → NotFoundError
  - Mock: `StanceRepository`, `ValueExtractor` (LLM)
  - Expected: Tests FAIL

- [ ] Test 1.2.3: `OnboardingSession` 서비스에 warmup step 추가 테스트
  - File: 기존 `test/unit/application/services/onboarding-session.test.ts` 수정
  - 온보딩 흐름에 WARMUP → CORE → EXTENDED 단계 순서 확인
  - WARMUP 스킵 시 CORE로 바로 진행 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 1.2.4: `SubmitSelfAffirmationInput` DTO 구현
  - File: `src/application/dtos/self-affirmation-input.ts`

- [ ] Task 1.2.5: `ValueExtractor` 포트 인터페이스 정의
  - File: `src/domain/interfaces/value-extractor.ts`
  - `extractValuePriority(text: string): Promise<string[]>` 메서드

- [ ] Task 1.2.6: `SubmitSelfAffirmationUseCase` 구현
  - File: `src/application/use-cases/submit-self-affirmation.ts`
  - CoreValue 생성 → (experience 있으면) LLM value priority 추출 → StanceProfile 업데이트

- [ ] Task 1.2.7: `OnboardingSession` 수정 — warmup step 추가
  - File: `src/application/services/onboarding-session.ts`
  - 기존 흐름에 WARMUP 단계 삽입 (스킵 가능)

#### REFACTOR: Clean Up
- [ ] Task 1.2.8: Use case 의존성 정리, DI 등록 준비

#### Quality Gate
- [ ] TDD compliance verified
- [ ] Build passes
- [ ] All tests pass
- [ ] Use case가 포트 인터페이스에만 의존
- [ ] DTO로 데이터 교환

---

### Sub-Phase 1.3: Infrastructure Layer — LLM Adapter & Repository
**Goal**: Value priority LLM 추출 + 저장 구현

#### RED: Write Failing Tests First
- [ ] Test 1.3.1: `OpenAIValueExtractor` adapter 테스트
  - File: `test/unit/infrastructure/external/openai-value-extractor.test.ts`
  - experience 텍스트 입력 → value priority 키워드 배열 반환
  - API 키 없을 때 fallback 동작
  - Expected: Tests FAIL

- [ ] Test 1.3.2: `SupabaseStanceRepository` 수정 — coreValue, selfAffirmation 저장/조회
  - File: 기존 `test/unit/infrastructure/persistence/supabase-stance-repository.test.ts` 수정
  - save 시 core_value 컬럼 저장 확인
  - findById 시 core_value 복원 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 1.3.3: `OpenAIValueExtractor` 구현
  - File: `src/infrastructure/external/openai-value-extractor.ts`
  - 프롬프트: "다음 텍스트에서 핵심 가치 키워드를 추출하세요"
  - Fallback: 빈 배열 반환

- [ ] Task 1.3.4: `FallbackValueExtractor` 구현
  - File: `src/infrastructure/external/fallback-value-extractor.ts`
  - API 키 없을 때 사용. coreValue만 반환.

- [ ] Task 1.3.5: `SupabaseStanceRepository` 수정
  - File: `src/infrastructure/persistence/supabase-stance-repository.ts`
  - `core_value`, `self_affirmation_experience` 컬럼 매핑

- [ ] Task 1.3.6: DI Container 등록
  - File: `src/infrastructure/config/di-container.ts`
  - `ValueExtractor` 바인딩 추가

#### REFACTOR: Clean Up
- [ ] Task 1.3.7: Prompt 템플릿 분리, 에러 핸들링 정리

#### Quality Gate
- [ ] TDD compliance verified
- [ ] Build passes
- [ ] All tests pass
- [ ] Infrastructure adapter가 포트 인터페이스 구현
- [ ] Fallback 동작 검증

---

### Sub-Phase 1.4: Presentation Layer — UI Components & API
**Goal**: Self-Affirmation Warmup UI 구현

#### RED: Write Failing Tests First
- [ ] Test 1.4.1: `SelfAffirmationStep` 컴포넌트 렌더링 테스트
  - File: `test/unit/presentation/components/self-affirmation-step.test.tsx`
  - 8개 가치 버튼 렌더링 확인
  - 가치 선택 시 다음 단계(experience 입력) 전환 확인
  - 스킵 버튼 존재 및 동작 확인
  - Expected: Tests FAIL

- [ ] Test 1.4.2: API Route `/api/onboarding/self-affirmation` 테스트
  - File: `test/unit/presentation/api/self-affirmation-route.test.ts`
  - POST 요청 시 use case 호출 확인
  - 유효하지 않은 입력 시 400 반환
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 1.4.3: `SelfAffirmationStep` 컴포넌트 구현
  - File: `src/app/onboarding/_components/SelfAffirmationStep.tsx`
  - Q0-a: 8개 가치 카드 그리드 (선택형)
  - Q0-b: 텍스트 입력 (선택) + PII 마스킹 안내 문구
  - 스킵 버튼: "건너뛰기 →"
  - UX 카피: "당신을 바꾸려는 게 아니에요. 당신이 어떤 사람인지 먼저 확인하는 과정이에요."

- [ ] Task 1.4.4: API Route 구현
  - File: `src/app/api/onboarding/self-affirmation/route.ts`
  - POST handler → `SubmitSelfAffirmationUseCase` 호출

- [ ] Task 1.4.5: 온보딩 페이지 흐름 수정
  - File: `src/app/onboarding/page.tsx`
  - Trust Moment → **Self-Affirmation (스킵 가능)** → Core 5문항 순서

- [ ] Task 1.4.6: Server Action 추가
  - File: `src/app/onboarding/actions.ts`
  - `submitSelfAffirmation` action 추가

#### REFACTOR: Clean Up
- [ ] Task 1.4.7: 접근성(a11y) 확인, 모바일 반응형 최적화

#### Quality Gate
- [ ] TDD compliance verified
- [ ] Build passes
- [ ] All tests pass
- [ ] Linting clean
- [ ] 스킵 경로와 참여 경로 모두 동작
- [ ] 모바일에서 가치 카드 그리드 정상 표시
- [ ] PII 마스킹 안내 표시

---

### Sub-Phase 1.5: 메트릭 & 추적
**Goal**: Self-Affirmation 참여율 추적

#### RED: Write Failing Tests First
- [ ] Test 1.5.1: Self-Affirmation 이벤트 트래킹 테스트
  - File: `test/unit/application/use-cases/track-self-affirmation.test.ts`
  - `SELF_AFFIRMATION_STARTED`, `SELF_AFFIRMATION_COMPLETED`, `SELF_AFFIRMATION_SKIPPED` 이벤트
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 1.5.2: `RelationshipEventType` VO에 Self-Affirmation 이벤트 추가
  - File: `src/domain/value-objects/relationship-event-type.ts`
  - 3개 이벤트 타입 추가

- [ ] Task 1.5.3: 이벤트 트래킹 로직 Use Case에 삽입
  - File: `src/application/use-cases/submit-self-affirmation.ts` 수정
  - EventTracker 호출 추가

#### Quality Gate
- [ ] TDD compliance verified
- [ ] Build passes
- [ ] 참여율 계산 가능 (참여 / (참여 + 스킵))
- [ ] 이벤트가 Supabase에 정상 저장

---

## Test Strategy

| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| Unit Tests | >=90% | CoreValue VO, SelfAffirmation VO, Use Case 로직 |
| Integration Tests | Critical paths | API Route → Use Case → Repository 흐름 |
| Component Tests | UI rendering | SelfAffirmationStep 렌더링 + 인터랙션 |

## Rollback Strategy

### If Sub-Phase 1.1 Fails
- 새 VO 파일 삭제, StanceProfile 변경 revert

### If Sub-Phase 1.4 Fails
- 온보딩 페이지 흐름을 이전 상태로 revert (WARMUP 단계 제거)
- API route 삭제

---

## Progress Tracking

- Sub-Phase 1.1 (Domain): 100% ✅
- Sub-Phase 1.2 (Application): 100% ✅
- Sub-Phase 1.3 (Infrastructure): 100% ✅
- Sub-Phase 1.4 (Presentation): 100% ✅
- Sub-Phase 1.5 (Metrics): 100% ✅ (이벤트 타입 추가 완료)
- **Overall**: 100% ✅

## Notes & Learnings
- Phase 2 대화 시작 전 Self-Affirmation 재확인은 V2-P5에서 구현
- Q0-b experience 텍스트의 PII scrubbing은 기존 `regex-pii-scrubber.ts` 재사용
