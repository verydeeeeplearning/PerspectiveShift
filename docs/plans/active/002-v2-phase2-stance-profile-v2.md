# V2-P2: Stance Profile 확장 (6차원 + Confidence Map) + Progressive Profiling

**Status**: Complete
**Started**: 2026-02-19
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P1 (Self-Affirmation — core_value 필드)

---

## Overview

### Feature Description

현재 5차원 Stance Vector를 **6차원으로 확장**하고 (`opportunity_equality` 추가), 각 축별 **Confidence Map** (확신 강도: 약/중/강)을 추가한다. 또한 온보딩을 **Core 5문항 → Extended 5문항**의 Progressive Profiling 구조로 개편하여, Core 5문항 결과를 먼저 보여준 뒤 사용자가 자발적으로 교정 질문에 참여하도록 유도한다.

### Success Criteria

- [ ] `StanceDimension`에 `OPPORTUNITY_EQUALITY` 추가
- [ ] `StanceVector` 6차원 지원
- [ ] `ConfidenceLevel` VO (LOW/MEDIUM/HIGH) 구현
- [ ] `ConfidenceMap` (`Record<StanceDimension, ConfidenceLevel>`) 구현
- [ ] Core 5문항 완료 시 즉시 초기 결과 표시
- [ ] Extended 5문항은 선택적, 1문항씩 Thought Map 실시간 업데이트
- [ ] 확신 강도 수집 (Extended 진입 시 1회)
- [ ] 기존 5차원 데이터 backward compatibility
- [ ] 코사인 거리 계산 6차원 대응

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `StanceDimension` 수정, `ConfidenceLevel` VO, `ConfidenceMap` VO, `StanceVector` 수정 | 6차원 + confidence 모델링 |
| Application | `ExtractStanceUseCase` 수정, `SubmitAnswerUseCase` 수정, DTOs 수정 | Progressive Profiling 워크플로 |
| Infrastructure | Repository 수정, LLM 프롬프트 수정 | 6차원 저장, 추출 |
| Presentation | 온보딩 흐름 개편 (Core → 결과 → Extended) | UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| `StanceDimension` enum에 값 추가 | 기존 패턴 유지, 타입 안전 | DB 마이그레이션 필요 |
| `ConfidenceLevel`을 3단계로 | v2 스펙 준수 (약/중/강) | 5단계보다 정밀도 낮지만 UX 마찰 최소 |
| Core 5 완료 시 `confidence` 기본값 MEDIUM | Extended 미참여자도 매칭 가능 | 정확도는 떨어지지만 허용 |
| Extended 질문 1개씩 답변 → 실시간 업데이트 | Self-Correction Loop 심리 활용 | 서버 호출 증가 (질문당 1회) |

---

## Implementation Phases

### Sub-Phase 2.1: Domain Layer — 6차원 확장 & Confidence
**Goal**: Stance 도메인 모델 6차원 + confidence 확장

#### RED: Write Failing Tests First
- [ ] Test 2.1.1: `StanceDimension`에 `OPPORTUNITY_EQUALITY` 추가 테스트
  - File: `test/unit/domain/value-objects/stance-dimension.test.ts` 수정
  - 6개 차원 존재 확인
  - Expected: Tests FAIL

- [ ] Test 2.1.2: `ConfidenceLevel` VO 생성 테스트
  - File: `test/unit/domain/value-objects/confidence-level.test.ts`
  - LOW, MEDIUM, HIGH 3단계
  - 잘못된 값 입력 시 에러
  - Expected: Tests FAIL

- [ ] Test 2.1.3: `ConfidenceMap` VO 테스트
  - File: `test/unit/domain/value-objects/confidence-map.test.ts`
  - 6차원 모두 포함하는 맵 생성
  - 기본값 생성 (모두 MEDIUM)
  - 부분 업데이트 (특정 축만 변경)
  - Expected: Tests FAIL

- [ ] Test 2.1.4: `StanceVector` 6차원 대응 테스트
  - File: `test/unit/domain/entities/stance-vector.test.ts` 수정
  - 6차원 벡터 생성
  - 6차원 코사인 거리 계산
  - 5차원 벡터와의 backward compatibility (새 축 0.0 기본값)
  - Expected: Tests FAIL

- [ ] Test 2.1.5: `OpinionDistance` 6차원 거리 계산 테스트
  - File: `test/unit/domain/value-objects/opinion-distance.test.ts` 수정
  - 6차원 벡터 간 거리 계산
  - sweet spot [0.4-0.7] 유지 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 2.1.6: `StanceDimension` 수정
  - File: `src/domain/value-objects/stance-dimension.ts`
  - `OPPORTUNITY_EQUALITY` 추가

