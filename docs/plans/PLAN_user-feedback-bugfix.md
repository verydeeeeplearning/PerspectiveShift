# Implementation Plan: 사용자 피드백 버그 수정

**Status**: Completed (Implemented)
**Started**: 2026-02-22
**Last Updated**: 2026-02-22
**Source**: 사용자 피드백 대화 로그 (민정, 서채원, 김태환)

---

## 버그 요약

사용자 테스트에서 발견된 8개 이슈를 심각도 순으로 정리:

| # | 버그 | 보고자 | 심각도 | 카테고리 |
|---|------|--------|--------|---------|
| B1 | 확장 질문 시 기존 질문 재출제 | 서채원 | **Critical** | 온보딩 |
| B2 | 특정 화면에서 다음 단계 진행 불가 | 민정 | **Critical** | 온보딩 |
| B3 | 다음 질문으로 이동 시 이전 답변 잔존 | 서채원 | **High** | 온보딩 |
| B4 | 확장 질문 생성 계속 실패 | 서채원 | **High** | 온보딩/API |
| B5 | 입장 작성 시 주제 미표시 | 민정 | **High** | 대화 |
| B6 | Thought Map 결과 재접근 불가 | 민정 | **High** | 온보딩 결과 |
| B7 | 요약카드(공유카드) 사실상 안 보임 | 민정 | **Medium** | 온보딩 결과 |
| B8 | 매칭 기준 설명 부재 | 민정 | **Low** | 매칭 UX |

---

## 근본 원인 분석

### B1: 확장 질문 시 기존 질문 재출제

**파일**: `src/app/(funnel)/onboarding/components/DynamicOnboardingFlow.tsx:103-113`

**원인**: `handlePrecisionSelect`가 정밀도 변경 시 `setAnswers({})` + `setCurrentIndex(0)`으로 모든 답변과 진행 상태를 무조건 초기화함. `OnboardingFlow.tsx`에는 `filterAnswersByQuestionSet` + `firstUnansweredIndex` 로직이 있지만 `DynamicOnboardingFlow`에는 이 로직이 빠져 있음.

```tsx
// DynamicOnboardingFlow.tsx — 현재 (버그)
const handlePrecisionSelect = useCallback((selected) => {
  setPrecision(selected);
  setCurrentIndex(0);       // ← 무조건 처음으로
  setAnswers({});            // ← 기존 답변 전부 삭제
  setGeneratedBatches([]);
  batchLoader.clearPrefetch();
}, [...]);
```

**수정 방향**: 정밀도 변경 시 기존 답변 중 새 시퀀스에 포함된 질문의 답변을 보존하고, 첫 미응답 질문부터 재개.

---

### B2: 특정 화면에서 다음 단계 진행 불가

**파일**: `OpenEndedQuestion.tsx`, `DemographicStep.tsx`

**원인 (복합적)**:
1. `OpenEndedQuestion`에 `key` prop 누락 → React가 컴포넌트를 재사용하면서 내부 상태(`value`, 제출 완료 플래그 등)가 이전 질문 것으로 남음 → `handleSubmit` 후 컴포넌트가 "이미 제출됨" 상태에서 빠져나오지 못할 수 있음
2. `DemographicStep`의 "다음으로" 버튼이 `disabled={!canProceed}`인데, `ageGroup`과 `jobCategory` 모두 선택해야 활성화됨. 왜 비활성인지 사용자에게 피드백 없음

**수정 방향**: `key` prop 추가 + DemographicStep에 미선택 항목 안내 텍스트 추가.

---

### B3: 다음 질문으로 이동 시 이전 답변 잔존

**파일**: `src/app/(funnel)/onboarding/components/OnboardingQuestionRenderer.tsx:48-58`

**원인**: `OpenEndedQuestion` 렌더링 시 `key` prop 미지정. React가 동일 컴포넌트 타입으로 판단하여 인스턴스를 재사용. `useState(initialValue)`은 최초 마운트 시에만 적용되므로, 새 질문으로 이동해도 `value` 상태가 이전 답변 텍스트를 유지함.

```tsx
// OnboardingQuestionRenderer.tsx — 현재 (버그)
return (
  <OpenEndedQuestion
    questionId={question.id}    // ← key 없음
    text={question.text}
    onAnswer={onAnswer}
    initialValue={(answers[question.id] as string) ?? ""}
    ...
  />
);
```

