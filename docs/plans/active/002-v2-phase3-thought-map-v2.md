# V2-P3: Thought Map v2 (별명 시스템 + Misperception 교정 카드 + 비교 뷰 확장)

**Status**: Complete
**Started**: 2026-02-19
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P2 (6차원 Stance Profile)

---

## Overview

### Feature Description

Thought Map을 세 가지 방향으로 강화한다:

1. **별명(Alias) 시스템**: MBTI식 유형이 아닌, 가장 두드러진 특징을 재미있게 표현하는 별명 + 상대적 포지셔닝 카드
2. **Misperceived Polarization 교정 카드**: 사용자의 타집단 추정치와 실제 분포를 비교하는 메타인지 교정 모듈
3. **비교 뷰 5단계 확장**: Level 0-4 (전체 → 지역 → 연령대 → 성별 → 복합 필터)

### Success Criteria

- [ ] 별명 시스템: 5종 이상 별명 + 할당 알고리즘 구현
- [ ] 별명 + 축별 포지셔닝 카드 UI 구현
- [ ] Misperception 교정 카드: 슬라이더 예측 → 실제 비교 → 차이 시각화
- [ ] 교정 카드 SNS 공유 기능
- [ ] 비교 뷰 Level 0-4 구현 (Demographic 입력 연동)
- [ ] K-Anonymity (K=15) 적용
- [ ] 카드 공유 기능

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `ThoughtMapAlias` VO, `MisperceptionResult` VO, `ThoughtMap` entity 수정 | 별명 할당, 오해 교정 로직 |
| Application | `GenerateAliasUseCase`, `CalculateMisperceptionUseCase`, `GenerateThoughtMapUseCase` 수정 | 오케스트레이션 |
| Infrastructure | `BaselineProvider` 수정, Repository 수정 | Baseline 데이터 비교, 저장 |
| Presentation | `AliasCard`, `MisperceptionCard`, `ComparisonView` 컴포넌트 | UI/UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| 별명을 규칙 기반으로 할당 (LLM 아님) | 일관성 + 비용 절감 | LLM 기반보다 표현력 제한 |
| Misperception은 baseline 대비로 계산 | 앱 참여자 수 부족 시에도 동작 | 외부 baseline 정확도에 의존 |
| K-Anonymity K=15 | v2 스펙 준수 | K가 높으면 세분화 불가 상황 빈번 |

---

## Implementation Phases

### Sub-Phase 3.1: Domain Layer — 별명 & Misperception 모델
**Goal**: 별명 할당 로직, Misperception 결과 모델 정의

#### RED: Write Failing Tests First
- [ ] Test 3.1.1: `ThoughtMapAlias` VO 테스트
  - File: `test/unit/domain/value-objects/thought-map-alias.test.ts`
  - 5개 별명 타입 존재 확인 (신중한 저울, 뜨거운 논객, 나침반 없는 탐험가, 흔들리지 않는 산, 유연한 물결)
  - 각 별명에 이모지, 한국어 이름, 설명 문구 존재
  - Expected: Tests FAIL

- [ ] Test 3.1.2: 별명 할당 알고리즘 테스트
  - File: `test/unit/domain/entities/thought-map.test.ts` 수정
  - 대부분 축이 중도 → "신중한 저울"
  - 여러 축에서 강한 입장 → "뜨거운 논객"
  - 축별 입장 분산 큼 → "나침반 없는 탐험가"
  - 특정 가치에 일관되게 강함 → "흔들리지 않는 산"
  - 상황별 판단 달라짐 → "유연한 물결"
  - Expected: Tests FAIL

- [ ] Test 3.1.3: `MisperceptionResult` VO 테스트
  - File: `test/unit/domain/value-objects/misperception-result.test.ts`
  - `userPrediction: number` (사용자 예측값)
  - `actualBaseline: number` (실제 baseline)
  - `gap: number` (차이 절대값)
  - `gapPercentage: number` (% 환산)
  - `isAccurate: boolean` (gap < 임계값)
  - Expected: Tests FAIL

