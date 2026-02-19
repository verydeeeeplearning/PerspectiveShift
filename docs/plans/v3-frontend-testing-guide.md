# v3.0 Frontend 테스트 가이드

**작성일**: 2026-02-19
**대상 버전**: v3.0 (V3-P1 ~ V3-P11)
**현재 상태**: Unit 267 파일 / 1,431 테스트 전체 통과 / Build Clean

---

## 목차

1. [테스트 인프라 및 방법론](#1-테스트-인프라-및-방법론)
2. [V3-P1 정밀도 사다리 + 질문 Bank](#2-v3-p1-정밀도-사다리--질문-bank)
3. [V3-P2 공유 카드 3종 + Next Step Hub](#3-v3-p2-공유-카드-3종--next-step-hub)
4. [V3-P3 매칭 카드 UX](#4-v3-p3-매칭-카드-ux)
5. [V3-P4 대화 UX 개선](#5-v3-p4-대화-ux-개선)
6. [V3-P5 Reflection 전면 개편](#6-v3-p5-reflection-전면-개편)
7. [V3-P6 Peak-End 카드 + 공동 요약](#7-v3-p6-peak-end-카드--공동-요약)
8. [V3-P7 나쁜 경험 복구 루틴](#8-v3-p7-나쁜-경험-복구-루틴)
9. [V3-P8 상태 기반 홈 + 리텐션 루프](#9-v3-p8-상태-기반-홈--리텐션-루프)
10. [V3-P9 이벤트 로깅 택소노미](#10-v3-p9-이벤트-로깅-택소노미)
11. [V3-P10 마이크로카피 + A/B 인프라](#11-v3-p10-마이크로카피--ab-인프라)
12. [V3-P11 Stance Drift + Perspective Passport](#12-v3-p11-stance-drift--perspective-passport)
13. [Cross-Cutting 테스트 항목](#13-cross-cutting-테스트-항목)
14. [통합 테스트 시나리오](#14-통합-테스트-시나리오)
15. [E2E 테스트 시나리오](#15-e2e-테스트-시나리오)
16. [테스트 커버리지 요약](#16-테스트-커버리지-요약)

---

## 1. 테스트 인프라 및 방법론

### 1.1 기술 스택

| 도구 | 역할 | 비고 |
|------|------|------|
| **Vitest** | 테스트 러너 + assertion | `vitest.config.ts`, jsdom 환경 |
| **@testing-library/react** | 컴포넌트 렌더링 + DOM 쿼리 | 접근성 기반 쿼리 우선 |
| **@testing-library/user-event** | 사용자 인터랙션 시뮬레이션 | `fireEvent`보다 현실적 |
| **vi.fn() / vi.mock()** | Mock / Spy | Vitest 내장 |
| **Playwright** | E2E 테스트 (향후) | 브라우저 기반 풀스택 |

### 1.2 테스트 패턴

```
// AAA (Arrange-Act-Assert) 패턴
it("설명", () => {
  // Arrange: 테스트 데이터 + 렌더링
  const onSubmit = vi.fn();
  render(<Component onSubmit={onSubmit} />);

  // Act: 사용자 행동 시뮬레이션
  fireEvent.click(screen.getByText("제출"));

  // Assert: 결과 검증
  expect(onSubmit).toHaveBeenCalledOnce();
});
```

### 1.3 쿼리 우선순위 (Testing Library)

| 우선순위 | 쿼리 | 용도 |
|---------|-------|------|
| 1순위 | `getByRole` | ARIA 역할 기반 (button, dialog, status 등) |
| 2순위 | `getByText` | 화면에 보이는 텍스트 |
| 3순위 | `getByLabelText` | 폼 요소 라벨 |
| 4순위 | `getByTestId` | 시맨틱 쿼리 불가 시 최후 수단 |

### 1.4 디렉토리 구조

```
src/
├── app/
│   ├── (funnel)/onboarding/__tests__/      ← 온보딩 컴포넌트 테스트
│   ├── (main)/
│   │   ├── matching/__tests__/             ← 매칭 컴포넌트 테스트
│   │   ├── dialogue/__tests__/             ← 대화 컴포넌트 테스트
│   │   ├── friends/[id]/_components/__tests__/  ← 친구 관련 테스트
│   │   ├── _components/__tests__/          ← 홈/리텐션 컴포넌트 테스트
│   │   └── __tests__/                      ← 메인 레이아웃 테스트
│   ├── (immersive)/chat/[friendshipId]/
│   │   └── _components/__tests__/          ← 실시간 채팅 테스트
│   └── _shared/components/__tests__/       ← 공통 컴포넌트 테스트
├── domain/
│   ├── entities/__tests__/                 ← 도메인 엔티티 테스트
│   └── value-objects/__tests__/            ← 값 객체 테스트
├── application/use-cases/__tests__/        ← 유스케이스 테스트
└── infrastructure/external/__tests__/      ← 인프라 어댑터 테스트
```

### 1.5 실행 명령어

```bash
# 전체 테스트
pnpm vitest run

# 특정 Phase 테스트
pnpm vitest run src/app/(main)/dialogue/__tests__/

# 특정 파일 테스트
pnpm vitest run src/app/(main)/dialogue/__tests__/BlindSpotCard.test.tsx

# 커버리지 확인
pnpm vitest run --coverage

# Watch 모드
pnpm vitest --watch
```

---

## 2. V3-P1 정밀도 사다리 + 질문 Bank

### 2.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| ModeSelector | `src/app/(funnel)/onboarding/components/ModeSelector.tsx` | `__tests__/ModeSelector.test.tsx` | 8 |
| PrecisionGauge | `src/app/(funnel)/onboarding/components/PrecisionGauge.tsx` | `__tests__/PrecisionGauge.test.tsx` | 7 |
| RetakeLimitNotice | `src/app/(funnel)/onboarding/components/RetakeLimitNotice.tsx` | `__tests__/RetakeLimitNotice.test.tsx` | 5 |
| ProgressBar | `src/app/(funnel)/onboarding/components/ProgressBar.tsx` | `__tests__/ProgressBar.test.tsx` | 기존 |
| OnboardingFlow | `src/app/(funnel)/onboarding/components/OnboardingFlow.tsx` | `__tests__/OnboardingFlow.test.tsx` | 기존 |

### 2.2 ModeSelector — 온보딩 모드 선택

**파일**: `src/app/(funnel)/onboarding/__tests__/ModeSelector.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 3개 모드 카드(QUICK/STANDARD/PRECISE) 렌더링 | 렌더링 | `getByText`로 각 카드 제목 확인 |
| 2 | 각 모드별 문항 수 표시 (5/10/20) | 렌더링 | `getByText("5문항")` 등 텍스트 존재 검증 |
| 3 | 각 모드별 예상 시간 표시 | 렌더링 | `getByText("약 2분")` 등 확인 |
| 4 | QUICK 모드에 "(추천)" 배지 표시 | 렌더링 | 추천 표시 텍스트 또는 클래스 확인 |
| 5 | QUICK 카드 클릭 시 `onSelect("QUICK")` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` 검증 |
| 6 | STANDARD 카드 클릭 시 `onSelect("STANDARD")` 호출 | 인터랙션 | 동일 |
| 7 | PRECISE 카드 클릭 시 `onSelect("PRECISE")` 호출 | 인터랙션 | 동일 |
| 8 | PRECISE 모드에 "매칭 품질 ↑" 프레이밍 표시 | UX 프레이밍 | 텍스트 존재 검증 |

**검증 포인트**:
- 기본 추천이 QUICK인지 확인 (접근성 낮은 진입 장벽)
- PRECISE에 매칭 품질 향상 프레이밍이 있는지 확인 (동기 부여)

### 2.3 PrecisionGauge — 정밀도 게이지

**파일**: `src/app/(funnel)/onboarding/__tests__/PrecisionGauge.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 정밀도 퍼센트 렌더링 (예: "72%") | 렌더링 | `getByText("72%")` |
| 2 | 정밀도 라벨 렌더링 (예: "보통 정밀도") | 렌더링 | 라벨 텍스트 검증 |
| 3 | `progressbar` ARIA role 존재 | 접근성 | `getByRole("progressbar")` |
| 4 | 마일스톤 제공 시 "정밀도 올리기" CTA 표시 | 조건부 렌더링 | milestone prop 전달 후 CTA 존재 확인 |
| 5 | 마일스톤 없을 때 CTA 숨김 | 조건부 렌더링 | milestone=null 시 CTA 부재 확인 |
| 6 | CTA 클릭 시 `onUpgrade()` 콜백 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 7 | CTA에 예상 시간 표시 (예: "추가 5문항, 약 2분") | 렌더링 | 시간 텍스트 검증 |

**검증 포인트**:
- 게이지가 단조 증가하는지 (답변 수 비례)
- ARIA progressbar 값이 정확한지 (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`)

### 2.4 RetakeLimitNotice — 리테이크 제한 안내

**파일**: `src/app/(funnel)/onboarding/__tests__/RetakeLimitNotice.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 제한 없고 경고 없을 때 아무것도 렌더링 안 함 | 조건부 렌더링 | 컨테이너 비어있는지 확인 |
| 2 | 제한 시 차단 메시지 표시 ("내일 다시 해볼까요?") | 렌더링 | `getByText` |
| 3 | 허용이지만 경고 시 안내 표시 | 조건부 렌더링 | 경고 텍스트 확인 |
| 4 | 차단 메시지에 `alert` role | 접근성 | `getByRole("alert")` |
| 5 | 경고 메시지에 `status` role | 접근성 | `getByRole("status")` |

**검증 포인트**:
- Anti-abuse: 하루 1회 제한이 UI에 올바르게 반영되는지
- 차단과 경고의 심각도가 ARIA role로 구분되는지

### 2.5 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/entities/__tests__/question-bank.test.ts` | 6 | Anchor 7개 불변, 모드별 샘플링, 중복 방지 |
| `domain/value-objects/__tests__/onboarding-mode.test.ts` | 4 | QUICK=5, STANDARD=10, PRECISE=20 매핑 |
| `domain/value-objects/__tests__/precision-score.test.ts` | 5 | 0~100% 범위, 단조 증가, 마일스톤 계산 |
| `domain/value-objects/__tests__/anti-abuse-policy.test.ts` | 3 | 1일 1회 제한, 초과 감지 |
| `application/use-cases/__tests__/select-onboarding-mode.test.ts` | 3 | 모드 선택→문항 샘플링 |
| `application/use-cases/__tests__/calculate-precision.test.ts` | 2 | 정밀도 계산 + 마일스톤 |
| `application/use-cases/__tests__/check-retake-limit.test.ts` | 2 | 제한 확인 로직 |

---

## 3. V3-P2 공유 카드 3종 + Next Step Hub

### 3.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| ShareCardPreview | `src/app/(funnel)/onboarding/components/ShareCardPreview.tsx` | `__tests__/ShareCardPreview.test.tsx` | 5 |
| NextStepHub | `src/app/(funnel)/onboarding/components/NextStepHub.tsx` | `__tests__/NextStepHub.test.tsx` | 6 |

### 3.2 ShareCardPreview — 공유 카드 프리뷰

**파일**: `src/app/(funnel)/onboarding/__tests__/ShareCardPreview.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 별명 카드: 라벨 + 이모지 렌더링 | 렌더링 | `type="ALIAS"` prop → 별명/이모지 텍스트 확인 |
| 2 | Thought Map 카드: 축 데이터 렌더링 | 렌더링 | `type="THOUGHT_MAP"` → 축 이름 표시 확인 |
| 3 | Misperception 카드: gap 데이터 렌더링 | 렌더링 | `type="MISPERCEPTION"` → 갭 % 확인 |
| 4 | **모든 카드에 프라이버시 필수 문구 포함** | 규칙 검증 | `getByText(/개인정보 없이/)` — 필수 문구 존재 |
| 5 | 공유 버튼 클릭 시 `onShare()` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |

**검증 포인트**:
- **필수**: 모든 카드에 "이 카드는 개인정보 없이 생성됩니다" 문구 포함 (프라이버시 by design)
- PII 데이터가 카드에 노출되지 않는지 확인

### 3.3 NextStepHub — Phase1→2 전환 허브

**파일**: `src/app/(funnel)/onboarding/__tests__/NextStepHub.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | Primary CTA 강조 렌더링 (가장 크게) | 렌더링 | CTA 요소의 크기/스타일 클래스 확인 |
| 2 | Primary CTA가 매칭 페이지로 연결 | 내비게이션 | href 또는 onClick 라우팅 검증 |
| 3 | Secondary CTA 렌더링 (정밀도 업그레이드 / AI 분석) | 렌더링 | 텍스트 존재 확인 |
| 4 | Secondary CTA에 예상 시간 표시 | 렌더링 | "약 2분", "약 7분" 텍스트 |
| 5 | Secondary action 없을 때도 정상 렌더링 | 엣지 케이스 | secondary prop 생략 시 에러 없음 |
| 6 | Primary CTA 텍스트가 "대화 상대 찾기" | UX 프레이밍 | 고정 CTA 텍스트 검증 |

**검증 포인트**:
- Primary CTA가 항상 "대화 상대 찾기"인지 확인 (Quality Gate)
- CTA 계층 구조: Primary > Secondary 시각적 강조

### 3.4 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/value-objects/__tests__/share-card.test.ts` | 4 | 카드 타입별 생성, 프라이버시 문구 필수 |
| `application/use-cases/__tests__/generate-share-card.test.ts` | 2 | 카드 조립 + 프라이버시 주입 |
| `application/use-cases/__tests__/determine-next-step.test.ts` | 2 | 사용자 상태→CTA 우선순위 |

---

## 4. V3-P3 매칭 카드 UX

### 4.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| MatchCardV3 | `src/app/(main)/matching/components/MatchCardV3.tsx` | `__tests__/MatchCardV3.test.tsx` | 8 |
| EnergySelector | `src/app/(main)/matching/components/EnergySelector.tsx` | `__tests__/EnergySelector.test.tsx` | 4 |
| DeclineReasonModal | `src/app/(main)/matching/components/DeclineReasonModal.tsx` | `__tests__/DeclineReasonModal.test.tsx` | 5 |
| EffortGradeSelector | `src/app/(main)/matching/_components/EffortGradeSelector.tsx` | `__tests__/EffortGradeSelector.test.tsx` | 3 |
| TopicLevelSelector | `src/app/(main)/matching/_components/TopicLevelSelector.tsx` | `__tests__/TopicLevelSelector.test.tsx` | 4 |
| DailyLimitNotice | `src/app/(main)/matching/_components/DailyLimitNotice.tsx` | `__tests__/DailyLimitNotice.test.tsx` | 3 |
| MatchScoreBar | `src/app/(main)/matching/components/MatchScoreBar.tsx` | 기존 | 기존 |
| ProposalCard | `src/app/(main)/matching/components/ProposalCard.tsx` | 기존 | 기존 |
| CandidateList | `src/app/(main)/matching/components/CandidateList.tsx` | 기존 | 기존 |

### 4.2 MatchCardV3 — 매칭 카드 전면 개편

**파일**: `src/app/(main)/matching/__tests__/MatchCardV3.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 주제 텍스트 렌더링 | 렌더링 | `getByText(topic)` |
| 2 | 의견 거리 라벨 + 이모지 렌더링 (🌱/🌊/⛰️/🌋) | 렌더링 | distanceLabel prop에 따른 이모지+텍스트 확인 |
| 3 | 예상 대화 시간 표시 | 렌더링 | `getByText(/분/)` |
| 4 | 사회적 증거 텍스트 렌더링 ("어제 N쌍이 대화") | 렌더링 | socialProof 텍스트 확인 |
| 5 | Conversation Trailer 렌더링 (2줄 자연어 요약) | 렌더링 | trailer prop 전달 시 텍스트 표시 |
| 6 | "대화 시작하기" CTA 버튼 렌더링 | 렌더링 | `getByRole("button", { name: /대화 시작/ })` |
| 7 | CTA 클릭 시 `onStart()` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 8 | "다음에" 클릭 시 `onDecline()` 호출 | 인터랙션 | 거절 버튼 클릭 검증 |
| 9 | 🔒 익명 배지 표시 | 렌더링 | 익명 표시 텍스트/아이콘 확인 |

**검증 포인트**:
- Conversation Trailer에 PII가 포함되지 않는지 (도메인 레벨 검증)
- 가치 라벨("진보적/보수적") 없는지 확인
- Distance 0.8~1.0 구간은 비활성화(DISABLED)인지 확인

### 4.3 EnergySelector — 에너지 체크

**파일**: `src/app/(main)/matching/__tests__/EnergySelector.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 3개 에너지 옵션 렌더링 (HIGH/NORMAL/LOW) | 렌더링 | 3개 버튼 존재 확인 |
| 2 | 에너지 이모지 표시 (🔋🔋🔋/🔋/🪫) | 렌더링 | 이모지 텍스트 확인 |
| 3 | 선택된 옵션에 활성 상태 표시 | 상태 관리 | `selected` prop에 따른 스타일 클래스 확인 |
| 4 | 옵션 클릭 시 `onSelect(key)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |

**검증 포인트**:
- LOW 선택 시 "오늘은 가볍게 5분짜리" 등 안내 텍스트 변경 확인
- LOW → Distance -0.1 / Level -1 조정은 도메인 레벨에서 검증

### 4.4 DeclineReasonModal — 거절 사유 선택

**파일**: `src/app/(main)/matching/__tests__/DeclineReasonModal.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 4개 거절 사유 옵션 렌더링 | 렌더링 | 4개 선택지 텍스트 확인 |
| 2 | 사유 라벨 표시 (주제 무거움/시간 없음/쉬고 싶음/다른 주제) | 렌더링 | `getByText` |
| 3 | 사유 클릭 시 `onSelect(reason)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 4 | `isOpen=false` 시 렌더링 안 함 | 조건부 렌더링 | 컨테이너 비어있음 확인 |
| 5 | `dialog` ARIA role | 접근성 | `getByRole("dialog")` |

**검증 포인트**:
- 거절 사유가 다음 매칭 파라미터 조정에 반영되는지 (통합 테스트)

### 4.5 EffortGradeSelector — 노력도 선택

**파일**: `src/app/(main)/matching/__tests__/EffortGradeSelector.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 3개 노력도 카드 렌더링 (QUICK/STRUCTURED/DEEP) | 렌더링 | 카드 제목 + 시간 표시 |
| 2 | 각 카드에 이모지 + 시간 + 단계 수 표시 | 렌더링 | ⚡5분/3단계, 📋10분/5단계, 🧘15분/7단계 |
| 3 | 카드 클릭 시 `onSelect(grade)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |

### 4.6 TopicLevelSelector — 주제 레벨 선택

**파일**: `src/app/(main)/matching/__tests__/TopicLevelSelector.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 레벨 카드 렌더링 (0~2+) | 렌더링 | 레벨별 카드 존재 확인 |
| 2 | 위험도 색상 표시 (녹/노/적) | 렌더링 | 클래스 확인 (green/yellow/red) |
| 3 | 첫 대화 시 안내 텍스트 표시 | 조건부 렌더링 | `isFirstDialogue=true` → 안내 존재 |
| 4 | 레벨 클릭 시 `onSelect(level)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |

### 4.7 DailyLimitNotice — 일일 제한 안내

**파일**: `src/app/(main)/matching/__tests__/DailyLimitNotice.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 남은 횟수 표시 ("오늘 남은 대화 횟수: N회") | 렌더링 | `getByText(/남은/)` |
| 2 | 모두 소진 시 빨간 경고 | 조건부 렌더링 | `remaining=0` → 빨간 스타일 확인 |
| 3 | 안내 영역 존재 확인 | 렌더링 | 컨테이너 렌더링 확인 |

### 4.8 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/value-objects/__tests__/opinion-distance-label.test.ts` | 5 | 5단계 라벨 매핑, 0.8+ 비활성화 |
| `domain/value-objects/__tests__/energy-level.test.ts` | 3 | HIGH/NORMAL/LOW, 매칭 조정 |
| `domain/value-objects/__tests__/decline-reason.test.ts` | 4 | 4종 사유, 매칭 조정 변환 |
| `application/use-cases/__tests__/build-match-card.test.ts` | 2 | 카드 조립 |
| `application/use-cases/__tests__/select-energy-level.test.ts` | 2 | 에너지→파라미터 조정 |
| `application/use-cases/__tests__/record-decline-reason.test.ts` | 2 | 거절 사유 기록 |

---

## 5. V3-P4 대화 UX 개선

### 5.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| ScaffoldPlaceholder | `src/app/(main)/dialogue/components/ScaffoldPlaceholder.tsx` | `__tests__/ScaffoldPlaceholder.test.tsx` | 5 |
| CoachBottomSheet | `src/app/(main)/dialogue/components/CoachBottomSheet.tsx` | `__tests__/CoachBottomSheet.test.tsx` | 6 |
| HighlightPopup | `src/app/(main)/dialogue/components/HighlightPopup.tsx` | `__tests__/HighlightPopup.test.tsx` | 4 |
| ToneSuggestionCard | `src/app/(main)/dialogue/components/ToneSuggestionCard.tsx` | `__tests__/ToneSuggestionCard.test.tsx` | 5 |
| ReceptivenessTemplateList | `src/app/(main)/dialogue/components/ReceptivenessTemplateList.tsx` | `__tests__/ReceptivenessTemplateList.test.tsx` | 4 |

### 5.2 ScaffoldPlaceholder — 스캐폴딩 플레이스홀더

**파일**: `src/app/(main)/dialogue/__tests__/ScaffoldPlaceholder.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | POSITION 단계 플레이스홀더 텍스트 표시 | 렌더링 | `step="POSITION"` → "나는 ____에 대해" 확인 |
| 2 | QUESTION 단계 플레이스홀더 텍스트 표시 | 렌더링 | `step="QUESTION"` → 인용 형태 텍스트 |
| 3 | AFFIRMATION 단계에서는 렌더링 안 함 | 조건부 렌더링 | 컨테이너 비어있음 |
| 4 | REFLECTION 단계에서는 렌더링 안 함 | 조건부 렌더링 | 컨테이너 비어있음 |
| 5 | 반투명 스타일 적용 | 렌더링 | opacity 관련 클래스 확인 |

**검증 포인트**:
- 플레이스홀더가 "입력 시 사라지는" UX인지 (사용자 입력 시작 시 상태 변경)
- 각 단계별 템플릿이 정확한지

### 5.3 CoachBottomSheet — 코치 바텀시트

**파일**: `src/app/(main)/dialogue/__tests__/CoachBottomSheet.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 열림 시 3개 시작 방법 렌더링 | 렌더링 | `isOpen=true` → 3개 옵션 확인 |
| 2 | 방법 라벨 표시 (입장부터/경험부터/질문부터) | 렌더링 | `getByText` |
| 3 | 옵션 클릭 시 `onSelect(template)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 4 | `isOpen=false` 시 렌더링 안 함 | 조건부 렌더링 | 컨테이너 비어있음 |
| 5 | `dialog` ARIA role | 접근성 | `getByRole("dialog")` |
| 6 | 제목 텍스트 "어떻게 시작할까요" | 렌더링 | `getByText("어떻게 시작할까요")` |

**검증 포인트**:
- 💡 "어떻게 쓸지 막막해요" 버튼 → 바텀시트 트리거 흐름

### 5.4 HighlightPopup — 밑줄 긋기 팝업

**파일**: `src/app/(main)/dialogue/__tests__/HighlightPopup.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 선택된 텍스트 표시 | 렌더링 | `highlightedText` prop 텍스트 확인 |
| 2 | "밑줄" 버튼 클릭 시 자동 인용 프리픽스와 함께 `onHighlight()` 호출 | 인터랙션 | `"[인용 텍스트]"라고 하셨는데,` 형식 검증 |
| 3 | `isOpen=false` 시 렌더링 안 함 | 조건부 렌더링 | 컨테이너 비어있음 |
| 4 | 닫기 버튼 존재 | 렌더링 | close 버튼 확인 |

**검증 포인트**:
- **필수**: 인용 없이도 질문 가능 (밑줄 강제 아님)
- 모바일/데스크톱 텍스트 셀렉션 처리 (통합 테스트)

### 5.5 ToneSuggestionCard — 개선된 톤 체크

**파일**: `src/app/(main)/dialogue/__tests__/ToneSuggestionCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 원래 문장 + 대안 문장 동시 표시 | 렌더링 | originalText / suggestedText prop 확인 |
| 2 | "잠깐, 한 가지 제안이 있어요" 프레이밍 텍스트 | 렌더링 | 제안 톤 텍스트 확인 ("경고" 아닌 "제안") |
| 3 | "이 표현 사용하기" 클릭 → `onUseSuggestion()` | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 4 | "원래대로 보내기" 클릭 → `onSendOriginal()` | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 5 | **양쪽 버튼 항상 존재** (자율성 원칙) | UX 규칙 | 두 버튼 모두 `getByRole("button")` 존재 확인 |

**검증 포인트**:
- **필수**: "원래대로 보내기" 옵션이 항상 존재 (자율성 보장 — Quality Gate)
- 0.5초 지연 후 표시 로직은 도메인 레벨에서 검증

### 5.6 ReceptivenessTemplateList — 수용성 템플릿 추천

**파일**: `src/app/(main)/dialogue/__tests__/ReceptivenessTemplateList.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 템플릿 항목 렌더링 | 렌더링 | 템플릿 텍스트 존재 확인 |
| 2 | 템플릿 클릭 시 `onSelect(text)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 3 | 카테고리별 그룹핑 (확인/공감/탐색) | 렌더링 | 카테고리 헤더 존재 확인 |
| 4 | 템플릿 텍스트 표시 | 렌더링 | `getByText(/이해한 게 맞나요/)` 등 |

### 5.7 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/value-objects/__tests__/scaffold-template.test.ts` | 4 | 단계별 템플릿 매핑 |
| `domain/value-objects/__tests__/coach-suggestion.test.ts` | 3 | 3종 시작 방법 |
| `domain/entities/__tests__/highlight.test.ts` | 4 | 오프셋 검증, 자동 인용 생성 |
| `domain/value-objects/__tests__/tone-check-result.test.ts` | 4 | 제안 프레이밍, 0.5초 지연, 원래대로 옵션 |
| `application/use-cases/__tests__/get-scaffold-for-step.test.ts` | 2 | 단계→스캐폴딩 |
| `application/use-cases/__tests__/get-coach-suggestions.test.ts` | 2 | Coach 제안 반환 |
| `application/use-cases/__tests__/create-highlight.test.ts` | 2 | 밑줄→Highlight 저장 |
| `application/use-cases/__tests__/check-tone.test.ts` | 2 | 톤 체크 개선 |
| `application/use-cases/__tests__/suggest-receptiveness-template.test.ts` | 2 | 맥락별 템플릿 추천 |

---

## 6. V3-P5 Reflection 전면 개편

### 6.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| ReflectionQuizCard | `src/app/(main)/dialogue/_components/ReflectionQuizCard.tsx` | `__tests__/ReflectionQuizCard.test.tsx` | 4 |
| MutualVerificationSlider | `src/app/(main)/dialogue/_components/MutualVerificationSlider.tsx` | `__tests__/MutualVerificationSlider.test.tsx` | 4 |
| RoleplaySteelmanCard | `src/app/(main)/dialogue/_components/RoleplaySteelmanCard.tsx` | `__tests__/RoleplaySteelmanCard.test.tsx` | 5 |
| CommonGroundCard | `src/app/(main)/dialogue/_components/CommonGroundCard.tsx` | `__tests__/CommonGroundCard.test.tsx` | 4 |
| ReflectionProgressHeader | `src/app/(main)/dialogue/_components/ReflectionProgressHeader.tsx` | `__tests__/ReflectionProgressHeader.test.tsx` | 3 |
| ReflectionForm | `src/app/(main)/dialogue/_components/ReflectionForm.tsx` | `__tests__/ReflectionForm.test.tsx` | 기존 |

### 6.2 ReflectionQuizCard — R1 객관식 퀴즈

**파일**: `src/app/(main)/dialogue/__tests__/ReflectionQuizCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 4개 라디오 옵션 렌더링 | 렌더링 | `getAllByRole("radio")` → length=4 |
| 2 | 질문 텍스트 "상대방이 가장 중요하게 생각한 건?" 표시 | 렌더링 | `getByText` |
| 3 | 옵션 클릭 시 `onAnswer(index)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` 인자 검증 |
| 4 | 모든 선택지 텍스트 표시 | 렌더링 | `options` prop 각 항목 확인 |

**검증 포인트**:
- **필수**: 선택지가 항상 4개 (LLM 출력 검증)
- 정답/오답 피드백 후 주관식 전환 유도

### 6.3 MutualVerificationSlider — R2 상호 검증

**파일**: `src/app/(main)/dialogue/__tests__/MutualVerificationSlider.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 상대의 요약 텍스트 표시 | 렌더링 | summary prop 텍스트 확인 |
| 2 | 슬라이더 이모지 앵커 표시 (😐 ~ 😊) | 렌더링 | 이모지 텍스트 확인 |
| 3 | 제출 버튼 존재 | 렌더링 | `getByRole("button")` |
| 4 | "수정 제안 추가하기" 링크/버튼 존재 | 렌더링 | 수정 제안 텍스트 확인 |

**검증 포인트**:
- 수정 제안이 상대에게 실제 전달되는 규칙 (통합 테스트)

### 6.4 RoleplaySteelmanCard — R3 역할극

**파일**: `src/app/(main)/dialogue/__tests__/RoleplaySteelmanCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 역할극 프롬프트 텍스트 표시 | 렌더링 | prompt prop 확인 |
| 2 | 🎭 역할극 아이콘 표시 | 렌더링 | 이모지 확인 |
| 3 | `canSkip=true` 시 "건너뛰기" 버튼 표시 | 조건부 렌더링 | 버튼 존재 확인 |
| 4 | `canSkip=false` 시 "건너뛰기" 버튼 숨김 | 조건부 렌더링 | 버튼 부재 확인 |
| 5 | 텍스트 입력 + "작성 완료" 버튼 존재 | 렌더링 | textarea + button 확인 |

**검증 포인트**:
- **필수**: 첫 3회 선택 → 이후 Understanding Score 기반 강제 전환 (도메인 규칙)
- `canSkip` prop이 `DetermineReflectionPolicyUseCase`에서 계산됨

### 6.5 CommonGroundCard — R4 공통점 발견

**파일**: `src/app/(main)/dialogue/__tests__/CommonGroundCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | "가장 설득력 있었던 부분" 입력 필드 표시 | 렌더링 | 입력 필드 확인 |
| 2 | "다음에 묻고 싶은 질문" 입력 필드 표시 | 렌더링 | 입력 필드 확인 |
| 3 | 제출 버튼 존재 | 렌더링 | `getByRole("button")` |
| 4 | 2개 텍스트 입력 존재 | 렌더링 | `getAllByRole("textbox")` |

### 6.6 ReflectionProgressHeader — 진행 헤더

**파일**: `src/app/(main)/dialogue/__tests__/ReflectionProgressHeader.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 격려 메시지 표시 ("거의 다 왔어요! 마지막 2분") | 렌더링 | `getByText` |
| 2 | 진행 표시기 존재 | 렌더링 | progress 요소 확인 |
| 3 | 단계 수 정확하게 표시 | 렌더링 | `currentStep/totalSteps` 표시 |

### 6.7 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/entities/__tests__/reflection-quiz.test.ts` | 3 | 퀴즈 생성, 4개 선택지, 정답 |
| `domain/value-objects/__tests__/mutual-verification.test.ts` | 3 | 슬라이더 범위, 수정 제안 |
| `domain/value-objects/__tests__/roleplay-steelman.test.ts` | 3 | 프롬프트, 건너뛰기, 점진적 강제 |
| `domain/value-objects/__tests__/common-ground-discovery.test.ts` | 2 | 응답 저장, 재매칭 연결 |
| `application/use-cases/__tests__/generate-reflection-quiz.test.ts` | 2 | 퀴즈 자동 생성 |
| `application/use-cases/__tests__/submit-quiz-answer.test.ts` | 2 | 객관식→주관식 전환 |
| `application/use-cases/__tests__/submit-mutual-verification.test.ts` | 2 | 슬라이더 값+수정 |
| `application/use-cases/__tests__/submit-roleplay-steelman.test.ts` | 2 | 역할극 저장 |
| `application/use-cases/__tests__/save-common-ground.test.ts` | 2 | R4 저장+재매칭 연결 |
| `application/use-cases/__tests__/determine-reflection-policy.test.ts` | 2 | R3 강제/선택 정책 |

---

## 7. V3-P6 Peak-End 카드 + 공동 요약

### 7.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| JointSummaryCardView | `src/app/(main)/dialogue/_components/JointSummaryCardView.tsx` | `__tests__/JointSummaryCardView.test.tsx` | 3 |
| GiftMessageInput | `src/app/(main)/dialogue/_components/GiftMessageInput.tsx` | `__tests__/GiftMessageInput.test.tsx` | 3 |
| GiftRevealCard | `src/app/(main)/dialogue/_components/GiftRevealCard.tsx` | `__tests__/GiftRevealCard.test.tsx` | 2 |
| BlindSpotCard | `src/app/(main)/dialogue/_components/BlindSpotCard.tsx` | `__tests__/BlindSpotCard.test.tsx` | 3 |
| PeakEndKPISliders | `src/app/(main)/dialogue/_components/PeakEndKPISliders.tsx` | `__tests__/PeakEndKPISliders.test.tsx` | 2 |
| NextQuestionInput | `src/app/(main)/dialogue/_components/NextQuestionInput.tsx` | `__tests__/NextQuestionInput.test.tsx` | 3 |

### 7.2 JointSummaryCardView — 공동 요약 카드

**파일**: `src/app/(main)/dialogue/__tests__/JointSummaryCardView.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | ✅ 동의 항목 + 💬 차이 항목 렌더링 | 렌더링 | `agreedPoints[]`, `disagreedPoints[]` prop 텍스트 확인 |
| 2 | ❓ 공동 질문 섹션 렌더링 (존재 시) | 조건부 렌더링 | `sharedQuestion` prop 제공 시 표시 |
| 3 | 항목 없는 섹션 숨김 | 엣지 케이스 | 빈 배열 전달 시 해당 섹션 부재 |

**검증 포인트**:
- 3섹션(동의/차이/공동질문) 구분 시각화
- AI 생성 표시 안내문 존재

### 7.3 GiftMessageInput — 선물 메시지 작성

**파일**: `src/app/(main)/dialogue/__tests__/GiftMessageInput.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 플레이스홀더 + 저장 버튼 렌더링 | 렌더링 | textarea + button 존재 확인 |
| 2 | 빈 입력 시 버튼 비활성화 | 유효성 검증 | `disabled` attribute 확인 |
| 3 | 입력 후 저장 클릭 시 `onSubmit(trimmedText)` 호출 | 인터랙션 | `fireEvent.change` + `fireEvent.click` |

**검증 포인트**:
- 100자 제한 (도메인 `GiftMessage` VO에서 검증)
- PII scrubber 적용 필수 (통합 테스트)

### 7.4 GiftRevealCard — 선물 공개

**파일**: `src/app/(main)/dialogue/__tests__/GiftRevealCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 선물 텍스트 렌더링 | 렌더링 | `text` prop 표시 확인 |
| 2 | 💌 이모지 + "상대방이 당신에게 남긴 한 마디" 설명 | 렌더링 | 이모지 + 설명 텍스트 확인 |

**검증 포인트**:
- Peak-End 시점에만 공개되는지 (플로우 테스트)
- 서프라이즈 효과 UX (애니메이션은 향후)

### 7.5 BlindSpotCard — Blind Spot 발견

**파일**: `src/app/(main)/dialogue/__tests__/BlindSpotCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 발견된 개념 텍스트 렌더링 | 렌더링 | `discoveredConcept` prop 확인 |
| 2 | 콜백 제공 시 액션 버튼 표시 (탐색/저장) | 조건부 렌더링 | `onExploreMore`/`onSave` 존재 → 버튼 표시 |
| 3 | 콜백 없을 때 버튼 숨김 | 조건부 렌더링 | 콜백 미제공 → 버튼 부재 |

**검증 포인트**:
- 🔍 "오늘의 발견" 프레이밍
- **필수**: "메커니즘/관점" 레벨만 추출 (가치판단 배제 — 도메인 검증)

### 7.6 PeakEndKPISliders — KPI 수집 슬라이더

**파일**: `src/app/(main)/dialogue/__tests__/PeakEndKPISliders.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 2개 슬라이더 + 이모지 앵커 렌더링 | 렌더링 | "😕~😊" (Feel Heard) + "🙅~🙋" (Rematch) |
| 2 | 제출 시 `onSubmit(feelHeard, rematchIntent)` 호출 | 인터랙션 | 슬라이더 값 변경 + submit |

**검증 포인트**:
- 2문항만 수집 (10초 이내 완료 가능)
- **필수**: Affective Warmth를 별도 문항으로 묻지 않음 (rematchIntent가 프록시)
- 슬라이더 범위 0~100

### 7.7 NextQuestionInput — 다음에 묻고 싶은 질문

**파일**: `src/app/(main)/dialogue/__tests__/NextQuestionInput.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 입력 필드 + 안내 텍스트 렌더링 | 렌더링 | 💭 + "저장하면 재매칭 시 이 질문으로 시작" |
| 2 | 빈 입력 시 저장 비활성화 | 유효성 검증 | `disabled` attribute |
| 3 | 입력 후 저장 클릭 시 `onSave(trimmedText)` 호출 | 인터랙션 | `fireEvent.change` + `fireEvent.click` |

**검증 포인트**:
- 200자 제한 (도메인 `NextQuestionSave` VO에서 검증)

### 7.8 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/entities/__tests__/joint-summary-card.test.ts` | 4 | 3섹션 생성, 빈 항목 처리 |
| `domain/value-objects/__tests__/gift-message.test.ts` | 4 | 100자 제한, reveal(), PII 아닌 텍스트 |
| `domain/value-objects/__tests__/blind-spot-discovery.test.ts` | 3 | 비어있지 않은 concept, 메커니즘 레벨 |
| `domain/value-objects/__tests__/peak-end-kpi.test.ts` | 5 | 0~100 클램프, warmth 프록시, isBadExperience<20 |
| `domain/value-objects/__tests__/next-question-save.test.ts` | 4 | 200자 제한, trim 처리 |
| `domain/entities/__tests__/peak-end-flow.test.ts` | 4 | 5단계 순서 (JOINT_SUMMARY→GIFT→BLIND_SPOT→KPI→NEXT_QUESTION) |
| `application/use-cases/__tests__/build-joint-summary-card.test.ts` | 2 | 요약 카드 조립 |
| `application/use-cases/__tests__/write-gift-message.test.ts` | 2 | GiftMessage 생성 |
| `application/use-cases/__tests__/reveal-gift-message.test.ts` | 2 | 선물 공개 |
| `application/use-cases/__tests__/extract-blind-spot.test.ts` | 2 | Blind Spot 추출 |
| `application/use-cases/__tests__/collect-peak-end-kpi.test.ts` | 2 | KPI 수집+계산 |
| `application/use-cases/__tests__/save-next-question.test.ts` | 2 | 질문 저장 |

---

## 8. V3-P7 나쁜 경험 복구 루틴

### 8.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| RecoveryRoutinePanel | `src/app/(main)/dialogue/_components/RecoveryRoutinePanel.tsx` | `__tests__/RecoveryRoutinePanel.test.tsx` | 3 |

### 8.2 RecoveryRoutinePanel — 복구 루틴 UI

**파일**: `src/app/(main)/dialogue/__tests__/RecoveryRoutinePanel.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 공감 메시지 리스트 전체 렌더링 | 렌더링 | `messages` prop 각 항목 텍스트 확인 |
| 2 | **2개 CTA 버튼 동등하게 표시** (강요 없음) | UX 규칙 | "나중에 다시 보기" + "바로 찾아봐요" 동일 스타일 |
| 3 | 각 CTA 클릭 시 올바른 콜백 호출 | 인터랙션 | `onLater` / `onFindNew` `vi.fn()` 검증 |

**검증 포인트 (Quality Gate)**:
- **필수**: "사과" 문구 없음 → 플랫폼 책임 과잉 표현 금지
- **필수**: 즉시 재시작 CTA가 강요되지 않음 → 양쪽 버튼 동등
- **필수**: 구체적 행동 변화 명시 (Level 0 / 최소 거리 / 꼼꼼 확인)
- 사과 문구 부재 검증: `queryByText(/죄송|사과|미안/)` → null

### 8.3 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/value-objects/__tests__/bad-experience-detector.test.ts` | 3 | feelHeard<20 트리거, emotionalCheckin 부정 트리거 |
| `domain/value-objects/__tests__/recovery-action.test.ts` | 3 | Level 0, Distance 0.2~0.3, facilitator MAX |
| `domain/entities/__tests__/recovery-routine.test.ts` | 3 | 사과 없는 메시지, 행동 변화 포함 |
| `application/use-cases/__tests__/detect-bad-experience.test.ts` | 3 | 나쁜 경험 감지 |
| `application/use-cases/__tests__/apply-recovery-routine.test.ts` | 2 | 복구 조치 적용 |
| `application/use-cases/__tests__/exclude-dialogue-from-record.test.ts` | 1 | 기록 제거 |

---

## 9. V3-P8 상태 기반 홈 + 리텐션 루프

### 9.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| HomeStateView | `src/app/(main)/_components/HomeStateView.tsx` | `__tests__/HomeStateView.test.tsx` | 3 |
| JourneyProgressBar | `src/app/(main)/_components/JourneyProgressBar.tsx` | `__tests__/JourneyProgressBar.test.tsx` | 2 |
| DialogueReplayCardView | `src/app/(main)/_components/DialogueReplayCardView.tsx` | `__tests__/DialogueReplayCardView.test.tsx` | 3 |
| PerspectivePassportView | `src/app/(main)/_components/PerspectivePassportView.tsx` | `__tests__/PerspectivePassportView.test.tsx` | 2 |

### 9.2 HomeStateView — 상태 기반 홈 화면

**파일**: `src/app/(main)/__tests__/HomeStateView.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | FIRST_VISIT 상태: Thought Map CTA 히어로 렌더링 | 상태별 렌더링 | `state="FIRST_VISIT"` → CTA 텍스트 확인 |
| 2 | POST_DIALOGUE_D1 상태: 복기 카드 CTA 렌더링 | 상태별 렌더링 | `state="POST_DIALOGUE_D1"` → 복기 관련 텍스트 |
| 3 | RETURNING_AFTER_14D 상태: 재온보딩 렌더링 | 상태별 렌더링 | `state="RETURNING_AFTER_14D"` → "오랜만" 텍스트 |

**추가 필요 테스트**:

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 4 | MAP_COMPLETED 상태: 매칭 추천 카드 | 상태별 렌더링 | 매칭 관련 CTA 확인 |
| 5 | WAITING_MATCH 상태: 대기 중 + 예상 시간 | 상태별 렌더링 | "대화 상대를 찾고 있어요" 텍스트 |
| 6 | HAS_FRIENDS 상태: 라이트 프로토콜 추천 | 상태별 렌더링 | 라이트 프로토콜 CTA |

**검증 포인트**:
- **필수**: 6가지 HomeState가 모두 올바르게 결정 → 렌더링 전환 (Quality Gate)
- 각 상태의 CTA가 올바른 경로로 연결되는지

### 9.3 JourneyProgressBar — 여정 진행 표시

**파일**: `src/app/(main)/__tests__/JourneyProgressBar.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 완료 단계 없을 때 3개 Phase 모두 화살표(→) 표시 | 렌더링 | `completedPhases=[]` → 화살표만 |
| 2 | 완료 Phase에 체크마크(✓) 표시 | 렌더링 | `completedPhases=["THOUGHT_MAP"]` → ✓ 확인 |

**검증 포인트**:
- 3단계: "내 생각 지도 만들기" → "1번 대화 완료" → "좋은 대화 상대 저장"
- 스트릭/연속 접속 지표 없음 (축적만)

### 9.4 DialogueReplayCardView — D+1 복기 카드

**파일**: `src/app/(main)/__tests__/DialogueReplayCardView.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 상대 핵심 발언 + 주제 렌더링 | 렌더링 | `opponentKeyStatement` + `topic` 텍스트 확인 |
| 2 | 3개 응답 선택 버튼 렌더링 | 렌더링 | 3개 ThoughtChangeOption 버튼 확인 |
| 3 | 응답 선택 시 `onRespond(choice)` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` 인자 검증 |

**검증 포인트**:
- 3개 선택: "여전히 잘 모르겠어요" / "좀 더 생각하게 됐어요" / "내 생각이 조금 바뀌었어요"
- "바뀌었어요" 선택 시 stance_vector 재측정 유도 (강제 아님)

### 9.5 PerspectivePassportView — D+7 탐험 지도

**파일**: `src/app/(main)/__tests__/PerspectivePassportView.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 주간/누적 탐험 수 표시 | 렌더링 | `weeklyExploredCount`, `totalExploredCount` 값 확인 |
| 2 | 발견된 개념 목록 렌더링 | 렌더링 | `discoveredConcepts[]` 각 항목 태그 형태 표시 |

**검증 포인트**:
- 🗺️ Passport 프레이밍
- **필수**: 스트릭(연속 접속) 없음 — 축적 지도만 (다크패턴 방지)

### 9.6 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/value-objects/__tests__/home-state.test.ts` | 6 | 6종 상태 결정 로직, 우선순위 |
| `domain/value-objects/__tests__/dialogue-replay-card.test.ts` | 3 | 3개 응답, 재측정 유도 |
| `domain/entities/__tests__/perspective-passport.test.ts` | 4 | 주간/누적, 발견 추가 |
| `domain/value-objects/__tests__/journey-progress.test.ts` | 3 | 3 Phase 추적 |
| `domain/value-objects/__tests__/notification-template.test.ts` | 4 | 3종 알림 타입, 기본값 "핵심만" |
| `application/use-cases/__tests__/determine-home-state.test.ts` | 3 | 상태 결정 |
| `application/use-cases/__tests__/generate-replay-card.test.ts` | 1 | D+1 카드 생성 |
| `application/use-cases/__tests__/update-perspective-passport.test.ts` | 2 | D+7 업데이트 |
| `application/use-cases/__tests__/handle-thought-change.test.ts` | 2 | 바뀌었어요→재측정 |
| `application/use-cases/__tests__/build-notification.test.ts` | 2 | 알림 조립 |
| `application/use-cases/__tests__/manage-notification-preference.test.ts` | 2 | 알림 설정 관리 |

---

## 10. V3-P9 이벤트 로깅 택소노미

### 10.1 UI 컴포넌트 없음

이벤트 로깅은 백엔드 인프라 전용이므로 프레젠테이션 레이어 컴포넌트가 없다.

### 10.2 테스트 대상

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/events/__tests__/analytics-event.test.ts` | 5 | 68개 이벤트 정의, Phase별 분류, EventMetadata |
| `domain/interfaces/__tests__/event-emitter.test.ts` | 2 | 포트 인터페이스 |
| `application/use-cases/__tests__/track-event.test.ts` | 2 | 이벤트 수집+메타데이터 |
| `infrastructure/external/__tests__/in-memory-event-emitter.test.ts` | 2 | 버퍼 큐잉, flush |

**Frontend 관련 검증 포인트**:
- 각 컴포넌트에서 적절한 이벤트가 발화되는지 (통합 테스트)
- EventMetadata에 PII 미포함 검증

### 10.3 이벤트 발화 체크리스트 (컴포넌트별)

아래 각 컴포넌트에서 올바른 이벤트가 발화되는지 확인 필요:

| 컴포넌트 | 기대 이벤트 | Phase |
|---------|-----------|-------|
| ModeSelector | `OnboardingModeSelected(mode)` | P1 |
| OnboardingFlow | `OnboardingQuestionViewed`, `OnboardingQuestionAnswered` | P1 |
| PrecisionGauge | `PrecisionMeterViewed`, `PrecisionUpgradeClicked` | P1 |
| ShareCardPreview | `ShareTypeSelected(type)`, `ShareCompleted(type)` | P1 |
| NextStepHub | `NextStepHubViewed`, `CTAMatchClicked` | P1 |
| MatchCardV3 | `MatchCardImpression`, `MatchAccepted`, `MatchDeclined` | P2 |
| DeclineReasonModal | `DeclineReasonSubmitted(reason)` | P2 |
| EnergySelector | `EnergyCheckSelected(level)` | P2 |
| CoachBottomSheet | `CoachButtonTapped`, `ScaffoldUsed` | P2 |
| HighlightPopup | `HighlightCreated`, `HighlightAutoCited` | P2 |
| ToneSuggestionCard | `ToneCheckShown`, `ToneCheckAccepted`, `SentAnyway` | P2 |
| ReceptivenessTemplateList | `ReceptiveTemplateInserted` | P2 |
| ReflectionQuizCard | `R1QuizAnswered`, `R1TextSubmitted` | P2 |
| MutualVerificationSlider | `R2SliderMoved`, `R2CorrectionAdded` | P2 |
| RoleplaySteelmanCard | `R3RoleplayStarted`, `R3Submitted`, `R3Skipped` | P2 |
| JointSummaryCardView | `JointSummaryViewed`, `JointSummaryShared` | P2 |
| GiftMessageInput | `GiftMessageWritten` | P2 |
| GiftRevealCard | `GiftMessageReceived` | P2 |
| BlindSpotCard | `BlindSpotViewed`, `BlindSpotSaved` | P2 |
| PeakEndKPISliders | `PeakEndKPISubmitted(feelHeard, rematchIntent)` | P2 |
| NextQuestionInput | `NextQuestionSaved`, `NextQuestionSkipped` | P2 |
| RecoveryRoutinePanel | `BadExperienceTriggered`, `BadExperienceCTAClicked` | P2 |
| DialogueReplayCardView | `D1ReplayViewed`, `D1ReplayResponsed` | P2 |
| PerspectivePassportView | `D7PassportViewed`, `D7PassportNewConversation` | P2 |
| StanceDriftConsentCard | `StanceDriftOptedIn` | P3 |

---

## 11. V3-P10 마이크로카피 + A/B 인프라

### 11.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| MicrocopyBanner | `src/app/_shared/components/MicrocopyBanner.tsx` | `__tests__/MicrocopyBanner.test.tsx` | 2 |

### 11.2 MicrocopyBanner — 마이크로카피 배너

**파일**: `src/app/_shared/components/__tests__/MicrocopyBanner.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | 카피 텍스트 렌더링 | 렌더링 | `text` prop 표시 확인 |
| 2 | 톤별 스타일 적용 | 렌더링 | `tone` prop에 따른 배경/텍스트 색상 클래스 확인 |

**추가 필요 테스트**:

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 3 | safety 톤: 초록 배경 | 렌더링 | `tone="safety"` → `bg-green-50` 클래스 |
| 4 | autonomy 톤: 파랑 배경 | 렌더링 | `tone="autonomy"` → `bg-blue-50` |
| 5 | curiosity 톤: 보라 배경 | 렌더링 | `tone="curiosity"` → `bg-purple-50` |
| 6 | competence 톤: 노랑 배경 | 렌더링 | `tone="competence"` → `bg-amber-50` |
| 7 | `status` ARIA role 존재 | 접근성 | `getByRole("status")` |

**검증 포인트**:
- **필수**: 전환 지점에만 노출 (페이지 전체 노출 금지 — ADR-V3-004)
- 사전 정의 6종 카피 매핑 검증

### 11.3 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/value-objects/__tests__/microcopy.test.ts` | 4 | 6종 카피, 4 context, 4 tone |
| `domain/value-objects/__tests__/feature-flag.test.ts` | 4 | rollout %, 활성/비활성, 0%/100% 경계 |
| `domain/entities/__tests__/ab-experiment.test.ts` | 4 | deterministic hash, 같은 userId→같은 variant |
| `application/use-cases/__tests__/get-microcopy-for-context.test.ts` | 2 | context→카피 반환 |
| `application/use-cases/__tests__/check-feature-flag.test.ts` | 2 | 플래그 확인 |
| `application/use-cases/__tests__/get-experiment-variant.test.ts` | 2 | variant 할당 |

---

## 12. V3-P11 Stance Drift + Perspective Passport

### 12.1 컴포넌트 목록

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| StanceDriftConsentCard | `src/app/(main)/_components/StanceDriftConsentCard.tsx` | `__tests__/StanceDriftConsentCard.test.tsx` | 3 |

### 12.2 StanceDriftConsentCard — Stance Drift 동의 화면

**파일**: `src/app/(main)/_components/__tests__/StanceDriftConsentCard.test.tsx`

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 1 | "입장 변화 알림" 제목 + opt-in/decline 버튼 렌더링 | 렌더링 | `getByText("입장 변화 알림")`, `getByText("켜기")`, `getByText("지금은 안 할게요")` |
| 2 | "켜기" 클릭 시 `onOptIn()` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |
| 3 | "지금은 안 할게요" 클릭 시 `onDecline()` 호출 | 인터랙션 | `fireEvent.click` + `vi.fn()` |

**추가 필요 테스트**:

| # | 테스트 항목 | 분류 | 방법론 |
|---|-----------|------|--------|
| 4 | "⚠️ 언제든 끄고 삭제할 수 있어요" 안내 문구 존재 | 렌더링 | `getByText(/언제든 끄고 삭제/)` |
| 5 | 설명 텍스트 "입장이 어떻게 변했는지 알려드릴 수 있어요" | 렌더링 | 설명 텍스트 확인 |

**검증 포인트 (Quality Gate — ADR-V3-005)**:
- **필수**: 옵트인 없이 drift 데이터 수집/알림 발송 불가
- **필수**: "끄고 삭제" 시 모든 drift 데이터 즉시 삭제
- **필수**: 발송 빈도 월 1회 이하 (엄격 제한)

### 12.3 도메인/애플리케이션 테스트 (비 UI)

| 테스트 파일 | 테스트 수 | 핵심 검증 항목 |
|-----------|----------|--------------|
| `domain/entities/__tests__/stance-drift.test.ts` | 4 | 축별 drift 추적, canNotify 4중 조건 |
| `domain/value-objects/__tests__/stance-drift-preference.test.ts` | 2 | optIn/optOut, 기본 opted-out |
| `domain/value-objects/__tests__/stance-drift-notification.test.ts` | 1 | 알림 템플릿 생성 |
| `application/use-cases/__tests__/calculate-stance-drift.test.ts` | 2 | drift 계산+canNotify |
| `application/use-cases/__tests__/manage-drift-preference.test.ts` | 2 | optIn/optOut 관리 |
| `application/use-cases/__tests__/send-drift-notification.test.ts` | 1 | 알림 발송 |

---

## 13. Cross-Cutting 테스트 항목

### 13.1 공통 컴포넌트

| 컴포넌트 | 경로 | 테스트 파일 | 테스트 수 |
|---------|------|-----------|----------|
| AppHeader | `src/app/_shared/components/AppHeader.tsx` | `__tests__/AppHeader.test.tsx` | 기존 |
| BottomTabBar | `src/app/_shared/components/BottomTabBar.tsx` | `__tests__/BottomTabBar.test.tsx` | 기존 |
| AuthProvider | `src/app/_shared/providers/AuthProvider.tsx` | `__tests__/AuthProvider.test.tsx` | 기존 |

### 13.2 접근성 (a11y) 체크리스트

모든 컴포넌트에 대해 검증 필요:

| # | 항목 | 방법론 |
|---|------|--------|
| 1 | 모든 인터랙티브 요소에 적절한 ARIA role | `getByRole` 쿼리로 확인 |
| 2 | 모든 form 요소에 label 연결 | `getByLabelText` 가능 여부 |
| 3 | 버튼에 접근 가능한 이름 | `getByRole("button", { name })` |
| 4 | 모달/다이얼로그에 `dialog` role | `getByRole("dialog")` |
| 5 | 알림/상태에 `alert` 또는 `status` role | 상황에 맞는 role 확인 |
| 6 | 색상 대비 충족 (WCAG AA 기준) | 시각 테스트 또는 axe-core |
| 7 | 키보드 내비게이션 가능 | Tab/Enter/Space 키 테스트 |

### 13.3 프라이버시 (Privacy by Design) 체크리스트

| # | 항목 | 대상 컴포넌트 | 방법론 |
|---|------|-------------|--------|
| 1 | PII 미노출 (공유 카드) | ShareCardPreview | 프라이버시 문구 필수 포함 검증 |
| 2 | PII scrubber 적용 (Gift Message) | GiftMessageInput | 통합 테스트에서 PII 입력→scrub 검증 |
| 3 | Conversation Trailer에 PII/가치라벨 없음 | MatchCardV3 | trailer 텍스트 검증 |
| 4 | 이벤트 payload에 PII 없음 | 전체 이벤트 | EventMetadata userId anonymized |
| 5 | INSIGHT 알림 K-anonymity 검증 | NotificationTemplate | 최소 15명 검증 |
| 6 | Stance Drift 옵트인 필수 | StanceDriftConsentCard | 옵트인 없이 drift 수집 불가 |

### 13.4 다크패턴 방지 체크리스트

| # | 항목 | 대상 컴포넌트 | 방법론 |
|---|------|-------------|--------|
| 1 | 톤 체크에 "원래대로 보내기" 항상 존재 | ToneSuggestionCard | 양쪽 버튼 동시 렌더링 검증 |
| 2 | 복구 루틴에 사과 문구 없음 | RecoveryRoutinePanel | `queryByText(/사과/)` → null |
| 3 | 복구 CTA 양쪽 동등 | RecoveryRoutinePanel | 동일 스타일/크기 검증 |
| 4 | Perspective Passport에 스트릭 없음 | PerspectivePassportView | 연속 접속 표시 부재 확인 |
| 5 | 알림 기본값 "핵심만" | NotificationPreference | 기본 설정 검증 |
| 6 | Drift 알림 강요 없음 | StanceDriftConsentCard | "지금은 안 할게요" 동등 표시 |
| 7 | R3 역할극 첫 3회 건너뛰기 가능 | RoleplaySteelmanCard | `canSkip=true` 3회 후 변경 |

---

## 14. 통합 테스트 시나리오

### 14.1 온보딩 → 매칭 플로우

```
시나리오: 사용자가 온보딩 완료 후 매칭 시작
  Given 새 사용자가 앱에 접속
  When ModeSelector에서 "STANDARD" 선택
  And 10개 문항 순차 응답
  And 결과 화면에서 ShareCard 확인
  And NextStepHub에서 "대화 상대 찾기" 클릭
  Then 매칭 페이지로 이동
  And MatchCardV3 렌더링
```

### 14.2 대화 → Reflection → Peak-End 플로우

```
시나리오: 대화 완료 후 Peak-End 경험
  Given 대화 세션이 진행 중
  When 각 단계(POSITION→QUESTION→ANSWER) 진행
  And Coach 버튼 사용 (선택)
  And 밑줄 긋기 → 자동 인용 (선택)
  And REFLECTION 진입
  And R1 퀴즈 → R2 슬라이더 → R3 역할극 → R4 공통점
  Then Peak-End 플로우 시작
  And 공동 요약 카드 → Gift 공개 → Blind Spot → KPI 슬라이더 → 다음 질문
```

### 14.3 나쁜 경험 → 복구 플로우

```
시나리오: Feel Heard < 20 시 복구 루틴
  Given Peak-End KPI 슬라이더에서 Feel Heard를 15로 설정
  When KPI 제출
  Then BadExperienceDetector.shouldTrigger → true
  And RecoveryRoutinePanel 렌더링
  And 사과 문구 없음
  And 양쪽 CTA 동등
  When "나중에 다시 보기" 클릭
  Then 홈으로 이동 (강요 없음)
```

### 14.4 리텐션 루프

```
시나리오: D+1 복기 카드 노출
  Given 사용자가 대화 완료 1일 후 재방문
  When HomeState.determine() → POST_DIALOGUE_D1
  Then DialogueReplayCardView 렌더링
  And 3개 응답 선택 표시
  When "내 생각이 조금 바뀌었어요" 선택
  Then stance_vector 재측정 유도 (강제 아님)
```

### 14.5 Stance Drift 옵트인 → 알림

```
시나리오: Stance Drift 옵트인 후 알림 수신
  Given 사용자가 StanceDriftConsentCard에서 "켜기" 클릭
  And 4회 이상 대화 완료
  And 동일 축 0.2 이상 이동
  And 마지막 알림 이후 30일 경과
  When CalculateStanceDrift 실행
  Then 알림 생성: "N주 전보다 {축}에서 {방향}에 가까워졌어요"
```

---

## 15. E2E 테스트 시나리오

### 15.1 Playwright 기반 E2E (향후 구현)

| # | 시나리오 | 핵심 검증 | 우선순위 |
|---|---------|----------|---------|
| 1 | 신규 사용자 전체 온보딩 플로우 | 모드 선택→문항 응답→결과 화면→Next Step | P0 |
| 2 | 매칭 수락 → 대화 시작 | 매칭 카드 렌더링→에너지 선택→대화 진입 | P0 |
| 3 | 대화 6단계 전체 진행 | AFFIRMATION~JOINT_SUMMARY 전체 FSM | P0 |
| 4 | Reflection R1~R4 + Peak-End 전체 | 퀴즈→검증→역할극→공통점→공동요약→KPI | P1 |
| 5 | 나쁜 경험 복구 트리거 + 복구 루틴 | Feel Heard<20→복구 UI→매칭 조정 | P1 |
| 6 | 거절 UX → 사유 선택 → 다음 매칭 조정 | 거절→4지선다→매칭 파라미터 변경 | P2 |
| 7 | D+1 복기 카드 응답 → 재측정 유도 | 홈 상태 전환→복기→재측정 유도 | P2 |
| 8 | Stance Drift 옵트인 → 알림 수신 | 동의→대화 4회→drift 계산→알림 | P2 |
| 9 | A/B 실험 variant 할당 determinism | 같은 userId→같은 variant 반복 확인 | P2 |
| 10 | 마이크로카피 전환 지점만 노출 | 로딩/대기 시에만 카피 표시, 일반 페이지에서 미표시 | P2 |

---

## 16. 테스트 커버리지 요약

### 16.1 현재 상태 (Unit 테스트)

| Phase | 도메인 테스트 | 애플리케이션 테스트 | 프레젠테이션 테스트 | 합계 |
|-------|------------|-----------------|-----------------|------|
| V3-P1 | 18 | 7 | 20 | 45 |
| V3-P2 | 4 | 4 | 11 | 19 |
| V3-P3 | 12 | 6 | 27 | 45 |
| V3-P4 | 15 | 10 | 24 | 49 |
| V3-P5 | 11 | 12 | 20 | 43 |
| V3-P6 | 20 | 12 | 16 | 48 |
| V3-P7 | 9 | 6 | 3 | 18 |
| V3-P8 | 20 | 12 | 10 | 42 |
| V3-P9 | 9 | 2 | 0 | 11 |
| V3-P10 | 12 | 6 | 2 | 20 |
| V3-P11 | 7 | 5 | 3 | 15 |
| **합계** | **137** | **82** | **136** | **355** |

### 16.2 추가 필요 테스트 (식별된 갭)

| 영역 | 항목 | 우선순위 |
|------|------|---------|
| HomeStateView | 나머지 3개 상태 (MAP_COMPLETED, WAITING_MATCH, HAS_FRIENDS) | P1 |
| MicrocopyBanner | 4개 톤별 스타일 세분화 테스트 | P2 |
| StanceDriftConsentCard | 안내 문구 존재 검증 | P2 |
| 이벤트 발화 | 컴포넌트별 analytics event 발화 통합 테스트 (25+ 항목) | P1 |
| 접근성 | 전체 컴포넌트 ARIA role / 키보드 내비게이션 | P1 |
| 프라이버시 | PII scrubber 통합 테스트 (Gift Message, Trailer 등) | P0 |
| 통합 시나리오 | 5개 핵심 플로우 (14장 참조) | P0 |
| E2E | Playwright 10개 시나리오 (15장 참조) | P1 |

### 16.3 Quality Gate 종합 체크리스트

아래 항목은 v3.0 릴리스 전 반드시 통과해야 하는 최종 검증 항목이다:

- [ ] 전체 Unit 테스트 통과 (1,431+)
- [ ] Build 에러 없음
- [ ] ESLint 클린
- [ ] DI Container ≤ 300 lines
- [ ] Clean Architecture 의존성 규칙 위반 없음
- [ ] 공유 카드에 프라이버시 필수 문구 포함
- [ ] Gift Message에 PII scrubber 적용
- [ ] Conversation Trailer에 PII/가치 라벨 없음
- [ ] 이벤트 payload에 PII 없음
- [ ] 톤 체크에 "원래대로 보내기" 항상 존재
- [ ] 복구 루틴에 사과 문구 없음
- [ ] 복구 CTA 양쪽 동등
- [ ] Perspective Passport에 스트릭 없음
- [ ] 알림 기본값 "핵심만"
- [ ] Stance Drift 옵트인 없이 수집 불가
- [ ] A/B variant 할당 deterministic
- [ ] 마이크로카피 전환 지점만 노출
- [ ] R1 퀴즈 선택지 항상 4개
- [ ] HomeState 6종 모두 올바르게 결정
- [ ] KPI 수집 2문항만 (Affective Warmth 별도 문항 없음)
- [ ] Anchor 질문 7개 불변
