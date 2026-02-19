# Implementation Plan: V4-P1 Loop Quality (루프 품질)

**Status**: Pending
**Created**: 2026-02-20
**Source Blueprint**: `004-v4-development-blueprint.md` Section 6

---

## Overview

V4-P1은 "두 번째 대화를 하고 싶게 만드는" 기능 10개로 구성된다.
P0 완료 이후의 루프 품질 향상 단계이며, 일부는 이미 부분 구현됨.

### OEC 연결

```
OEC = 대화 완료율 × Feel Heard × 재매칭 클릭/7일 재방문
```

P1은 주로 **재매칭 클릭/7일 재방문** 지표에 직접 영향.

---

## Gap Analysis Summary

| # | 피처 | 구현 상태 | 갭 요약 |
|---|------|----------|---------|
| P1-1 | 스캐폴딩 (3종 예시 + Coach) | **완료** | 예시 캐러셀 + 90초 코치 타이머 구현됨 |
| P1-2 | 수용성 전염 | **미구현** | 기존: 정적 템플릿 반환만. LLM 감지 없음 |
| P1-3 | Decline UX + 배지 연동 | **부분** | 사유→조정 매핑 도메인 있음. DeclineBadge.tsx 존재하나 AdjustmentBadge VO 없음 |
| P1-4 | 선물 한 문장 UI 개선 | **완료** | GiftMessageInput.tsx + GiftRevealCard.tsx 구현됨 |
| P1-5 | Blind Spot Discovery UI | **완료** | BlindSpotCard.tsx에 발견 프레이밍 + 저장 CTA 구현됨 |
| P1-6 | 다음 질문 저장 UI | **부분** | HomeStateView에 savedQuestions 추가됨. 재방문 시작 카드 미완 |
| P1-7 | D+1 복기 | **부분** | FollowUpReviewCard.tsx 있음. DailyReview 엔티티 미생성 |
| P1-8 | Perspective Passport UI | **부분** | 도메인 엔티티 + PerspectivePassportView.tsx 있음. 뱃지 시스템 없음 |
| P1-9 | Trailer 일치도 품질 루프 | **미구현** | PeakEndKPI에 trailerAccuracy 필드 없음 |
| P1-10 | 차원별 매칭 필터 (앵커) | **미구현** | VO/UC/UI 모두 없음 |

---

## Phase P1-2: 수용성 전염

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `src/domain/value-objects/receptiveness-template.ts` | 존재. 6개 정적 템플릿, `sourceType`/`detectedExpression` 없음 |
| Domain Interface | `src/domain/interfaces/facilitator.ts` | `suggestReceptivenessTemplate(text): Promise<string[]>` 존재 |
| Application UC | `src/application/use-cases/suggest-receptiveness-template.ts` | 존재. 정적 템플릿만 반환 (LLM 미사용) |
| Infrastructure | `openai-facilitator.ts` | `suggestReceptivenessTemplate()` 존재하나 기본 구현 |
| UI | 없음 | 수용적 표현 감지/제안 패널 없음 |

### 구현 필요 사항

**Domain Layer**:
- `receptiveness-template.ts` 변경:
  - `sourceType: 'mechanical' | 'detected'` 필드 추가
  - `detectedExpression?: string` 필드 추가
  - `ReceptivenessTemplateData` 인터페이스 확장

**Application Layer**:
- `suggest-receptiveness-template.ts` 변경:
  - 입력에 `opponentText: string` 추가
  - `Facilitator.suggestReceptivenessTemplate()` 호출하여 LLM 감지 결과 포함
  - 감지 결과 + 기존 템플릿 혼합 반환

**Infrastructure Layer**:
- `openai-facilitator.ts` 변경:
  - `suggestReceptivenessTemplate()` 내 LLM 호출로 상대 텍스트에서 수용적 표현 감지
- `facilitator-prompts.ts`:
  - 수용성 감지 프롬프트 추가