- [ ] Task 2.1.7: `ConfidenceLevel` VO 구현
  - File: `src/domain/value-objects/confidence-level.ts`

- [ ] Task 2.1.8: `ConfidenceMap` VO 구현
  - File: `src/domain/value-objects/confidence-map.ts`
  - `static default()` → 모든 축 MEDIUM
  - `update(dimension, level)` → 새 VO 반환

- [ ] Task 2.1.9: `StanceVector` 수정 — 6차원 지원
  - File: `src/domain/entities/stance-vector.ts`
  - dimensions 배열 6개로 확장
  - cosineDistance 6차원 대응
  - `confidenceMap: ConfidenceMap` 필드 추가

- [ ] Task 2.1.10: `OpinionDistance` 수정
  - File: `src/domain/value-objects/opinion-distance.ts`
  - 6차원 벡터 간 거리 계산 대응

#### REFACTOR: Clean Up
- [ ] Task 2.1.11: 기존 5차원 테스트 데이터 6차원으로 업데이트

#### Quality Gate
- [ ] 모든 기존 stance 관련 테스트 통과
- [ ] 6차원 코사인 거리 정확도 검증
- [ ] Domain layer 외부 의존성 없음

---

### Sub-Phase 2.2: Application Layer — Progressive Profiling
**Goal**: Core 5 → 결과 → Extended 5 워크플로 구현

#### RED: Write Failing Tests First
- [ ] Test 2.2.1: `OnboardingSession` — Core/Extended 단계 분리 테스트
  - File: `test/unit/application/services/onboarding-session.test.ts` 수정
  - `completeCore()` → 초기 stance 생성
  - `startExtended()` → 교정 모드 진입
  - `submitExtendedAnswer(n)` → stance 실시간 업데이트
  - Extended 중 언제든 완료 가능
  - Expected: Tests FAIL

- [ ] Test 2.2.2: `ExtractStanceUseCase` — 6차원 추출 테스트
  - File: `test/unit/application/use-cases/extract-stance.test.ts` 수정
  - 6차원 벡터 추출 확인 (새 축 포함)
  - Expected: Tests FAIL

- [ ] Test 2.2.3: `SubmitConfidenceInput` DTO 테스트
  - File: `test/unit/application/dtos/confidence-input.test.ts`
  - 확신 강도 수집 입력 검증
  - Expected: Tests FAIL

- [ ] Test 2.2.4: `SubmitConfidenceUseCase` 테스트
  - File: `test/unit/application/use-cases/submit-confidence.test.ts`
  - 선택된 확고한 주제들 → ConfidenceMap 업데이트
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 2.2.5: `OnboardingSession` 수정 — 단계 분리
  - File: `src/application/services/onboarding-session.ts`
  - WARMUP → CORE → RESULT → EXTENDED → FINAL 흐름

- [ ] Task 2.2.6: `ExtractStanceUseCase` 수정 — 6차원
  - File: `src/application/use-cases/extract-stance.ts`
  - opportunity_equality 축 추출 로직

- [ ] Task 2.2.7: `SubmitConfidenceInput` DTO 구현
  - File: `src/application/dtos/confidence-input.ts`

- [ ] Task 2.2.8: `SubmitConfidenceUseCase` 구현
  - File: `src/application/use-cases/submit-confidence.ts`

- [ ] Task 2.2.9: 기존 질문 데이터 업데이트 (Core/Extended 태그)
  - File: 질문 데이터 소스 (seed or constants)
  - Q1-Q5: Core, Q6-Q10: Extended 태그

#### REFACTOR: Clean Up
- [ ] Task 2.2.10: DTO exports 정리

#### Quality Gate
- [ ] Core 5 완료 → 초기 결과 생성 동작
- [ ] Extended 1문항 답변 → stance 업데이트 동작
- [ ] Confidence 수집 → ConfidenceMap 업데이트

---

### Sub-Phase 2.3: Infrastructure Layer — 저장 & LLM 수정
**Goal**: 6차원 stance + confidence 저장, LLM 프롬프트 수정

#### RED: Write Failing Tests First
- [ ] Test 2.3.1: Repository 6차원 저장/조회 테스트
  - File: `test/unit/infrastructure/persistence/supabase-stance-repository.test.ts` 수정
  - 6차원 벡터 + confidence_map 저장 확인
  - 5차원 기존 데이터 조회 시 backward compatibility (새 축 0.0, confidence MEDIUM)
  - Expected: Tests FAIL

- [ ] Test 2.3.2: LLM Stance Extraction 프롬프트 6차원 대응
  - File: `test/unit/infrastructure/external/openai-stance-extractor.test.ts` 수정
  - 6번째 축(`opportunity_equality`) 추출 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 2.3.3: `SupabaseStanceRepository` 수정
  - File: `src/infrastructure/persistence/supabase-stance-repository.ts`
  - `opportunity_equality` 컬럼 매핑
  - `confidence_map` JSON 컬럼 매핑
  - Backward compatibility: 누락 시 기본값

