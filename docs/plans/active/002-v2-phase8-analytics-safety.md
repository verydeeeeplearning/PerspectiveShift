# V2-P8: Analytics & Safety (Selective Attrition + KPI 3층 + Fatigue + Facilitator 설득 방지)

**Status**: Pending
**Started**: -
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P5 (Perspective Exchange — Facilitator 관련)

---

## Overview

### Feature Description

v2의 분석/안전 인프라를 구축한다:

1. **Selective Attrition 분석 프레임**: stance extremity별 코호트 이탈 분석 — "극단 stance 코호트의 이탈률이 온건 코호트 대비 2배 이상이면 재설계 트리거"
2. **KPI 3층 분리**: 경험 품질 / 인지적 정확성 / 정서적 변화로 메트릭을 구조화
3. **Fatigue 감지 + 쿨다운 모드**: 대화 빈도, 감정 체크인, 세션 길이 모니터링 → 피로 징후 시 자동 쿨다운
4. **Facilitator 설득 방지 아키텍처 강화**: LangGraph input schema에서 stance data 완전 차단, 평가 목적함수 구현
5. **LLM 평가 운영 지표 4종**: 수용성 언어 비율, 상대 요약 정확도, 인신공격 빈도, 주제 이탈 빈도

### Success Criteria

- [ ] Selective Attrition 코호트 분석 쿼리/대시보드 구현
- [ ] KPI 3층 매핑 메타데이터 구현
- [ ] Fatigue Score 계산 로직 + 쿨다운 모드 자동 전환
- [ ] Facilitator Input 타입에서 stance 필드 완전 제거 확인
- [ ] LLM 평가 지표 4종 수집 파이프라인
- [ ] 연속 대화 제한 (일 2회)

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `FatigueScore` VO, `CooldownMode` VO, `MetricTier` enum, `DialogueLimit` policy | 피로도, 쿨다운, KPI 모델 |
| Application | `CalculateFatigueUseCase`, `EnforceDailyLimitUseCase`, `AnalyzeAttritionUseCase` | 분석/제한 워크플로 |
| Infrastructure | `FatigueCalculator`, `AttritionAnalyzer`, LLM 평가 파이프라인, Facilitator 검증 | 계산, 분석, 검증 |
| Presentation | 쿨다운 모드 UI, 관리자 대시보드 (선택) | UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Fatigue를 Domain Service로 | 비즈니스 규칙 (연속 대화 제한 등) | 계산 로직이 외부 데이터 필요 |
| 일 2회 제한을 Domain Policy로 | 엔포스먼트는 도메인 규칙 | 유연성 감소 |
| Attrition 분석을 Application Service로 | 조회 + 계산 혼합 | 실시간이 아닌 배치 분석 |
| Facilitator stance 차단을 타입 + 런타임 검증 이중으로 | 타입만으로 불충분할 수 있음 | 약간의 오버헤드 |
| LLM 평가를 비동기 파이프라인으로 | 대화 중 성능 영향 없도록 | 실시간 피드백 불가 |

---

## Implementation Phases

### Sub-Phase 8.1: Domain Layer — Fatigue, CoolDown, 제한 정책
**Goal**: 피로도, 쿨다운, 일일 제한 도메인 모델

#### RED: Write Failing Tests First
- [ ] Test 8.1.1: `FatigueScore` VO 테스트
  - File: `test/unit/domain/value-objects/fatigue-score.test.ts`
  - `level: 'LOW' | 'MEDIUM' | 'HIGH'`
  - 계산 입력: 최근 7일 대화 수, 최근 감정 체크인 결과, 평균 세션 길이
  - HIGH 기준: 7일 내 5회 이상 OR 최근 감정 부정적 OR 세션 길이 지속 증가
  - Expected: Tests FAIL

- [ ] Test 8.1.2: `CooldownMode` VO 테스트
  - File: `test/unit/domain/value-objects/cooldown-mode.test.ts`
  - `active: boolean`
  - `reason: 'FATIGUE' | 'DAILY_LIMIT' | 'USER_REQUEST'`
  - `suggestedActivity: string` (가벼운 콘텐츠 추천)
  - Expected: Tests FAIL

- [ ] Test 8.1.3: `DialogueLimit` policy 테스트
  - File: `test/unit/domain/services/dialogue-limit.test.ts`
  - `canStartDialogue(userId)` → 일 2회 제한 확인
  - 제한 초과 시 CooldownMode 반환
  - Expected: Tests FAIL

- [ ] Test 8.1.4: `MetricTier` enum 테스트
  - File: `test/unit/domain/value-objects/metric-tier.test.ts`
  - EXPERIENCE (경험 품질), COGNITIVE (인지적 정확성), AFFECTIVE (정서적 변화)
  - 각 기존 메트릭에 tier 매핑
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 8.1.5: `FatigueScore` VO 구현
  - File: `src/domain/value-objects/fatigue-score.ts`

- [ ] Task 8.1.6: `CooldownMode` VO 구현
  - File: `src/domain/value-objects/cooldown-mode.ts`