**수정 방향**: `key={String(question.id)}` 추가. B2와 동일 수정으로 해결.

---

### B4: 확장 질문 생성 계속 실패

**파일**: `src/infrastructure/external/openai-question-generator.ts:31`, `src/app/api/onboarding/next-batch/route.ts`

**원인 (복합적)**:
1. `OpenAiQuestionGenerator` 모델명 `"gpt-5-mini"` — 프로덕션 OpenAI API에서 지원하지 않을 경우 모든 호출 실패
2. Primary 실패 → Fallback 실행되지만, Fallback도 실패하면 500 에러 반환
3. `/api/onboarding/next-batch` 라우트의 에러 핸들링이 사용자에게 구체적 원인 전달 없이 generic error 반환
4. `DynamicOnboardingFlow`의 `BatchLoadingIndicator` 에러 상태에서 재시도 UX가 불충분할 수 있음

**수정 방향**: 모델명 환경변수화, Fallback 강건성 강화, 에러 메시지 개선.

---

### B5: 입장 작성 시 주제 미표시

**파일**: `src/domain/entities/dialogue-session.ts`, `src/application/dtos/dialogue-output.ts`, `src/app/(main)/dialogue/[id]/page.tsx`, `TurnSubmissionForm.tsx`

**원인**: `DialogueSession` 엔티티, `DialogueSessionOutput` DTO, 대화 페이지 UI 어디에도 주제(topic) 필드가 없음. `TurnSubmissionForm`의 POSITION 단계에서 "이 주제에 대한 당신의 의견"이라고 하지만 실제 주제가 표시되지 않음.

**수정 방향**: 매칭에서 선택된 주제를 세션에 연결하고, 대화 UI 상단에 주제를 표시.

---

### B6: Thought Map 결과 재접근 불가

**파일**: `src/app/(funnel)/onboarding/result/page.tsx`, `src/app/(funnel)/onboarding/page.tsx`

**원인**: Thought Map 결과가 URL query parameter(`?data=...`)로만 전달됨. DB나 localStorage에 저장되지 않아 페이지를 벗어나면 데이터 영구 소실. Passport 페이지나 홈에서 결과로 돌아가는 경로도 없음.

```tsx
// onboarding/page.tsx — 현재
router.push(`/onboarding/result?data=${encodeURIComponent(JSON.stringify(result))}`);
// → URL을 벗어나면 result 데이터 소실
```

**수정 방향**: 결과 데이터를 localStorage에 캐싱 + Passport 페이지에서 재열람 경로 제공.

---

### B7: 요약카드(공유카드) 사실상 안 보임

**파일**: `src/app/(funnel)/onboarding/result/components/ThoughtMapResult.tsx`

**원인 (복합적)**:
1. `ShareCard`가 "상황 기반 추천 보기"라는 `<details>` 접힘 패널 안에 숨겨져 있음 (기본 접힌 상태)
2. 패널 라벨에 "요약카드" 또는 "공유카드"라는 단어 없음 — 발견 불가
3. `GetContextualRecommendationsUseCase` 결과에 `share_card` 타입이 포함되어야만 표시됨 — 조건부 렌더링

**수정 방향**: ShareCard를 접힘 패널에서 꺼내어 결과 페이지에 직접 노출.

---

### B8: 매칭 기준 설명 부재

**파일**: `src/app/(main)/matching/page.tsx`

**원인**: 매칭 페이지에 "온보딩 입장 벡터 기반 매칭"이라는 설명이 없음. "TODAY'S MATCH" 라벨이 1회 대화 기반 매칭으로 오해를 줌.

**수정 방향**: 매칭 설명 카피 추가.

---

## 구현 계획

### Phase 1: 온보딩 핵심 버그 수정 (B1 + B2 + B3)

**Goal**: 온보딩 플로우의 핵심 UX 결함 해결
**예상 소요**: 40분

#### RED: 실패 테스트 작성

- [x] **1.1** `DynamicOnboardingFlow` 정밀도 변경 시 답변 보존 테스트
  - 파일: `src/app/(funnel)/onboarding/components/__tests__/DynamicOnboardingFlow.test.tsx`
  - 시나리오: LITE 10문항 중 5문항 답변 → STANDARD로 변경 → 기존 5개 답변 유지 + index가 6번째 질문부터 시작
  - Expected: 테스트 FAIL