**Presentation Layer**:
- 신규: `src/app/(main)/dialogue/_components/ReceptivenessNudge.tsx`
  - "상대방이 다른 관점도 고려하고 있어요" 메시지
  - `[ 이 표현을 내 답장에 포함 ]` / `[ 괜찮아요 ]` 버튼
- TurnSubmissionForm 내 렌더링 슬롯 추가

### 이벤트
- `receptivity_template_shown` / `receptivity_template_accept` / `receptivity_template_dismiss`

---

## Phase P1-3: Decline UX + 배지 연동

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `decline-reason.ts` | **완료**. 4종 사유 + `DeclineMatchingAdjustment`(distanceDelta/levelDelta/changeTopicFlag) 구현 |
| Application UC | `record-decline-reason.ts` | **완료**. 사유→조정 매핑 반환 |
| Domain VO | `adjustment-badge.ts` | **미존재** |
| UI | `DeclineBadge.tsx` | v3에서 생성됨 (IntegratedMatchCard 내부) |

### 구현 필요 사항

**Domain Layer**:
- 신규: `src/domain/value-objects/adjustment-badge.ts`
  - `AdjustmentBadge` 클래스: `text`, `adjustments` (DeclineMatchingAdjustment 참조)
  - 사유→배지 텍스트 매핑:
    - NO_TIME → "조정됨: 오늘은 가볍게(5분)"
    - TOPIC_HEAVY → "조정됨: 주제 Level 0"
    - NEED_REST → "조정됨: 에너지 절약 모드"
    - DIFFERENT_TOPIC → (배지 없음)

**Application Layer**:
- `record-decline-reason.ts` 변경:
  - 출력에 `badge?: AdjustmentBadge` 추가
  - 다음 매칭 시 배지 생성 로직

**Presentation Layer**:
- 기존 `DeclineBadge.tsx` 확인 후 배지 텍스트 동적 렌더링 연동
- 매칭 카드 상단에 배지 조건부 표시

### 이벤트
- `match_decline_reason_{time|topic|energy|other}` (기존)
- `adjusted_badge_display` (신규)

---

## Phase P1-4: 선물 한 문장 UI 개선

### 현재 상태: **완료**

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `gift-message.ts` | **완료**. `GiftMessage.create()`, `reveal()`, 100자 제한 |
| Application UC | `write-gift-message.ts` | **완료** |
| Application UC | `reveal-gift-message.ts` | **완료** |
| UI | `GiftMessageInput.tsx` | **완료**. 대화 흐름 내 배치 |
| UI | `GiftRevealCard.tsx` | **완료**. 피크엔드 플로우 내 공개 |

추가 작업 불필요.

---

## Phase P1-5: Blind Spot Discovery UI 개선

### 현재 상태: **완료**

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `blind-spot-discovery.ts` | **완료**. `discoveredConcept`, `dialogueId` |
| Application UC | `extract-blind-spot.ts` | **완료** |
| UI | `BlindSpotCard.tsx` | **완료**. 발견 이모지 + 저장 CTA + "explore more" 구현됨 |

추가 작업 불필요.

---

## Phase P1-6: 다음 질문 저장 UI (잔여 작업)

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `next-question-save.ts` | **완료** |
| Application UC | `save-next-question.ts` | **완료** |
| UI | `HomeStateView.tsx` | **부분**. `savedQuestions` props 추가됨 (P1-8에서 구현) |

### 구현 필요 사항

**Presentation Layer**:
- 신규: `src/app/(main)/_components/SavedQuestionStartCard.tsx`
  - 재방문 홈에서 저장된 질문을 대화 시작 카드로 표시
  - "지난번에 궁금했던 것:" + 질문 텍스트
  - `[ 이 질문으로 대화 시작 ]` CTA
- `HomeStateView.tsx` 변경:
  - `SavedQuestionStartCard` 렌더링 연동

---