- [ ] Task 8.1.7: `DialogueLimit` Domain Service 구현
  - File: `src/domain/services/dialogue-limit.ts`
  - 일 2회 제한 + 쿨다운 권장

- [ ] Task 8.1.8: `MetricTier` enum 구현
  - File: `src/domain/value-objects/metric-tier.ts`

#### Quality Gate
- [ ] Fatigue 계산 정확
- [ ] 일 2회 제한 동작
- [ ] Domain 외부 의존성 없음

---

### Sub-Phase 8.2: Application Layer — Use Cases
**Goal**: Fatigue 계산, 일일 제한, Attrition 분석

#### RED: Write Failing Tests First
- [ ] Test 8.2.1: `CalculateFatigueUseCase` 테스트
  - File: `test/unit/application/use-cases/calculate-fatigue.test.ts`
  - 사용자의 최근 대화 이력 + 감정 체크인 → FatigueScore 계산
  - HIGH → CooldownMode 자동 활성화
  - Mock: DialogueRepository, FeedbackRepository
  - Expected: Tests FAIL

- [ ] Test 8.2.2: `EnforceDailyLimitUseCase` 테스트
  - File: `test/unit/application/use-cases/enforce-daily-limit.test.ts`
  - 오늘 대화 수 확인 → 2회 미만이면 허용
  - 2회 이상이면 CooldownMode 반환
  - Expected: Tests FAIL

- [ ] Test 8.2.3: `AnalyzeAttritionUseCase` 테스트
  - File: `test/unit/application/use-cases/analyze-attrition.test.ts`
  - stance extremity별 코호트 분류 (극단/중간/온건)
  - 각 코호트의 이탈률 계산
  - 극단 코호트 이탈률이 온건 대비 2배 이상 → alert flag
  - Mock: StanceRepository, EventRepository
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 8.2.4: `CalculateFatigueUseCase` 구현
  - File: `src/application/use-cases/calculate-fatigue.ts`

- [ ] Task 8.2.5: `EnforceDailyLimitUseCase` 구현
  - File: `src/application/use-cases/enforce-daily-limit.ts`

- [ ] Task 8.2.6: `AnalyzeAttritionUseCase` 구현
  - File: `src/application/use-cases/analyze-attrition.ts`
  - 코호트 분류: |stance_value| > 0.7 → 극단, 0.3-0.7 → 중간, < 0.3 → 온건

- [ ] Task 8.2.7: DTOs
  - File: `src/application/dtos/fatigue-output.ts`
  - File: `src/application/dtos/attrition-output.ts`

#### Quality Gate
- [ ] Fatigue → CoolDown 자동 전환
- [ ] 일일 제한 엔포스먼트
- [ ] Attrition 코호트 분석 정확

---

### Sub-Phase 8.3: Infrastructure Layer — Facilitator 검증 & LLM 평가
**Goal**: Facilitator stance 접근 차단 검증, LLM 평가 파이프라인

#### RED: Write Failing Tests First
- [ ] Test 8.3.1: Facilitator Input Schema — stance 필드 제거 검증
  - File: `test/unit/infrastructure/external/facilitator-input-schema.test.ts`
  - `FacilitatorInput` 타입에 stance_vector, demographic, reasoning_tags 필드 없음 확인
  - 허용 필드: toneAnalysis, driftDetection, structureState만
  - Expected: Tests FAIL

- [ ] Test 8.3.2: 런타임 stance 접근 차단 검증
  - File: `test/unit/infrastructure/external/facilitator-safety.test.ts`
  - 프롬프트에 stance/demographic 데이터가 포함되면 에러 또는 필터링
  - Expected: Tests FAIL

- [ ] Test 8.3.3: LLM 평가 지표 수집 테스트
  - File: `test/unit/infrastructure/external/llm-evaluator.test.ts`
  - 대화 텍스트 → 4가지 지표 추출:
    (a) 수용성 언어 비율
    (b) 상대 요약 정확도
    (c) 인신공격/의도 추정 빈도
    (d) 주제 이탈 빈도
  - Expected: Tests FAIL

- [ ] Test 8.3.4: Fatigue 데이터 조회
  - File: `test/unit/infrastructure/persistence/supabase-dialogue-repository.test.ts` 수정
  - 최근 7일 대화 수, 감정 체크인 결과, 세션 길이 조회
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 8.3.5: `FacilitatorInput` 타입 강화
  - File: `src/infrastructure/external/openai-facilitator.ts` 수정
  - stance 관련 필드를 타입에서 완전 제거
  - 런타임 검증: input에 stance 관련 키워드 포함 시 경고 로그

- [ ] Task 8.3.6: Facilitator 프롬프트 안전성 검증 유틸
  - File: `src/infrastructure/external/facilitator-safety.ts`
  - 프롬프트 내 stance 관련 토큰 감지 → 에러

- [ ] Task 8.3.7: `LLMEvaluator` 구현
  - File: `src/infrastructure/external/llm-evaluator.ts`
  - 비동기 평가 파이프라인
  - 대화 완료 후 배치로 실행
  - 4가지 지표 추출 → 저장

- [ ] Task 8.3.8: LLM 평가 프롬프트
  - File: `src/infrastructure/external/evaluator-prompts.ts`