- [x] **1.2** `OpenEndedQuestion` 질문 변경 시 입력값 초기화 테스트
  - 파일: `src/app/(funnel)/onboarding/components/__tests__/OpenEndedQuestion.test.tsx`
  - 시나리오: question A 답변 후 question B로 전환 → textarea가 빈 값
  - Expected: 테스트 FAIL

#### GREEN: 구현

- [x] **1.3** `OnboardingQuestionRenderer`에 `key={String(question.id)}` 추가 (B2 + B3 동시 해결)
  - 파일: `src/app/(funnel)/onboarding/components/OnboardingQuestionRenderer.tsx`
  - 변경: `<OpenEndedQuestion key={String(question.id)} .../>`
  - `OxQuestion`, `RubricQuestion`에도 동일하게 `key` 추가 (일관성)

- [x] **1.4** `DynamicOnboardingFlow.handlePrecisionSelect` 답변 보존 로직 추가 (B1 해결)
  - 파일: `src/app/(funnel)/onboarding/components/DynamicOnboardingFlow.tsx`
  - 변경:
    ```tsx
    const handlePrecisionSelect = useCallback((selected) => {
      setPrecision(selected);
      if (Object.keys(answers).length > 0) {
        // 기존 답변 중 시드 질문 답변 보존
        const seedIds = new Set(seedQuestions.map(q => String(q.id)));
        const preserved: Record<string, unknown> = {};
        for (const [id, val] of Object.entries(answers)) {
          if (seedIds.has(String(id))) preserved[id] = val;
        }
        setAnswers(preserved);
        const firstUnanswered = seedQuestions.findIndex(
          q => !preserved[String(q.id)]
        );
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : seedQuestions.length);
      } else {
        setAnswers({});
        setCurrentIndex(0);
      }
      setGeneratedBatches([]);
      batchLoader.clearPrefetch();
    }, [...]);
    ```

- [x] **1.5** `DemographicStep` 미선택 항목 안내 텍스트 추가
  - 파일: `src/app/(funnel)/onboarding/components/DemographicStep.tsx`
  - 변경: 버튼 비활성 시 "연령대와 직업을 모두 선택해주세요" 안내 표시

#### Quality Gate
- [x] `pnpm run test:run` — 관련 테스트 통과
- [x] `pnpm run build` — 빌드 성공
- [ ] 수동 검증: LITE → STANDARD 전환 시 기존 답변 유지 확인
- [ ] 수동 검증: 주관식 질문 간 이동 시 입력값 초기화 확인

---

### Phase 2: 확장 질문 실패 수정 (B4)

**Goal**: 확장 질문 생성의 안정성 확보
**예상 소요**: 25분

#### RED: 실패 테스트 작성

- [x] **2.1** `FallbackQuestionGenerator` 빈 결과 방어 테스트
  - 파일: `src/infrastructure/external/__tests__/fallback-question-generator.test.ts`
  - 시나리오: excludeSet이 전체 풀을 포함할 때도 최소 1개 질문 반환
  - Expected: 테스트 FAIL

#### GREEN: 구현

- [x] **2.2** LLM 모델명 환경변수화
  - 파일: `src/infrastructure/external/openai-question-generator.ts`
  - 변경: `model = "gpt-5-mini"` → `model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"`

- [x] **2.3** `FallbackQuestionGenerator` 풀 고갈 방어
  - 파일: `src/infrastructure/external/fallback-question-generator.ts`
  - 변경: 사용 가능한 질문이 `batchSize` 미만이면 exclude 필터 해제하고 전체 풀에서 랜덤 선택 (중복 허용보다 나음)

- [x] **2.4** `/api/onboarding/next-batch` 에러 메시지 개선
  - 파일: `src/app/api/onboarding/next-batch/route.ts`
  - 변경: catch 블록에서 구체적 에러 원인 로깅 + 사용자에게 "잠시 후 다시 시도해주세요" 메시지

- [x] **2.5** `BatchLoadingIndicator` 재시도 UX 개선
  - 파일: `src/app/(funnel)/onboarding/components/BatchLoadingIndicator.tsx`
  - 변경: 에러 시 "기본 질문으로 계속하기" 옵션 추가 (Fallback 정적 질문 사용)

