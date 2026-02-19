# V2-P4: Adaptive Matching (Distance-Safety Package) + Topic Ladder + Effort Gradient

**Status**: Complete
**Started**: 2026-02-19
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P2 (6차원 Stance Profile + Confidence Map)

---

## Overview

### Feature Description

현재 고정된 opinion distance sweet spot [0.4-0.7]을 **적응형 Distance-Safety Package**로 전환한다. 사용자의 dialogue readiness, confidence(확신 강도), fatigue(피로도), 대화 경험 이력에 따라 허용 Distance Band를 동적으로 조정하고, Distance Band에 연동하여 Topic Level, Facilitator 개입 강도, Reflection 강제 수준을 **패키지로 스케일링**한다.

또한 **Topic Ladder** (난이도 사다리 Level 0-3)와 **Effort Gradient** (5분/15분/30분+ 대화 포맷)을 도입한다.

### Success Criteria

- [ ] 적응형 Distance Band 계산 로직 구현
- [ ] Distance-Safety Package: Distance ↔ Topic Level ↔ Facilitator 강도 ↔ Reflection 수준 연동
- [ ] Topic Ladder Level 0-3 구현
- [ ] 첫 대화는 무조건 Distance 0.2-0.4 + Level 0-1
- [ ] Effort Gradient: 5분 quick / 15분 structured / 30분+ deep
- [ ] 매칭 화면에서 난이도 선택 UI
- [ ] "Micro-Debate" → "Perspective Exchange" 명칭 변경
- [ ] 기존 매칭 테스트 호환

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `TopicLevel` VO, `EffortGrade` VO, `DistanceBand` VO, `DistanceSafetyPackage` Domain Service, `MatchCandidate` 수정 | 적응형 매칭 비즈니스 로직 |
| Application | `FindMatchCandidatesUseCase` 수정, `CreateMatchProposalUseCase` 수정, DTOs 수정 | 매칭 워크플로 |
| Infrastructure | Repository 수정, Facilitator config 연동 | 저장, Facilitator 강도 설정 |
| Presentation | 매칭 화면 재설계, 난이도 선택 UI | UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| `DistanceSafetyPackage`를 Domain Service로 | 4개 변수 연동 로직이 복잡, 순수 비즈니스 규칙 | Entity에 넣기엔 과중 |
| Topic Level을 대화 생성 시 확정 | 대화 중 변경 불가 → 일관성 | 유연성 감소 |
| 첫 대화 Distance 0.2-0.4 강제 | v2 "첫 경험은 무조건 안전하게" 원칙 | 매칭 풀 축소 가능 |
| Effort Gradient 3종 | v2 스펙 (5/15/30분) | 포맷별 FSM 분기 필요 |

---

## Implementation Phases

### Sub-Phase 4.1: Domain Layer — Value Objects & Domain Service
**Goal**: 적응형 매칭 도메인 모델 정의

#### RED: Write Failing Tests First
- [ ] Test 4.1.1: `TopicLevel` VO 테스트
  - File: `test/unit/domain/value-objects/topic-level.test.ts`
  - Level 0 (일상 가치/경험), 1 (정책 메커니즘), 2 (가치 충돌), 3 (정체성-직결)
  - 유효 범위 (0-3) 검증
  - 각 Level의 라벨, 리스크, 적합 대상 속성
  - Expected: Tests FAIL

- [ ] Test 4.1.2: `EffortGrade` VO 테스트
  - File: `test/unit/domain/value-objects/effort-grade.test.ts`
  - QUICK (5분), STRUCTURED (15분), DEEP (30분+)
  - 각 grade별 시간 제한, 단계 수
  - Expected: Tests FAIL

- [ ] Test 4.1.3: `DistanceBand` VO 테스트
  - File: `test/unit/domain/value-objects/distance-band.test.ts`
  - min/max range (예: 0.2-0.4)
  - `contains(distance)` 메서드
  - 3가지 표준 Band: LOW(0.2-0.4), MEDIUM(0.3-0.6), HIGH(0.4-0.8)
  - Expected: Tests FAIL

- [ ] Test 4.1.4: `DistanceSafetyPackage` Domain Service 테스트
  - File: `test/unit/domain/services/distance-safety-package.test.ts`
  - **입력**: readiness, confidence, fatigue, isFirstDialogue, recentSatisfaction
  - **출력**: DistanceBand, TopicLevel 허용 범위, Facilitator 강도, Reflection 강제 수준
  - 케이스 1: readiness 낮음 OR confidence 강함 OR fatigue 높음 → Band 0.2-0.4
  - 케이스 2: readiness 중간 AND confidence 중간 → Band 0.3-0.6
  - 케이스 3: readiness 높음 AND 최근 만족도 높음 → Band 0.4-0.8
  - 케이스 4: 첫 대화 (모든 사용자) → Band 0.2-0.4 강제
  - 패키지 연동: Band LOW → Topic 0-1, Facilitator 중간, Reflection 요약만
  - 패키지 연동: Band HIGH → Topic 1-3, Facilitator 높음, Reflection 전체 강제
  - Expected: Tests FAIL

