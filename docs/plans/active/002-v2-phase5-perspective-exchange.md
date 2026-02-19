# V2-P5: Perspective Exchange 구조 개편

**Status**: Pending
**Started**: -
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P4 (Adaptive Matching + Topic Ladder + Effort Gradient)

---

## Overview

### Feature Description

구조화된 대화(기존 Micro-Debate → Perspective Exchange)의 핵심 구조를 v2에 맞게 개편한다:

1. **Step 0: Self-Affirmation 재확인** (대화 시작 전, 선택)
2. **입장 제시: "개인적 맥락 1문장" 템플릿** (PII 마스킹)
3. **수용성 템플릿 추천** (Receptiveness Template) — Facilitator가 전송 전 추천
4. **강화된 Reflection (R1-R5)** — 강제 요약 + 정확성 확인 + consider-the-opposite
5. **공동 요약 카드 (Joint Summary)** — 동의/비동의/궁금한 질문
6. **공동 목표 명시 UX** — "이해하는 게임"으로 전환

### Success Criteria

- [ ] DialogueSession FSM에 Step 0 (Self-Affirmation) 추가
- [ ] 입장 제시에 "개인적 맥락 1문장" 필드 추가 (PII 마스킹)
- [ ] Facilitator에 수용성 템플릿 추천 기능 추가
- [ ] Reflection R1-R5 구현 (R1 강제 요약, R2 정확성 확인, R3 consider-the-opposite)
- [ ] R2: 양쪽이 서로의 요약을 검증하는 상호 확인 흐름
- [ ] 공동 요약 카드: 동의/비동의/궁금한 질문 양쪽 입력
- [ ] 대화 시작 화면에 공동 목표 문구 표시
- [ ] Effort Gradient별 FSM 분기 (5분/15분/30분+)
- [ ] 기존 대화 테스트 호환

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `DialogueSession` 수정, `DialogueStep` 수정, `ReflectionItem` VO, `JointSummary` entity, `PersonalContext` VO | FSM 확장, Reflection 모델 |
| Application | `SubmitDialogueTurnUseCase` 수정, `SubmitReflectionUseCase`, `GenerateJointSummaryUseCase` | Reflection/요약 워크플로 |
| Infrastructure | `Facilitator` 수정 (수용성 템플릿), `SummaryGenerator` 수정 | LLM 연동 |
| Presentation | 대화 UI 전면 개편 | UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Step 0을 FSM에 추가 (선택적 단계) | 대화 전 warmup, 스킵 가능 | FSM 복잡도 증가 |
| Reflection을 R1-R5 sub-steps로 분할 | v2 스펙의 강제/선택 분리 | 기존 단일 REFLECTION 단계 변경 |
| R2 상호 확인을 별도 비동기 라운드로 | 양쪽이 서로의 요약을 검증해야 함 | 대화 시간 증가 |
| 공동 요약을 `JointSummary` 별도 entity로 | LLM + 사용자 입력 합성 결과 | DialogueSession에 넣기엔 과중 |
| `PersonalContext`를 VO로 | PII 마스킹 후 저장, 원문 삭제 | 원문 복구 불가 (의도적) |
| Facilitator stance data 제외를 이 Phase에서 강화 | v2 핵심 안전 요구사항 | V2-P8과 일부 중복이지만 여기서 선행 |

---

## Implementation Phases

### Sub-Phase 5.1: Domain Layer — FSM 확장 & Reflection 모델
**Goal**: DialogueSession FSM에 Step 0 추가, Reflection sub-steps, PersonalContext, JointSummary 모델링

#### RED: Write Failing Tests First
- [ ] Test 5.1.1: `DialogueStep` VO 수정 — Step 0 추가
  - File: `test/unit/domain/value-objects/dialogue-step.test.ts` 수정
  - 기존: POSITION → QUESTION → ANSWER → REFLECTION
  - 변경: AFFIRMATION → POSITION → QUESTION → ANSWER → REFLECTION → JOINT_SUMMARY
  - AFFIRMATION은 스킵 가능
  - Expected: Tests FAIL

- [ ] Test 5.1.2: `PersonalContext` VO 테스트
  - File: `test/unit/domain/value-objects/personal-context.test.ts`
  - `scrubbedText: string` (PII 마스킹된 텍스트)
  - 빈 문자열 허용 (미입력 시)
  - Expected: Tests FAIL