#### Quality Gate
- [x] `pnpm run test:run` — 관련 테스트 통과
- [x] `pnpm run build` — 빌드 성공
- [ ] 수동 검증: API 키 없는 환경에서 Fallback 질문 정상 제공 확인

---

### Phase 3: 대화 주제 표시 (B5)

**Goal**: 대화 시 주제를 명확하게 표시
**예상 소요**: 35분

#### RED: 실패 테스트 작성

- [x] **3.1** `DialogueSession` 엔티티에 `topic` 포함 테스트
  - 파일: `src/domain/entities/__tests__/dialogue-session.test.ts`
  - 시나리오: topic이 포함된 세션 생성 + topic 접근 가능
  - Expected: 테스트 FAIL

- [x] **3.2** `TurnSubmissionForm`에 topic 표시 테스트
  - 파일: `src/app/(main)/dialogue/components/__tests__/TurnSubmissionForm.test.tsx`
  - 시나리오: topic prop 전달 시 화면에 주제 텍스트 렌더링
  - Expected: 테스트 FAIL

#### GREEN: 구현

- [x] **3.3** `DialogueSession` 엔티티에 `topic` 필드 추가
  - 파일: `src/domain/entities/dialogue-session.ts`
  - 변경: `DialogueSessionProps`에 `topic?: string` 추가

- [x] **3.4** `DialogueSessionOutput` DTO에 `topic` 필드 추가
  - 파일: `src/application/dtos/dialogue-output.ts`
  - 변경: `topic: string` 추가

- [x] **3.5** `GetDialogueSessionUseCase`에서 topic 매핑
  - 파일: `src/application/use-cases/get-dialogue-session.ts`
  - 변경: 엔티티 → DTO 변환 시 topic 포함

- [x] **3.6** 매칭 카드의 주제를 세션 생성 시 전달
  - 파일: `src/app/api/dialogue/sessions/route.ts` (POST)
  - 변경: 세션 생성 시 매칭 카드의 topic을 세션에 저장

- [x] **3.7** 대화 페이지 + `TurnSubmissionForm`에 주제 표시
  - 파일: `src/app/(main)/dialogue/[id]/page.tsx`, `TurnSubmissionForm.tsx`
  - 변경: 페이지 상단에 주제 배지 표시, POSITION 단계에서 주제 텍스트 포함

#### Quality Gate
- [x] `pnpm run test:run` — 관련 테스트 통과
- [x] `pnpm run build` — 빌드 성공
- [ ] 수동 검증: 대화 페이지에서 주제가 보이는지 확인

---

### Phase 4: 결과 재접근 + 공유카드 노출 (B6 + B7)

**Goal**: Thought Map 결과 영속화 + 공유카드 가시성 확보
**예상 소요**: 35분

#### RED: 실패 테스트 작성

- [x] **4.1** 결과 데이터 localStorage 저장 테스트
  - 파일: `src/app/(funnel)/onboarding/result/__tests__/page.test.tsx`
  - 시나리오: 결과 페이지 로드 시 localStorage에 `ps-thought-map` 키로 저장
  - Expected: 테스트 FAIL

#### GREEN: 구현

- [x] **4.2** 결과 페이지에서 localStorage 캐싱
  - 파일: `src/app/(funnel)/onboarding/result/page.tsx`
  - 변경: 결과 데이터 로드 시 `localStorage.setItem("ps-thought-map", JSON.stringify(data))` 저장
  - URL param 없을 때 localStorage에서 복구 시도

- [x] **4.3** Passport 페이지에 "내 사고 지도" 섹션 추가
  - 파일: `src/app/(main)/passport/page.tsx`
  - 변경: localStorage에서 thought map 데이터 로드 → 있으면 요약 표시 + "자세히 보기" 링크

- [x] **4.4** ShareCard를 접힘 패널에서 꺼내어 직접 노출 (B7 해결)
  - 파일: `src/app/(funnel)/onboarding/result/components/ThoughtMapResult.tsx`
  - 변경: `<details>` 안의 ShareCard를 결과 페이지 하단에 독립 섹션으로 이동
  - "나의 입장 카드" 제목과 함께 항상 표시 (조건부 렌더링 제거)

- [x] **4.5** ShareCard 공유 기능 확인
  - 파일: `src/app/(funnel)/onboarding/result/components/ShareCard.tsx`
  - 변경: 공유 버튼 클릭 시 Web Share API 또는 클립보드 복사 동작 확인