- [ ] Task 8.3.9: `SupabaseEventRepository` 수정 — Attrition 분석 쿼리
  - File: `src/infrastructure/persistence/supabase-event-repository.ts` 수정
  - stance extremity별 이탈률 집계 쿼리

- [ ] Task 8.3.10: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`

#### Quality Gate
- [ ] Facilitator에 stance 데이터 전달 불가 확인
- [ ] LLM 평가 4종 지표 수집 동작
- [ ] Attrition 분석 쿼리 동작

---

### Sub-Phase 8.4: Presentation Layer — 쿨다운 UI & 관리자 뷰
**Goal**: 쿨다운 모드 UI, 일일 제한 안내

#### RED: Write Failing Tests First
- [ ] Test 8.4.1: 쿨다운 모드 UI 테스트
  - File: `test/unit/presentation/components/cooldown-mode.test.tsx`
  - 쿨다운 활성화 시 "오늘은 충분히 대화했어요" 메시지
  - 가벼운 콘텐츠 추천 (Thought Map 재탐색, 과거 대화 하이라이트 등)
  - 매칭/대화 시작 버튼 비활성화
  - Expected: Tests FAIL

- [ ] Test 8.4.2: 일일 제한 안내 UI
  - File: `test/unit/presentation/components/daily-limit-notice.test.tsx`
  - "오늘 남은 대화 횟수: N회"
  - 0회일 때 매칭 버튼 비활성화
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 8.4.3: `CooldownScreen` 컴포넌트
  - File: `src/app/_components/CooldownScreen.tsx`
  - 온화한 톤의 메시지
  - 가벼운 활동 추천
  - 내일 자동 해제 안내

- [ ] Task 8.4.4: `DailyLimitNotice` 컴포넌트
  - File: `src/app/matching/_components/DailyLimitNotice.tsx`
  - 남은 횟수 표시
  - 제한 도달 시 친절한 안내

- [ ] Task 8.4.5: 매칭 페이지에 제한 통합
  - File: `src/app/matching/page.tsx` 수정
  - 매칭 시작 전 fatigue/limit 확인

- [ ] Task 8.4.6: API Routes
  - File: `src/app/api/user/fatigue/route.ts` — Fatigue 상태 조회
  - File: `src/app/api/user/daily-limit/route.ts` — 일일 제한 상태

#### Quality Gate
- [ ] 쿨다운 모드 UI 정상 표시
- [ ] 일일 제한 도달 시 매칭 차단
- [ ] 모바일 반응형

---

### Sub-Phase 8.5: 매칭 흐름에 Fatigue/Limit 통합
**Goal**: 매칭 시작 전 fatigue/limit 체크를 매칭 파이프라인에 삽입

#### RED: Write Failing Tests First
- [ ] Test 8.5.1: `FindMatchCandidatesUseCase` — fatigue/limit 사전 체크
  - File: `test/unit/application/use-cases/find-match-candidates.test.ts` 수정
  - Fatigue HIGH → CooldownError 반환
  - 일일 제한 초과 → DailyLimitError 반환
  - Expected: Tests FAIL

- [ ] Test 8.5.2: `DistanceSafetyPackage` — fatigue 입력 반영
  - File: `test/unit/domain/services/distance-safety-package.test.ts` 수정
  - fatigue HIGH → Distance Band 0.2-0.4 강제
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 8.5.3: `FindMatchCandidatesUseCase` 수정
  - File: `src/application/use-cases/find-match-candidates.ts`
  - 파이프라인 앞단에 fatigue/limit 체크

- [ ] Task 8.5.4: `DistanceSafetyPackage` 수정
  - File: `src/domain/services/distance-safety-package.ts`
  - fatigue 입력 반영 확인/강화

#### Quality Gate
- [ ] Fatigue HIGH → 매칭 차단 동작
- [ ] 일일 제한 → 매칭 차단 동작
- [ ] 기존 매칭 테스트 호환

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 일일 2회 제한이 사용자 불만 유발 | Medium | Medium | 완화 메시지 + 가벼운 콘텐츠 대안 제공 |
| LLM 평가 비용 증가 | Medium | Low | 배치 처리 + 샘플링 |
| Attrition 분석에 충분한 데이터 부족 (초기) | High | Medium | MVP에서는 수동 분석, 자동화는 데이터 축적 후 |
| Facilitator 검증이 과도한 false positive | Low | Medium | 키워드 기반 → 정밀 패턴 매칭 |

## Progress Tracking

- Sub-Phase 8.1 (Domain): 0%
- Sub-Phase 8.2 (Application): 0%
- Sub-Phase 8.3 (Infrastructure): 0%
- Sub-Phase 8.4 (Presentation): 0%
- Sub-Phase 8.5 (Integration): 0%
- **Overall**: 0%

## Notes & Learnings
- Attrition 분석은 초기에는 수동 SQL 쿼리로 시작, 사용자 100명+ 후 자동화
- LLM 평가 프롬프트는 한국어 특화 필요 (수용성 언어 패턴이 영어와 다름)
- Facilitator 검증은 CI에도 통합하여 배포 전 자동 검증