- [ ] Test 4.1.5: `MatchCandidate` entity 수정 — Package 포함
  - File: `test/unit/domain/entities/match-candidate.test.ts` 수정
  - 적응형 Distance Band 내의 후보만 유효
  - Expected: Tests FAIL

- [ ] Test 4.1.6: `MatchScore` VO 수정 — confidence 반영
  - File: `test/unit/domain/value-objects/match-score.test.ts` 수정
  - 기존: `0.6 * distanceFit + 0.4 * readiness`
  - 변경: confidence 가중치 추가 가능 (옵션)
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 4.1.7: `TopicLevel` VO 구현
  - File: `src/domain/value-objects/topic-level.ts`

- [ ] Task 4.1.8: `EffortGrade` VO 구현
  - File: `src/domain/value-objects/effort-grade.ts`

- [ ] Task 4.1.9: `DistanceBand` VO 구현
  - File: `src/domain/value-objects/distance-band.ts`

- [ ] Task 4.1.10: `DistanceSafetyPackage` Domain Service 구현
  - File: `src/domain/services/distance-safety-package.ts`
  - 4개 입력 → Package 계산 로직
  - Distance-Safety 연동 테이블 구현

- [ ] Task 4.1.11: `MatchCandidate` 수정
  - File: `src/domain/entities/match-candidate.ts`
  - 적응형 Band 기반 필터링

- [ ] Task 4.1.12: `MatchScore` 수정 (옵션)
  - File: `src/domain/value-objects/match-score.ts`

#### REFACTOR: Clean Up
- [ ] Task 4.1.13: Domain Service 디렉토리 정리 (`src/domain/services/`)

#### Quality Gate
- [ ] 모든 케이스별 Package 계산 정확
- [ ] 첫 대화 강제 Distance 동작
- [ ] Domain 외부 의존성 없음

---

### Sub-Phase 4.2: Application Layer — Use Case 수정
**Goal**: 매칭 use case에 적응형 로직 통합

#### RED: Write Failing Tests First
- [ ] Test 4.2.1: `FindMatchCandidatesUseCase` 수정 — 적응형 Distance 적용
  - File: `test/unit/application/use-cases/find-match-candidates.test.ts` 수정
  - 사용자의 readiness/confidence/fatigue 기반으로 적응형 Band 계산
  - Band 내의 후보만 반환
  - 첫 대화 사용자: 0.2-0.4 Band 강제
  - Mock: StanceRepository, DialogueRepository (이전 대화 이력)
  - Expected: Tests FAIL

- [ ] Test 4.2.2: `CreateMatchProposalUseCase` 수정 — Package 포함
  - File: `test/unit/application/use-cases/create-match-proposal.test.ts` 수정
  - Proposal에 topicLevel, effortGrade, facilitatorIntensity 포함
  - Expected: Tests FAIL

- [ ] Test 4.2.3: DTOs 수정 테스트
  - File: `test/unit/application/dtos/match-input.test.ts` 수정
  - `topicLevel`, `effortGrade` 선택 입력 추가
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 4.2.4: `FindMatchCandidatesUseCase` 수정
  - File: `src/application/use-cases/find-match-candidates.ts`
  - DistanceSafetyPackage 호출 → 적응형 Band 기반 필터

- [ ] Task 4.2.5: `CreateMatchProposalUseCase` 수정
  - File: `src/application/use-cases/create-match-proposal.ts`
  - Package 정보를 Proposal에 첨부

- [ ] Task 4.2.6: DTOs 수정
  - File: `src/application/dtos/match-input.ts`
  - File: `src/application/dtos/match-output.ts`

- [ ] Task 4.2.7: 기존 `OpinionDistance` sweet spot 로직 제거/수정
  - File: `src/domain/value-objects/opinion-distance.ts`
  - 고정 sweet spot → 적응형 Band 참조로 변경

#### Quality Gate
- [ ] 적응형 매칭 전체 흐름 동작
- [ ] 기존 매칭 테스트 호환

---

### Sub-Phase 4.3: Infrastructure Layer — 피로도 데이터 & Repository
**Goal**: Fatigue 데이터 수집, Package 저장