#### Quality Gate
- [x] `pnpm run test:run` — 관련 테스트 통과
- [x] `pnpm run build` — 빌드 성공
- [ ] 수동 검증: 결과 페이지 → 다른 페이지 → /passport → "내 사고 지도" 접근 가능
- [ ] 수동 검증: 공유 카드가 결과 페이지에서 바로 보이는지 확인

---

### Phase 5: 매칭 UX 개선 (B8)

**Goal**: 매칭 기준 설명으로 사용자 혼동 해소
**예상 소요**: 10분

#### 구현

- [x] **5.1** 매칭 페이지 설명 카피 보강
  - 파일: `src/app/(main)/matching/page.tsx`
  - 변경: 기존 부제 아래에 매칭 기준 설명 추가
    ```
    "온보딩에서 작성한 입장을 기반으로 적절한 의견 거리의 상대를 찾습니다.
     정밀도를 높이면 더 정확한 매칭이 가능합니다."
    ```

- [x] **5.2** 매칭 카드에서 "TODAY'S MATCH" → 입장 기반 표현으로 변경
  - 파일: `src/app/(main)/matching/components/MatchCardV3.tsx` 또는 `EnergyReactiveMatchCard.tsx`
  - 변경: "TODAY'S MATCH" → "입장 기반 추천" 또는 유사 표현

#### Quality Gate
- [x] `pnpm run build` — 빌드 성공
- [ ] 수동 검증: 매칭 페이지에서 설명이 자연스럽게 보이는지 확인

---

## 구현 순서 및 의존성

```
Phase 1 (B1+B2+B3: 온보딩 핵심) ──→ Phase 2 (B4: 확장 질문) ──→ 커밋 A
                                                                      │
Phase 3 (B5: 대화 주제) ──────────────────────────────────────→ 커밋 B
                                                                      │
Phase 4 (B6+B7: 결과 재접근) ──→ Phase 5 (B8: 매칭 UX) ──────→ 커밋 C
```

Phase 1-2는 순차 (온보딩 흐름 관련), Phase 3과 Phase 4-5는 독립 병렬 가능.

---

## 예상 총 소요 시간

| Phase | 소요 |
|-------|------|
| Phase 1: 온보딩 핵심 (B1+B2+B3) | 40분 |
| Phase 2: 확장 질문 (B4) | 25분 |
| Phase 3: 대화 주제 (B5) | 35분 |
| Phase 4: 결과 재접근 (B6+B7) | 35분 |
| Phase 5: 매칭 UX (B8) | 10분 |
| **합계** | **~2시간 25분** |

---

## 리스크 평가

| 리스크 | 확률 | 영향 | 완화 |
|--------|------|------|------|
| Phase 1 답변 보존 로직이 질문 ID 타입 불일치로 실패 | 중간 | 높음 | 문자열 변환 통일 (`String(id)`) |
| Phase 3 topic 필드 추가가 기존 세션 데이터와 호환 불가 | 낮음 | 중간 | optional 필드로 추가, 없으면 "자유 주제" 표시 |
| Phase 4 localStorage 용량 초과 | 매우 낮음 | 낮음 | 단일 JSON 객체 (~2KB) |
| 모델명 변경 후 API 호출 패턴 변화 | 낮음 | 중간 | 환경변수 기본값으로 안전한 모델 사용 |

---

## 롤백 전략

- 각 Phase를 별도 커밋으로 분리하여 선택적 revert 가능
- Phase 1: `key` prop 추가는 순수 React 패턴이므로 부작용 없음
- Phase 3: `topic` 필드는 optional이므로 기존 데이터 호환
- Phase 4: localStorage 사용은 클라이언트 전용, 서버 영향 없음

---

## 실행 로그 (2026-02-22)

- [x] 타깃 테스트 통과:
  - `DynamicOnboardingFlow`, `BatchLoadingIndicator`, `OnboardingQuestionRenderer`, `OpenEndedQuestion`, `ThoughtMapResult`, `onboarding/result/page`
  - `fallback-question-generator`, `dialogue-session`, `create-agent-dialogue-session`, `POST /api/dialogue/sessions`, `TurnSubmissionForm`, `MatchCardV3`
- [x] `pnpm build` 성공 (타입/빌드 통과, 기존 lint warning만 존재)
- [ ] 수동 검증 항목은 미실행 (체크리스트 유지)