## Phase P1-7: D+1 복기 (잔여 작업)

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain Entity | `daily-review.ts` | **미존재** (기획서 요구) |
| Application UC | `schedule-follow-up.ts` | **존재** (ONE_DAY_MS로 변경됨) |
| Application UC | `submit-follow-up-checkin.ts` | **존재** |
| UI | `FollowUpReviewCard.tsx` | **존재** (30초 타이머, 3선택) |
| API | `api/follow-up/route.ts` | **존재** (POST 예약 + GET 대기목록) |
| API | `api/follow-up/[id]/route.ts` | **존재** (DI 연결됨) |

### 구현 필요 사항

현재 FollowUp 엔티티로 D+1 기능의 대부분을 커버하고 있음. 기획서의 `DailyReview` 엔티티와의 차이:

**갭 분석**:
- 기존 FollowUp: 일반적 팔로업 체크인 (범용)
- 기획서 DailyReview: 대화 D+1에 특화 + 응답별 분기 (changed→stance 업데이트, unsure→Level 0 추천, same→새 주제 추천)

**Domain Layer**:
- 기존 FollowUp 엔티티 내에 `reviewType: 'daily' | 'weekly'` 필드 추가 (또는 별도 DailyReview 생성)
- 응답별 분기 로직: `response → nextAction` 매핑

**Application Layer**:
- `submit-follow-up-checkin.ts` 변경:
  - 응답별 분기 반환: `{ nextAction: 'suggest_stance_update' | 'recommend_level0' | 'recommend_new_topic' }`

**Presentation Layer**:
- `FollowUpReviewCard.tsx` 변경:
  - 주제 + 상대 핵심 주장 표시 추가
  - 응답 후 분기별 다음 액션 안내

---

## Phase P1-8: Perspective Passport UI

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain Entity | `perspective-passport.ts` | **완료**. `weeklyExploredCount`, `totalExploredCount`, `discoveredConcepts[]`, `addDiscovery()` |
| Application UC | `update-perspective-passport.ts` | **완료** |
| UI | `PerspectivePassportView.tsx` | **존재**. 주간/총 카운트 + discoveredConcepts 목록 표시. 뱃지 없음 |

### 구현 필요 사항

**Presentation Layer** (신규):
- `src/app/(main)/passport/page.tsx` — Passport 메인 페이지
- `src/app/(main)/passport/_components/PassportHeader.tsx`
  - 총 탐색 관점 수 + 주간 카운트
- `src/app/(main)/passport/_components/BadgeGrid.tsx`
  - 뱃지 목록: 관찰자/경청가/탐색가 (조건별 잠금/해제)
  - 뱃지 조건 VO 필요 (Domain에 추가)
- `src/app/(main)/passport/_components/DiscoveryCardList.tsx`
  - `discoveredConcepts[]` 카드 형태 렌더링
  - 날짜/주제별 그룹핑
- `src/app/(main)/passport/_components/SavedPersonaList.tsx`
  - (P2-4 연동 예정, 빈 상태 표시)

**Domain Layer**:
- 신규: `src/domain/value-objects/passport-badge.ts`
  - `BadgeType: 'OBSERVER' | 'LISTENER' | 'EXPLORER'`
  - 해제 조건 정의

**라우트**: `(main)/passport` 추가 → 하단 네비게이션 또는 프로필에서 접근

---

## Phase P1-9: Trailer 일치도 품질 루프

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `peak-end-kpi.ts` | **완료**. `feelHeardSlider`, `rematchIntentSlider`만 존재. `trailerAccuracy` 없음 |
| Application UC | `collect-peak-end-kpi.ts` | **완료** |
| Infrastructure | 없음 | 품질 플래깅/튜닝 로직 없음 |

### 구현 필요 사항

**Domain Layer**:
- `peak-end-kpi.ts` 변경:
  - `trailerAccuracySlider: number` 필드 추가 (0-100)
  - `isTrailerLowQuality(): boolean` (< 30 → true)

**Application Layer**:
- `collect-peak-end-kpi.ts` 변경:
  - `trailerAccuracySlider` 입력 추가
  - 저장 시 자동 플래깅 (accuracy < 30 → `isFlagged: true`)