- [ ] Test 3.1.4: `ThoughtMap` entity에 alias, misperception 필드 추가
  - File: `test/unit/domain/entities/thought-map.test.ts` 수정
  - `alias: ThoughtMapAlias` 필드
  - `misperceptions: MisperceptionResult[]` 필드 (선택)
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 3.1.5: `ThoughtMapAlias` VO 구현
  - File: `src/domain/value-objects/thought-map-alias.ts`

- [ ] Task 3.1.6: 별명 할당 로직 구현
  - File: `src/domain/entities/thought-map.ts` 수정
  - `assignAlias(stanceVector: StanceVector): ThoughtMapAlias` 메서드

- [ ] Task 3.1.7: `MisperceptionResult` VO 구현
  - File: `src/domain/value-objects/misperception-result.ts`

- [ ] Task 3.1.8: `ThoughtMap` entity 수정
  - File: `src/domain/entities/thought-map.ts`

#### Quality Gate
- [ ] 5종 별명 모두 할당 가능
- [ ] MisperceptionResult 계산 정확
- [ ] Domain 외부 의존성 없음

---

### Sub-Phase 3.2: Application Layer — Use Cases
**Goal**: 별명 생성, Misperception 계산 use case

#### RED: Write Failing Tests First
- [ ] Test 3.2.1: `GenerateThoughtMapUseCase` 수정 — 별명 포함 테스트
  - File: `test/unit/application/use-cases/generate-thought-map.test.ts` 수정
  - 생성된 ThoughtMap에 alias 포함 확인
  - Expected: Tests FAIL

- [ ] Test 3.2.2: `CalculateMisperceptionUseCase` 테스트
  - File: `test/unit/application/use-cases/calculate-misperception.test.ts`
  - 사용자 예측값 + baseline → MisperceptionResult 생성
  - 예측이 정확한 경우 / 부정확한 경우 분기
  - Mock: BaselineProvider
  - Expected: Tests FAIL

- [ ] Test 3.2.3: `MisperceptionInput` DTO 테스트
  - File: `test/unit/application/dtos/misperception-input.test.ts`
  - `dimension: StanceDimension`, `prediction: number` 구조
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 3.2.4: `GenerateThoughtMapUseCase` 수정
  - File: `src/application/use-cases/generate-thought-map.ts`
  - 별명 할당 호출 추가

- [ ] Task 3.2.5: `CalculateMisperceptionUseCase` 구현
  - File: `src/application/use-cases/calculate-misperception.ts`
  - BaselineProvider에서 반대 stance 분포 조회
  - 사용자 예측 vs 실제 비교

- [ ] Task 3.2.6: DTOs 구현
  - File: `src/application/dtos/misperception-input.ts`
  - File: `src/application/dtos/misperception-output.ts`

- [ ] Task 3.2.7: `ThoughtMapOutput` DTO 수정 — 별명 포함
  - File: `src/application/dtos/thought-map-output.ts` 수정

#### Quality Gate
- [ ] Use case 포트 인터페이스에만 의존
- [ ] DTO 경계 준수

---

### Sub-Phase 3.3: Infrastructure Layer — Baseline & Repository
**Goal**: Misperception 계산용 Baseline 데이터, 저장

#### RED: Write Failing Tests First
- [ ] Test 3.3.1: `KGSSBaselineProvider` 수정 — 반대 stance 분포 제공
  - File: `test/unit/infrastructure/external/kgss-baseline-provider.test.ts` 수정
  - `getOppositeDistribution(dimension, stanceValue)` 메서드 테스트
  - Expected: Tests FAIL

- [ ] Test 3.3.2: Repository — alias, misperception 저장/조회
  - File: `test/unit/infrastructure/persistence/supabase-stance-repository.test.ts` 수정
  - ThoughtMap 저장 시 alias 포함 확인
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 3.3.3: `BaselineProvider` 인터페이스 확장
  - File: `src/domain/interfaces/baseline-provider.ts`
  - `getOppositeDistribution(dimension, stanceValue): number` 추가

- [ ] Task 3.3.4: `KGSSBaselineProvider` 수정
  - File: `src/infrastructure/external/kgss-baseline-provider.ts`
  - 반대 입장 평균값 반환 로직