- [ ] Test 5.1.3: `ReflectionItem` VO 테스트
  - File: `test/unit/domain/value-objects/reflection-item.test.ts`
  - 5가지 타입: SUMMARY(R1), ACCURACY_CHECK(R2), STEELMAN(R3), COMMON_GROUND(R4), FUTURE_QUESTION(R5)
  - 각 타입별 필수/선택 여부
  - R1: 강제 (text 필수)
  - R2: 강제 (상대 응답 필요)
  - R3: 점진적 강제 (대화 횟수 기반)
  - R4, R5: 선택
  - Expected: Tests FAIL

- [ ] Test 5.1.4: `JointSummary` entity 테스트
  - File: `test/unit/domain/entities/joint-summary.test.ts`
  - `agreedPoints: string[]` (동의 사항)
  - `disagreedPoints: string[]` (비동의 사항)
  - `sharedQuestions: string[]` (함께 궁금한 질문)
  - `llmGenerated: boolean` (LLM 생성 여부)
  - Expected: Tests FAIL

- [ ] Test 5.1.5: `DialogueSession` FSM 수정 — Effort Gradient별 분기
  - File: `test/unit/domain/entities/dialogue-session.test.ts` 수정
  - QUICK (5분): POSITION → SUMMARY (축약)
  - STRUCTURED (15분): 전체 6단계
  - DEEP (30분+): 전체 6단계 + 확장 라운드
  - Expected: Tests FAIL

- [ ] Test 5.1.6: `DialogueTurn`에 personalContext 필드 추가
  - File: `test/unit/domain/entities/dialogue-turn.test.ts` 수정
  - POSITION 단계 제출 시 personalContext 포함
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 5.1.7: `DialogueStep` 수정
  - File: `src/domain/value-objects/dialogue-step.ts`
  - AFFIRMATION, JOINT_SUMMARY 추가
  - Effort Grade별 단계 매핑

- [ ] Task 5.1.8: `PersonalContext` VO 구현
  - File: `src/domain/value-objects/personal-context.ts`

- [ ] Task 5.1.9: `ReflectionItem` VO 구현
  - File: `src/domain/value-objects/reflection-item.ts`
  - 5가지 타입 + 필수/선택 규칙

- [ ] Task 5.1.10: `JointSummary` entity 구현
  - File: `src/domain/entities/joint-summary.ts`

- [ ] Task 5.1.11: `DialogueSession` FSM 수정
  - File: `src/domain/entities/dialogue-session.ts`
  - Step 0 AFFIRMATION 추가 (스킵 가능)
  - JOINT_SUMMARY 단계 추가
  - Effort Grade별 분기

- [ ] Task 5.1.12: `DialogueTurn` 수정
  - File: `src/domain/entities/dialogue-turn.ts`
  - `personalContext?: PersonalContext` 필드

#### REFACTOR: Clean Up
- [ ] Task 5.1.13: 기존 FSM 테스트 데이터 업데이트

#### Quality Gate
- [ ] FSM 전체 흐름 (6단계) 동작
- [ ] Effort Grade별 분기 동작
- [ ] AFFIRMATION 스킵 동작
- [ ] Reflection R1-R5 타입 정확
- [ ] Domain 외부 의존성 없음

---

### Sub-Phase 5.2: Application Layer — Use Cases & Facilitator 연동
**Goal**: Reflection 제출, 수용성 템플릿, 공동 요약 생성

#### RED: Write Failing Tests First
- [ ] Test 5.2.1: `SubmitDialogueTurnUseCase` 수정 — personalContext & 수용성 템플릿
  - File: `test/unit/application/use-cases/submit-dialogue-turn.test.ts` 수정
  - POSITION 제출 시 personalContext PII 마스킹 확인
  - 전송 전 수용성 템플릿 추천 반환 확인
  - Mock: PIIScrubber, Facilitator
  - Expected: Tests FAIL

- [ ] Test 5.2.2: `SubmitReflectionUseCase` 테스트
  - File: `test/unit/application/use-cases/submit-reflection.test.ts`
  - R1 (요약) 제출 + R2 (정확성 확인) 제출 + R3-R5 (선택)
  - R1 미제출 시 에러 (강제 항목)
  - R2: 상대의 R1을 확인하는 상호 검증 흐름
  - R3: 첫 3회 대화에서는 선택, 이후 강제 (Understanding Score 기반)
  - Mock: DialogueRepository
  - Expected: Tests FAIL

- [ ] Test 5.2.3: `GenerateJointSummaryUseCase` 테스트
  - File: `test/unit/application/use-cases/generate-joint-summary.test.ts`
  - 양쪽 Reflection 데이터 + LLM → JointSummary 생성
  - Mock: SummaryGenerator
  - Expected: Tests FAIL