- 신규: `src/application/use-cases/get-trailer-quality-stats.ts`
  - 집계: 평균 일치도, 플래깅 비율
  - Guardrail: 평균 < 3.0 시 긴급 리뷰 플래그

**Presentation Layer**:
- `PeakEndKPISliders.tsx` 변경:
  - Trailer 일치도 이모지 슬라이더 추가 (기존 2문항 → 3문항)

---

## Phase P1-10: 차원별 매칭 필터 (앵커)

### 현재 상태

모두 미존재. 도메인/애플리케이션/UI 전부 신규.

### 구현 필요 사항

**Domain Layer**:
- 신규: `src/domain/value-objects/anchor-type.ts`
  - `AnchorType = 'gender' | 'job_category' | 'age_group' | 'region'`
- 신규: `src/domain/value-objects/anchor-attribute.ts`
  - `AnchorAttribute { type: AnchorType, value: string }`

**Application Layer**:
- 신규: `src/application/use-cases/apply-anchor-filter.ts`
  - 입력: `userId`, `anchorType`, `differenceSlider` (0-100)
  - 앵커 속성 일치 후보 필터링
  - 에너지 상한과 다름 슬라이더 통합

**Presentation Layer**:
- 신규: `src/app/(main)/matching/components/AnchorFilterPanel.tsx`
  - 공통점 선택: 같은 성별/직업군/연령대
  - 다름의 정도 슬라이더 (0-100)
  - 매칭 페이지 내 접힘 패널

### 이벤트
- `anchor_filter_select_{type}` / `distance_slider_set`

---

## 잔여 P0 갭

### P0-A1: 데이터 관리 즉시 진입 deep-link

| 파일 | 상태 |
|------|------|
| `TrustMoment.tsx` | 3줄 요약/Disclosure/CTA 있음. "내 데이터 관리" 링크 없음 |
| `page.tsx` (landing) | 🔒 배지 추가됨 (P1-1). `/settings/privacy` 링크 존재 |

**작업**: TrustMoment.tsx에 "🗑️ 내 데이터 관리" 하단 링크 추가 → `/settings/privacy`

### P0-B1: OG 이미지 생성

| 파일 | 상태 |
|------|------|
| `ShareCard.tsx` | 존재. Canvas→PNG 또는 og:image 미구현 |

**작업**: `@vercel/og` 또는 Canvas API로 유형 카드 이미지 생성

---

## 의존성 그래프

```
P1-2 (수용성 전염)         ← LLM 의존 (hasValidKey 분기)
P1-3 (Decline 배지)        ← P0-B3 매칭 엔진 (완료)
P1-4 (선물 UI)             ← 독립
P1-5 (Blind Spot UI)       ← 독립
P1-6 (다음 질문 UI)        ← 독립
P1-7 (D+1 복기 보완)       ← P2-4 FollowUp API (완료)
P1-8 (Passport UI)         ← P1-5 (발견 저장 CTA)
P1-9 (Trailer 품질)        ← P0-B4 Trailer (완료)
P1-10 (앵커 필터)          ← P0-B3 매칭 엔진 (완료)
```

**추천 실행 순서**: P1-4 → P1-5 → P1-3 → P1-6 → P1-8 → P1-7 → P1-9 → P1-2 → P1-10

---

## 공수 추정 (테스트 제외)

| Phase | 예상 | 난이도 |
|-------|------|--------|
| P1-2 수용성 전염 | 4-6h | Medium (LLM 프롬프트) |
| P1-3 Decline 배지 | 2-3h | Low |
| P1-4 선물 UI | 1-2h | Low (UI only) |
| P1-5 Blind Spot UI | 1-2h | Low (UI only) |
| P1-6 다음 질문 UI | 2-3h | Low |
| P1-7 D+1 복기 보완 | 3-4h | Medium |
| P1-8 Passport UI | 5-8h | Medium (신규 페이지) |
| P1-9 Trailer 품질 | 3-4h | Medium |
| P1-10 앵커 필터 | 6-8h | High (신규 전체) |
| P0 잔여 | 2-3h | Low |
| **합계** | **29-43h** | |