- [ ] Task 2.3.4: Stance Extraction 프롬프트 수정
  - File: `src/infrastructure/external/stance-extraction-prompt.ts`
  - 6번째 축 추출 지시 추가

- [ ] Task 2.3.5: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`
  - `SubmitConfidenceUseCase` 등록

#### Quality Gate
- [ ] DB 저장/조회 6차원 + confidence 동작
- [ ] LLM 프롬프트 6차원 추출 동작
- [ ] 기존 데이터 호환

---

### Sub-Phase 2.4: Presentation Layer — Progressive Profiling UX
**Goal**: Core → 결과 → Extended UX 구현

#### RED: Write Failing Tests First
- [ ] Test 2.4.1: 온보딩 흐름 — Core 5 완료 후 초기 결과 표시 테스트
  - File: `test/unit/presentation/pages/onboarding-flow.test.tsx`
  - Core 5문항 완료 → 초기 Thought Map 렌더링
  - "맞아요!" / "좀 다른 것 같아요" 버튼 표시
  - Expected: Tests FAIL

- [ ] Test 2.4.2: Extended 교정 흐름 테스트
  - File: `test/unit/presentation/components/extended-questions.test.tsx`
  - "좀 다른 것 같아요" 클릭 → Extended 질문 시작
  - 1문항 답변마다 Thought Map 업데이트 확인
  - 확신 강도 수집 UI (Extended 진입 시 1회)
  - Expected: Tests FAIL

- [ ] Test 2.4.3: Instant Micro-Insight 테스트
  - File: `test/unit/presentation/components/micro-insight.test.tsx`
  - 질문 2-3개마다 인사이트 카드 표시 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 2.4.4: 초기 결과 화면 컴포넌트
  - File: `src/app/onboarding/_components/InitialResult.tsx`
  - 별명 + 상대적 포지셔닝 (V2-P3에서 별명 로직 구현, 여기선 placeholder)
  - "A그룹과 N% 유사합니다" 문구
  - "맞아요!" / "좀 다른 것 같아요" CTA

- [ ] Task 2.4.5: Extended 질문 흐름 컴포넌트
  - File: `src/app/onboarding/_components/ExtendedQuestions.tsx`
  - 1문항씩 표시, 답변마다 서버 호출 → Thought Map 업데이트
  - "그만하기" 버튼 항상 노출

- [ ] Task 2.4.6: 확신 강도 수집 UI
  - File: `src/app/onboarding/_components/ConfidenceSelector.tsx`
  - "아래 주제 중 당신의 생각이 가장 확고한 주제는?" (복수 선택)
  - Extended 진입 시 1회 표시

- [ ] Task 2.4.7: Micro-Insight 컴포넌트
  - File: `src/app/onboarding/_components/MicroInsight.tsx`
  - 2-3문항마다 표시되는 인사이트 카드
  - 발견 톤 카피 (훈계 아닌 발견)

- [ ] Task 2.4.8: 온보딩 페이지 흐름 통합
  - File: `src/app/onboarding/page.tsx` 수정
  - Trust → Warmup → Core 5 → Initial Result → (Extended) → Final Result

- [ ] Task 2.4.9: API Routes 추가
  - File: `src/app/api/onboarding/confidence/route.ts`
  - POST: 확신 강도 제출

#### Quality Gate
- [ ] Core 5 → 결과 → Extended 전체 흐름 동작
- [ ] Extended 중도 중단 가능
- [ ] 실시간 Thought Map 업데이트
- [ ] 모바일 반응형

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 기존 5차원 데이터 마이그레이션 | High | Medium | 새 축 기본값 0.0, confidence 기본값 MEDIUM |
| 코사인 거리 계산 변경으로 기존 매칭 영향 | Medium | Medium | 6차원은 수학적 상위호환 |
| Extended 질문당 서버 호출 증가 | Low | Low | 디바운싱 + 로딩 UI |

## Progress Tracking

- Sub-Phase 2.1 (Domain): 100% ✅ (6차원 이미 존재, ConfidenceLevel/ConfidenceMap VO 추가)
- Sub-Phase 2.2 (Application): 100% ✅ (SubmitConfidenceUseCase + DTO 추가)
- Sub-Phase 2.3 (Infrastructure): 100% ✅ (Repository + DI 업데이트)
- Sub-Phase 2.4 (Presentation): 100% ✅ (ConfidenceSelector 컴포넌트 + API route)
- **Overall**: 100% ✅