- [ ] Test 5.2.4: Facilitator — 수용성 템플릿 추천 테스트
  - File: `test/unit/infrastructure/external/openai-facilitator.test.ts` 수정
  - 메시지 텍스트 → 수용성 템플릿 1-3줄 추천
  - 추천은 선택적 (사용자가 채택/무시 가능)
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 5.2.5: `SubmitDialogueTurnUseCase` 수정
  - File: `src/application/use-cases/submit-dialogue-turn.ts`
  - POSITION 제출 시 PII 마스킹 + personalContext 저장
  - 수용성 템플릿 추천 반환 추가

- [ ] Task 5.2.6: `SubmitReflectionUseCase` 구현
  - File: `src/application/use-cases/submit-reflection.ts`
  - R1-R5 각 항목 처리
  - R2 상호 확인 흐름 관리
  - R3 점진적 강제 로직 (대화 횟수 기반)

- [ ] Task 5.2.7: `GenerateJointSummaryUseCase` 구현
  - File: `src/application/use-cases/generate-joint-summary.ts`
  - 양쪽 Reflection + 대화 내용 → LLM → JointSummary

- [ ] Task 5.2.8: DTOs 추가
  - File: `src/application/dtos/reflection-input.ts`
  - File: `src/application/dtos/reflection-output.ts`
  - File: `src/application/dtos/joint-summary-output.ts`

- [ ] Task 5.2.9: Facilitator 포트 인터페이스 확장
  - File: `src/domain/interfaces/facilitator.ts`
  - `suggestReceptivenessTemplate(text: string): Promise<string[]>` 추가

#### REFACTOR: Clean Up
- [ ] Task 5.2.10: Use case 의존성 정리

#### Quality Gate
- [ ] Reflection R1-R5 전체 흐름 동작
- [ ] 수용성 템플릿 추천 동작
- [ ] 공동 요약 생성 동작
- [ ] PII 마스킹 확인

---

### Sub-Phase 5.3: Infrastructure Layer — LLM & Repository
**Goal**: 수용성 템플릿 LLM 구현, 공동 요약 LLM, Repository 수정

#### RED: Write Failing Tests First
- [ ] Test 5.3.1: `OpenAIFacilitator` — 수용성 템플릿 추천
  - File: `test/unit/infrastructure/external/openai-facilitator.test.ts` 수정
  - 메시지 → 수용적 언어 추천 1-3줄
  - Expected: Tests FAIL

- [ ] Test 5.3.2: `OpenAISummaryGenerator` — 공동 요약 생성
  - File: `test/unit/infrastructure/external/openai-summary-generator.test.ts` 수정
  - 양쪽 입력 → 동의/비동의/궁금한 질문 구조화
  - Expected: Tests FAIL

- [ ] Test 5.3.3: Repository — Reflection, JointSummary, PersonalContext 저장
  - File: `test/unit/infrastructure/persistence/supabase-dialogue-repository.test.ts` 수정
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 5.3.4: `OpenAIFacilitator` 수정
  - File: `src/infrastructure/external/openai-facilitator.ts`
  - `suggestReceptivenessTemplate()` 구현
  - 프롬프트: 수용적 언어 추천 (인정, 완충어, 질문)

- [ ] Task 5.3.5: Facilitator 프롬프트에서 stance data 제거 확인
  - File: `src/infrastructure/external/facilitator-prompts.ts`
  - stance vector, demographic, 성향 태그 입력 차단 확인
  - 허용 컨텍스트: 톤, 논점 이탈, 구조 진행 상태만

- [ ] Task 5.3.6: `OpenAISummaryGenerator` 수정
  - File: `src/infrastructure/external/openai-summary-generator.ts`
  - 공동 요약 프롬프트 추가

- [ ] Task 5.3.7: Summary 프롬프트 추가
  - File: `src/infrastructure/external/summary-prompts.ts`
  - 공동 요약 카드 프롬프트

- [ ] Task 5.3.8: Fallback 구현
  - File: `src/infrastructure/external/fallback-facilitator.ts` 수정
  - 수용성 템플릿: 하드코딩된 기본 템플릿 반환

- [ ] Task 5.3.9: Repository 수정
  - File: `src/infrastructure/persistence/supabase-dialogue-repository.ts`
  - reflection_items, joint_summary, personal_context 컬럼