#### RED: Write Failing Tests First
- [ ] Test 4.3.1: `DialogueRepository` — 사용자 대화 이력 조회
  - File: `test/unit/infrastructure/persistence/supabase-dialogue-repository.test.ts` 수정
  - 최근 N일 대화 수, 최근 만족도 조회
  - Expected: Tests FAIL

- [ ] Test 4.3.2: `MatchProposal` 저장 — Package 정보 포함
  - File: `test/unit/infrastructure/persistence/supabase-match-repository.test.ts` 수정
  - topic_level, effort_grade, facilitator_intensity 컬럼
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 4.3.3: `DialogueRepository` 인터페이스 확장
  - File: `src/domain/interfaces/dialogue-repository.ts`
  - `getRecentStats(userId): { count, avgSatisfaction }` 추가

- [ ] Task 4.3.4: `SupabaseDialogueRepository` 수정
  - File: `src/infrastructure/persistence/supabase-dialogue-repository.ts`

- [ ] Task 4.3.5: `SupabaseMatchRepository` 수정
  - File: `src/infrastructure/persistence/supabase-match-repository.ts`

- [ ] Task 4.3.6: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`

#### Quality Gate
- [ ] 대화 이력 조회 동작
- [ ] Package 정보 저장/조회 동작

---

### Sub-Phase 4.4: Presentation Layer — 매칭 UI 재설계
**Goal**: 난이도 선택, Effort Gradient 선택, 매칭 화면 개편

#### RED: Write Failing Tests First
- [ ] Test 4.4.1: 매칭 화면 — 난이도 선택 UI 테스트
  - File: `test/unit/presentation/components/topic-level-selector.test.tsx`
  - "오늘은 어떤 깊이로 대화할까요?" 프롬프트
  - Level 0-2 선택지 (Level 3는 조건부 노출)
  - 각 Level 라벨 + 설명
  - Expected: Tests FAIL

- [ ] Test 4.4.2: Effort Gradient 선택 UI 테스트
  - File: `test/unit/presentation/components/effort-grade-selector.test.tsx`
  - 5분 quick / 15분 structured / 30분+ deep 선택
  - Expected: Tests FAIL

- [ ] Test 4.4.3: 매칭 결과 — Package 정보 표시
  - File: `test/unit/presentation/components/match-proposal-card.test.tsx` 수정
  - Topic Level, Effort Grade 표시
  - "Perspective Exchange" 라벨 (Micro-Debate 아님)
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 4.4.4: `TopicLevelSelector` 컴포넌트
  - File: `src/app/matching/_components/TopicLevelSelector.tsx`
  - Level 0-2 카드형 선택 (Level 3 조건부)
  - 첫 3회 대화: Level 0-1 권장 표시

- [ ] Task 4.4.5: `EffortGradeSelector` 컴포넌트
  - File: `src/app/matching/_components/EffortGradeSelector.tsx`
  - 3가지 포맷 카드형 선택
  - 각 포맷의 시간/단계 수 설명

- [ ] Task 4.4.6: 매칭 페이지 수정
  - File: `src/app/matching/page.tsx` 수정
  - 난이도 선택 → Effort 선택 → 매칭 시작 흐름

- [ ] Task 4.4.7: "Micro-Debate" → "Perspective Exchange" 명칭 변경
  - 전체 코드베이스에서 rename
  - UI 라벨, API 문서, 테스트 등

- [ ] Task 4.4.8: API Routes 수정
  - File: `src/app/api/matching/candidates/route.ts` 수정
  - File: `src/app/api/matching/proposals/route.ts` 수정
  - topicLevel, effortGrade 파라미터 추가

#### Quality Gate
- [ ] 난이도 선택 → 매칭 → Proposal 전체 흐름
- [ ] 첫 대화 사용자: Level 0-1 권장 표시
- [ ] "Perspective Exchange" 명칭 전체 적용
- [ ] 모바일 반응형

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 적응형 Band가 매칭 풀을 과도하게 축소 | Medium | High | Band를 넓히거나 대기 시간 허용 |
| DistanceSafetyPackage 로직 복잡도 | Medium | Medium | 단계적 도입: 먼저 3가지 Band만, 이후 세분화 |
| Effort Gradient별 FSM 분기 | Medium | Medium | 공통 FSM + 단계 수만 다르게 |

## Progress Tracking

- Sub-Phase 4.1 (Domain): 0%
- Sub-Phase 4.2 (Application): 0%
- Sub-Phase 4.3 (Infrastructure): 0%
- Sub-Phase 4.4 (Presentation): 0%
- **Overall**: 0%