- [ ] Task 3.3.5: Repository 수정
  - File: `src/infrastructure/persistence/supabase-stance-repository.ts` 수정
  - alias 컬럼 매핑

- [ ] Task 3.3.6: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`

#### Quality Gate
- [ ] Baseline 데이터 정상 반환
- [ ] 저장/조회 정상

---

### Sub-Phase 3.4: Presentation Layer — UI 구현
**Goal**: 별명 카드, Misperception 카드, 비교 뷰 UI

#### RED: Write Failing Tests First
- [ ] Test 3.4.1: `AliasCard` 컴포넌트 테스트
  - File: `test/unit/presentation/components/alias-card.test.tsx`
  - 별명 이모지 + 이름 + 축별 바 차트 렌더링
  - 설명 문구 표시
  - "카드로 공유하기" 버튼 존재
  - Expected: Tests FAIL

- [ ] Test 3.4.2: `MisperceptionCard` 컴포넌트 테스트
  - File: `test/unit/presentation/components/misperception-card.test.tsx`
  - "한 가지 실험해볼까요?" 진입 화면
  - 슬라이더 예측 입력 UI
  - 예측 vs 실제 비교 시각화
  - 차이 문구 표시 ("반대편을 N% 더 극단적으로 예상했어요")
  - "카드로 공유하기" 버튼
  - Expected: Tests FAIL

- [ ] Test 3.4.3: `ComparisonView` 컴포넌트 테스트
  - File: `test/unit/presentation/components/comparison-view.test.tsx`
  - Level 0-4 탭 전환
  - Demographic 미입력 시 Level 1+ 비활성화
  - K-Anonymity: 15명 미만 세그먼트 비활성화
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 3.4.4: `AliasCard` 컴포넌트
  - File: `src/app/onboarding/_components/AliasCard.tsx`
  - 이모지 + 별명 + 축별 바 차트 + 설명 문구
  - 공유 기능 (Web Share API or 이미지 다운로드)

- [ ] Task 3.4.5: `MisperceptionCard` 컴포넌트
  - File: `src/app/onboarding/_components/MisperceptionCard.tsx`
  - Step 1: "실험해볼까요?" (선택형 진입)
  - Step 2: 슬라이더 예측 (가장 stance 차이 큰 축 기준)
  - Step 3: 예측 vs 실제 비교 시각화 + 차이 문구
  - Step 4: 공유 CTA

- [ ] Task 3.4.6: `ComparisonView` 컴포넌트
  - File: `src/app/onboarding/_components/ComparisonView.tsx`
  - Level 0: 전체/Baseline 대비
  - Level 1-4: Demographic 필터 (지역/연령대/성별/복합)
  - K-Anonymity 체크 로직

- [ ] Task 3.4.7: API Routes
  - File: `src/app/api/onboarding/misperception/route.ts`
  - POST: 사용자 예측값 제출 → MisperceptionResult 반환

- [ ] Task 3.4.8: 결과 페이지 통합
  - File: `src/app/onboarding/result/page.tsx` 수정
  - AliasCard + MisperceptionCard(선택형) + ComparisonView
  - "카드로 공유하기" + "대화 상대 찾기 →" CTA

#### Quality Gate
- [ ] 별명 카드 정상 렌더링 (5종 모두)
- [ ] Misperception 슬라이더 → 비교 → 결과 흐름 완성
- [ ] 비교 뷰 Level 전환 동작
- [ ] K-Anonymity 필터 적용
- [ ] 모바일 반응형
- [ ] 공유 기능 동작

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 별명 할당 알고리즘이 극단 케이스에서 부정확 | Medium | Low | 규칙 기반 + threshold 튜닝 |
| Baseline 데이터 부족으로 Misperception 정확도 떨어짐 | Medium | Medium | KGSS 데이터로 충분히 커버 |
| 공유 기능이 플랫폼별로 다르게 동작 | Low | Low | Web Share API + 이미지 다운로드 fallback |

## Progress Tracking

- Sub-Phase 3.1 (Domain): 0%
- Sub-Phase 3.2 (Application): 0%
- Sub-Phase 3.3 (Infrastructure): 0%
- Sub-Phase 3.4 (Presentation): 0%
- **Overall**: 0%