- [ ] Task 5.3.10: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`

#### Quality Gate
- [ ] 수용성 템플릿 LLM 추천 동작
- [ ] stance data가 Facilitator에 전달되지 않음 확인
- [ ] 공동 요약 LLM 생성 동작
- [ ] Repository 저장/조회 동작

---

### Sub-Phase 5.4: Presentation Layer — 대화 UI 개편
**Goal**: Step 0, 개인적 맥락, 수용성 템플릿, 강화된 Reflection, 공동 요약 UI

#### RED: Write Failing Tests First
- [ ] Test 5.4.1: 대화 시작 화면 — 공동 목표 표시 + Step 0
  - File: `test/unit/presentation/components/dialogue-start.test.tsx`
  - "이 대화의 목표는... 정확히 이해하는 것입니다" 문구 표시
  - Self-Affirmation 재확인 (이전 선택 가치 표시, 스킵 가능)
  - Expected: Tests FAIL

- [ ] Test 5.4.2: 입장 제시 — 개인적 맥락 1문장 + 수용성 템플릿
  - File: `test/unit/presentation/components/turn-submission-form.test.tsx` 수정
  - "내가 이 생각을 갖게 된 개인적 맥락 1문장:" 텍스트 필드
  - PII 마스킹 안내 표시
  - 전송 후 수용성 템플릿 추천 표시 (선택 삽입)
  - Expected: Tests FAIL

- [ ] Test 5.4.3: Reflection 단계 — R1-R5 UI
  - File: `test/unit/presentation/components/reflection-form.test.tsx`
  - R1: 강제 요약 입력 필드 (미입력 시 전송 불가)
  - R2: 상대 요약 표시 + "맞나요?" 예/아니오 + 수정 제안
  - R3: Steelman 입력 (선택/강제 조건부 표시)
  - R4: 공통점 입력 (선택)
  - R5: 미래 질문 입력 (선택)
  - Expected: Tests FAIL

- [ ] Test 5.4.4: 공동 요약 카드 UI
  - File: `test/unit/presentation/components/joint-summary-card.test.tsx`
  - 동의 사항 / 비동의 사항 / 궁금한 질문 3섹션
  - 양쪽 입력 + LLM 합성 결과
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 5.4.5: `DialogueStart` 컴포넌트 구현
  - File: `src/app/dialogue/_components/DialogueStart.tsx`
  - 공동 목표 문구 + Self-Affirmation 재확인
  - 이전에 선택한 가치 표시 (변경 가능)

- [ ] Task 5.4.6: `TurnSubmissionForm` 수정 — 개인적 맥락 + 수용성 템플릿
  - File: `src/app/dialogue/_components/TurnSubmissionForm.tsx` 수정
  - POSITION 단계에서 "개인적 맥락 1문장" 필드
  - 전송 후 수용성 템플릿 추천 토스트/카드
  - 템플릿 채택 시 메시지에 삽입

- [ ] Task 5.4.7: `ReflectionForm` 컴포넌트 구현
  - File: `src/app/dialogue/_components/ReflectionForm.tsx`
  - R1-R5 각 항목 폼
  - R1, R2 강제 표시 / R3 조건부 / R4, R5 선택

- [ ] Task 5.4.8: `JointSummaryCard` 컴포넌트 구현
  - File: `src/app/dialogue/_components/JointSummaryCard.tsx`
  - 3섹션 (동의/비동의/궁금한 질문)
  - 공유 기능

- [ ] Task 5.4.9: API Routes 추가/수정
  - File: `src/app/api/dialogue/sessions/[id]/reflection/route.ts` — Reflection 제출
  - File: `src/app/api/dialogue/sessions/[id]/joint-summary/route.ts` — 공동 요약
  - File: `src/app/api/dialogue/sessions/[id]/turns/route.ts` 수정 — personalContext, 수용성 템플릿

- [ ] Task 5.4.10: 대화 페이지 통합
  - File: `src/app/dialogue/[id]/page.tsx` 수정
  - 전체 6단계 흐름 통합

#### Quality Gate
- [ ] Step 0 → 입장 제시 → 질문 → 답변 → Reflection → 공동 요약 전체 흐름
- [ ] 수용성 템플릿 추천 → 선택 삽입 동작
- [ ] R1 미제출 시 진행 불가
- [ ] R2 상호 확인 흐름 동작
- [ ] 공동 요약 카드 렌더링
- [ ] 모바일 반응형
- [ ] PII 마스킹 동작

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FSM 복잡도 증가로 버그 | High | High | 단계별 테스트 + 기존 FSM 테스트 유지 |
| R2 상호 확인이 대기 시간 증가 | Medium | Medium | 타임아웃 설정 + 스킵 옵션 |
| 수용성 템플릿이 부자연스러움 | Medium | Low | 한국어 자연스러운 프롬프트 튜닝 |

## Progress Tracking

- Sub-Phase 5.1 (Domain): 0%
- Sub-Phase 5.2 (Application): 0%
- Sub-Phase 5.3 (Infrastructure): 0%
- Sub-Phase 5.4 (Presentation): 0%
- **Overall**: 0%
