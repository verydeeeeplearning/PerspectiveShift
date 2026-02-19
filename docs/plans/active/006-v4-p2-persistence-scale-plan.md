# Implementation Plan: V4-P2 Persistence & Scale (지속성 & 확장)

**Status**: Pending
**Created**: 2026-02-20
**Source Blueprint**: `004-v4-development-blueprint.md` Section 7
**Prerequisites**: V4-P0 완료, V4-P1 일부 완료

---

## Overview

V4-P2는 "서비스가 지속 가능하려면 필요한" 기능 10개로 구성된다.
JITAI 엔진 고도화, 튜링 테스트, 페르소나 메모리, PWA 등 중장기 지속성 기능.

---

## Gap Analysis Summary

| # | 피처 | 구현 상태 | 갭 요약 |
|---|------|----------|---------|
| P2-1 | JITAI Rule Engine | **부분** | InterventionPolicy(Rule A/B/D 커버), LangGraph Agent 있음. Rule C/E 없음, 전체 Rule Engine UC 없음 |
| P2-2 | 복구 루틴 고도화 | **부분** | 확인 다이얼로그 있음. 약속 3개/복구 배지/해제 조건 없음 |
| P2-3 | 튜링 테스트 게임 | **미구현** | 도메인/UC/UI 전부 없음 |
| P2-4 | 페르소나 저장 & 메모리 | **미구현** | SavedPersona 엔티티/UC 없음 |
| P2-5 | R3 역할극 (Steelman) | **부분** | VO 있음. 점진적 노출 전략 미반영 |
| P2-6 | 정밀도 사다리 확장 | **부분** | 기본 5/10/20 있음. 퀵 모드 업셀 UX 없음 |
| P2-7 | Self-Affirmation 워밍업 | **부분** | VO/UC 있음. v4 마이크로카피 미반영 |
| P2-8 | PWA 알림 시스템 | **미구현** | manifest/SW/알림 전부 없음 |
| P2-9 | 친구 시스템 고도화 | **부분** | 기본 친구/친밀도/채팅 있음. Phase 3 에스컬레이션 UI 없음 |
| P2-10 | 공동 요약 카드 애니메이션 | **미구현** | JointSummaryCard 있음. 합쳐지기 애니메이션 없음 |

---

## Phase P2-1: JITAI Rule Engine

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `intervention-policy.ts` | **존재**. `InterventionPolicy.evaluate()` — 에너지/턴/스텝/비활동 기반 결정 |
| Domain VO | `jitai-rule.ts` | **미존재** |
| Domain VO | `intervention-action.ts` | **미존재** |
| Domain Interface | `dialogue-agent.ts` | **존재**. `DialogueAgent.decide()` 포트 |
| Infrastructure | `dialogue-agent-graph.ts` | **존재**. LangGraph StateGraph (evaluate→route→[5 nodes]) |
| Infrastructure | `langsmith-tracer.ts` | **존재**. LangSmith env var 읽기 |
| Application UC | `evaluate-jitai-rules.ts` | **미존재** |
| Application UC | `apply-downshift.ts` | **미존재** |

### Rule 커버리지 분석

기존 `InterventionPolicy.evaluate()`이 커버하는 규칙:

| Rule | 기획서 조건 | InterventionPolicy 커버? | 갭 |
|------|-----------|------------------------|-----|
| **A (피로)** | energy == low | **부분**. `energy < 30` → scaffold/break_suggest | 에너지 "low" 매핑 연동 필요 |
| **B (빈칸 공포)** | 90초 무입력 + 삭제 ≥2 | **부분**. `secondsSinceLastTurn > 120` → coach | 삭제 횟수 신호 없음 |
| **C (긴장)** | 톤 체크 2회 연속 | **미커버** | 톤 체크 횟수 신호 필요 |
| **D (불쾌)** | Feel Heard <2 OR 부정감정 OR 신고 | **부분**. `energy < 20 + turnCount > 4` → break_suggest | 실제 Feel Heard/신고 신호 없음 |
| **E (경청 부족)** | 하이라이트 0개 + 인용 0개 | **미커버** | 하이라이트/인용 신호 필요 |

### 구현 필요 사항

**Domain Layer**:
- 신규: `src/domain/value-objects/jitai-rule.ts`
  ```
  JitaiRuleId = 'FATIGUE' | 'BLANK_FEAR' | 'TENSION' | 'DISTRESS' | 'LOW_LISTENING'
  JitaiRule { id, condition: JitaiCondition, actions: JitaiAction[] }
  ```
- 신규: `src/domain/value-objects/intervention-action.ts`
  ```
  JitaiAction { type: 'downshift' | 'coach_highlight' | 'break_suggest' | 'recovery' | 'nudge_highlight', params }
  ```
- 신규: `src/domain/value-objects/jitai-signal.ts`
  - 에이전트가 수집하는 사용자 신호 타입:
  ```
  JitaiSignal {
    energy: number;
    idleSeconds: number;
    deleteCount: number;
    consecutiveToneChecks: number;
    feelHeardScore: number;
    highlightCount: number;
    quoteCount: number;
    hasReport: boolean;
  }
  ```
- `intervention-policy.ts` 변경:
  - `evaluate()` 입력에 `JitaiSignal` 기반으로 확장
  - Rule C (긴장), Rule E (경청 부족) 로직 추가

**Application Layer**:
- 신규: `src/application/use-cases/evaluate-jitai-rules.ts`
  - 입력: `JitaiSignal`
  - 모든 Rule (A~E) 평가 → 적용 가능한 `JitaiAction[]` 반환
  - 우선순위: D (불쾌) > A (피로) > C (긴장) > B (빈칸 공포) > E (경청 부족)
- 신규: `src/application/use-cases/apply-downshift.ts`
  - 입력: `JitaiAction[]`, 현재 매칭 파라미터
  - 출력: 조정된 매칭 파라미터

**Infrastructure Layer**:
- `dialogue-agent-graph.ts` 변경:
  - `evaluateNode`에서 `JitaiSignal` 기반 `InterventionPolicy` 호출
  - `DialogueAgentState`에 `deleteCount`, `consecutiveToneChecks`, `highlightCount`, `quoteCount` 필드 추가

### 롤아웃 전략
1. Rule A → 전체 (이미 에너지 기반)
2. Rule D → 전체 (안전 기능)
3. Rule B → 10% → 50% → 100%
4. Rule C → 10% → 50% → 100%
5. Rule E → 10% → 50% → 100%

---

## Phase P2-2: 복구 루틴 고도화

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain Entity | `recovery-routine.ts` | **존재**. `dialogueId`, `action` (RecoveryAction), `messages[]` (4개 고정) |
| Domain VO | `recovery-action.ts` | **존재**. `type: 'exclude_and_reset'`, `excludeDialogue`, `resetNextParams` |
| Application UC | `apply-recovery-routine.ts` | **존재** |
| UI | `RecoveryRoutinePanel.tsx` | **존재**. 확인 다이얼로그 + 버튼 역할 스왑 (P1-7에서 추가) |

### 구현 필요 사항

**Domain Layer**:
- `recovery-routine.ts` 변경:
  - `promises: RecoveryPromise[]` 필드 추가 (3개 약속)
  - `recoveryMode: boolean` 필드 추가
  - `recoveryBadge?: string` 필드 추가
  - `autoReleaseCount: number` 필드 추가
- 신규: `src/domain/value-objects/recovery-promise.ts`
  ```
  RecoveryPromise { id, text, type: 'topic_change' | 'difficulty_down' | 'time_reduce' }
  ```
- `recovery-routine.ts`에 해제 조건 로직:
  - 복구 대화 1회 + Feel Heard ≥3 → 자동 해제
  - 수동 해제 가능
  - 3회 대화 자동 해제

**Application Layer**:
- `apply-recovery-routine.ts` 변경:
  - 약속 3개 선택 입력 추가
  - 복구 모드 활성화/해제 로직
  - 해제 조건 체크 로직

**Presentation Layer**:
- `RecoveryRoutinePanel.tsx` 변경:
  - 확인 다이얼로그 후 → 3개 약속 선택 UI
  - 약속 옵션: "주제 바꾸기" / "난이도 낮추기" / "시간 줄이기" (체크박스)
  - 다음 매칭 카드 상단: 복구 모드 배지

---

## Phase P2-3: 튜링 테스트 게임

### 현재 상태

전부 미구현. 도메인/애플리케이션/UI 전체 신규.

### 구현 필요 사항

**Domain Layer**:
- 신규: `src/domain/entities/turing-guess.ts`
  ```
  TuringGuess {
    id, userId, dialogueSessionId,
    guess: 'human' | 'ai',
    actual: 'human' | 'ai',
    isCorrect: boolean,
    createdAt: Date
  }
  ```
- 신규: `src/domain/value-objects/turing-reward.ts`
  ```
  TuringReward { type: 'observer_badge' | 'sharp_observer' | 'impressive_view' | 'unexpected_view', message }
  ```
  - 정답 → Passport "관찰자 뱃지" +1
  - 3연속 정답 → "날카로운 관찰자" 칭호
  - AI→사람 오인 → "인상적인 관점"
  - 사람→AI 오인 → "의외의 시각"

**Application Layer**:
- 신규: `src/application/use-cases/submit-turing-guess.ts`
  - 입력: `userId`, `dialogueSessionId`, `guess`
  - 로직: 실제 대화 유형 조회 → 정답 판정 → 리워드 계산 → Passport 업데이트
- 신규: `src/application/use-cases/get-turing-stats.ts`
  - 입력: `userId`
  - 출력: `{ totalGuesses, correctGuesses, accuracy, streak, badges }`

**Presentation Layer**:
- 신규: `src/app/(main)/dialogue/_components/TuringTestPanel.tsx`
  - Agent 대화 완료 시 피크엔드 플로우 내 표시
  - "이 대화 상대는 사람이었을까요, AI였을까요?"
  - `[ 사람 ]` / `[ AI ]` 버튼
  - 결과 공개 + 리워드 메시지 + 뱃지 애니메이션
- 기존 `PeakEndFlow.tsx` 변경:
  - Step 5 (KPI 후, CTA 전)에 TuringTestPanel 조건부 렌더링 (Agent 대화일 때만)

### 이벤트
- `turing_guess_{human|ai}` / `turing_correct` / `turing_badge_earned`

---

## Phase P2-4: 페르소나 저장 & 메모리

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain Entity | `persona-profile.ts` | **존재**. 기본 프로필 |
| Domain Interface | `persona-repository.ts` | **존재**. `findAll()`, `findById()` |
| Domain Interface | `persona-dialogue-generator.ts` | **존재** |
| Infrastructure | `openai-persona-generator.ts` | **존재**. GPT-5-mini 연동 |
| Infrastructure | `in-memory-persona-repository.ts` | **존재**. 3종 시드 |
| Domain Entity | `saved-persona.ts` | **미존재** |
| Application UC | `save-persona.ts` | **미존재** |
| Application UC | `resume-persona-conversation.ts` | **미존재** |

### 구현 필요 사항

**Domain Layer**:
- 신규: `src/domain/entities/saved-persona.ts`
  ```
  SavedPersona {
    userId, personaId,
    conversationCount: number,
    lastConversationAt: Date,
    conversationSummaries: string[],
    sharedContext: string[],
    userStanceMemory: string[],
    savedQuestions: string[]
  }
  ```
- 신규: `src/domain/interfaces/saved-persona-repository.ts`
  ```
  SavedPersonaRepository {
    findByUserAndPersona(userId, personaId): Promise<SavedPersona | null>
    save(savedPersona): Promise<void>
    findByUser(userId): Promise<SavedPersona[]>
  }
  ```

**Application Layer**:
- 신규: `src/application/use-cases/save-persona.ts`
  - 대화 완료 시 페르소나 저장/업데이트
  - 대화 요약 추가, 공유 컨텍스트 업데이트
- 신규: `src/application/use-cases/resume-persona-conversation.ts`
  - 이전 대화 요약 로드 → Agent system prompt에 컨텍스트 주입
  - 연속성 있는 대화 재개

**Infrastructure Layer**:
- `openai-persona-generator.ts` 변경:
  - `generateResponse()` 시 이전 대화 요약 컨텍스트 주입 지원
  - system prompt에 `sharedContext`, `userStanceMemory` 반영

**Presentation Layer**:
- Passport 페이지 내 `SavedPersonaList` (P1-8과 연동)
  - 저장된 페르소나 카드: 대화 횟수, 마지막 대화일, "이어서 대화하기" CTA

---

## Phase P2-5: R3 역할극 (Steelman)

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `roleplay-steelman.ts` | **존재**. `isForceRequired(dialogueCount, understandingScore)` 메서드 있음 |
| Application UC | `submit-roleplay-steelman.ts` | **존재** |

### 구현 필요 사항

기존 `isForceRequired()`는 이미 점진적 노출 기본 로직 포함:
- `dialogueCount <= 3` → optional
- `dialogueCount > 3 && understandingScore < 50` → force

**갭**: UI에서의 점진적 노출 전략 구현

**Presentation Layer**:
- 리플렉션 플로우 내 R3 단계 변경:
  - 1~3회: 옵트인 ("상대 입장에서 말해볼래요?" 소극적 제안)
  - 4~6회: 약한 넛지 ("상대 입장을 이해하는 데 도움이 돼요" + 강조)
  - 7회+: 기본 노출 (건너뛰기는 가능하되 축소 표시)
- `ReflectionFlow` 관련 컴포넌트에서 `dialogueCount` 기반 UI 분기

---

## Phase P2-6: 정밀도 사다리 확장

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `question-precision.ts` | **존재**. `'quick' | 'standard' | 'detailed'` (5/10/20) |
| Application UC | `select-onboarding-mode.ts` | **존재**. 정밀도별 문항 구성 |
| UI | `PrecisionSelector.tsx` | **존재** |

### 구현 필요 사항

**Presentation Layer만 변경**:
- `PrecisionSelector.tsx` 변경:
  - 5문항 퀵 모드: "1분이면 충분해요" 강조 + 완료 후 업셀
  - 업셀 UX: 퀵 모드 완료 → "더 정확한 결과를 원하시면?" + 추가 문항 제안
  - 결과 화면에서도 "정밀도 높이기" CTA (P0-B1 추천 연동)

---

## Phase P2-7: Self-Affirmation 워밍업

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain VO | `self-affirmation.ts` | **존재** |
| Application UC | `submit-self-affirmation.ts` | **존재** |
| UI | 대화 시작 전 워밍업 화면 존재 |

### 구현 필요 사항

**Presentation Layer만 변경**:
- 마이크로카피 교체:
  - 기존: 일반적 설명
  - v4: "불편한 주제를 다루기 전에, 내가 중요하게 생각하는 걸 먼저 확인하면 대화가 훨씬 편해진대요(20초)."
- 20초 타이머 표시 (급하지 않은 느낌)
- 스킵 옵션 유지

---

## Phase P2-8: PWA 알림 시스템

### 현재 상태

전부 미구현.

### 구현 필요 사항

**Infrastructure Layer**:
- 신규: `public/manifest.json`
  ```json
  {
    "name": "PerspectiveShift",
    "short_name": "PS",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#1a1a2e",
    "icons": [...]
  }
  ```
- 신규: `public/sw.js` (Service Worker)
  - 오프라인 캐시: 앱 셸, 정적 자산
  - 푸시 알림 수신 핸들러
- `src/app/layout.tsx` 변경:
  - `<link rel="manifest" href="/manifest.json">`
  - SW 등록 스크립트

**Application Layer**:
- 신규: `src/application/use-cases/request-notification-permission.ts`
  - 권한 요청 조건: 첫 좋은 경험 이후 (대화 완료 + Feel Heard ≥ 3)
  - 지나치게 빠른 요청 방지

**Domain Layer**:
- 기존 `BuildNotificationUseCase`, `ManageNotificationPreferenceUseCase` 활용
- 알림 유형 확장: `D+1 복기`, `매칭 가능`, `페르소나 알림`, `주간 인사이트`

**Presentation Layer**:
- 신규: `src/app/_shared/components/InstallPrompt.tsx`
  - iOS: "홈화면에 추가" 안내
  - Android: 자동 install 프롬프트
- 신규: `src/app/(main)/settings/notifications/page.tsx`
  - 알림 유형별 토글
  - "7일 끄기" 버튼

### 이벤트
- `pwa_install_prompt_show` / `pwa_install_accept` / `notification_permission_{granted|denied}`

---

## Phase P2-9: 친구 시스템 고도화

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| Domain Entity | `friend-request.ts`, `friendship.ts` | **존재** |
| Application UC | `request-friendship.ts`, `respond-to-friend-request.ts` 등 | **존재** |
| Infrastructure | Supabase 리포지토리들 | **존재** |
| UI | `/friends`, `/friends/[id]`, `/chat/[friendshipId]` | **존재** |

### 구현 필요 사항

**Presentation Layer 중심**:
- 관계 에스컬레이션 흐름 UI:
  1. 구조화 대화 완료 + Feel Heard ≥ 4 → "친구 되기" CTA (기존)
  2. 친구 → 실시간 채팅 (기존)
  3. 실시간 → 오프라인 만남 제안 (기존 UI 개선)
- 에스컬레이션 진행 시각화:
  - 친구 프로필에 관계 단계 표시
  - 다음 단계 조건 안내

---

## Phase P2-10: 공동 요약 카드 애니메이션

### 현재 상태

| 레이어 | 파일 | 상태 |
|--------|------|------|
| UI | `JointSummaryCard` 관련 컴포넌트 | **존재**. 정적 카드 렌더링 |
| 의존성 | `framer-motion` | **설치됨** |

### 구현 필요 사항

**Presentation Layer만 변경**:
- `JointSummaryCard` 또는 `PeakEndFlow` 내:
  - 애니메이션 시퀀스:
    1. 나의 요약 카드 좌측에서 슬라이드 인
    2. 상대 요약 카드 우측에서 슬라이드 인
    3. 두 카드 중앙으로 이동 → 합쳐짐
    4. 파티클 이펙트 (confetti or sparkle)
    5. 합쳐진 공동 요약 카드 표시
  - `framer-motion` `AnimatePresence` + `motion.div` 활용
  - 피크 모먼트 연출 (Peak-End Rule)

---

## 의존성 그래프

```
P2-1 (JITAI Engine)    ← P3 LangGraph Agent (완료)
P2-2 (복구 고도화)      ← P1-7 RecoveryRoutinePanel (완료)
P2-3 (튜링 게임)       ← P0-A3 페르소나 시스템 (완료)
P2-4 (페르소나 메모리)  ← P0-A3 + P2-3 (튜링 게임 정보)
P2-5 (역할극 노출)     ← 독립
P2-6 (정밀도 확장)     ← P0-A2 (완료)
P2-7 (어퍼메이션)      ← 독립
P2-8 (PWA)            ← 독립 (가장 독립적)
P2-9 (친구 고도화)     ← 기존 친구 시스템 (완료)
P2-10 (요약 애니메이션) ← P0-D2 (완료)
```

**추천 실행 순서**: P2-7 → P2-5 → P2-10 → P2-6 → P2-2 → P2-1 → P2-3 → P2-4 → P2-9 → P2-8

(간단한 UI 변경부터 시작 → JITAI 핵심 → 신규 기능 → PWA 인프라)

---

## 공수 추정 (테스트 제외)

| Phase | 예상 | 난이도 |
|-------|------|--------|
| P2-1 JITAI Rule Engine | 10-15h | High (도메인 + 인프라 + Agent) |
| P2-2 복구 루틴 고도화 | 4-6h | Medium |
| P2-3 튜링 테스트 게임 | 6-8h | Medium (신규 전체) |
| P2-4 페르소나 저장 & 메모리 | 8-10h | High (LLM 컨텍스트 주입) |
| P2-5 R3 역할극 노출 | 2-3h | Low (UI 분기만) |
| P2-6 정밀도 확장 | 2-3h | Low (UI 변경) |
| P2-7 Self-Affirmation | 1-2h | Low (카피 변경) |
| P2-8 PWA 알림 | 10-15h | High (인프라 전체) |
| P2-9 친구 고도화 | 4-6h | Medium (UI 중심) |
| P2-10 요약 애니메이션 | 3-5h | Medium (framer-motion) |
| **합계** | **50-73h** | |

---

## Quality Gate (Per Phase)

모든 Phase 완료 시 확인:

- [ ] `pnpm build` 성공
- [ ] `pnpm lint` 통과
- [ ] 아키텍처 컴플라이언스 테스트 통과
- [ ] DI 컨테이너 300줄 이내
- [ ] 도메인 레이어에 외부 의존성 없음
- [ ] `hasValidKey` 분기 적용 (LLM 의존 기능)
- [ ] 이벤트 로깅 추가 (기획서 이벤트 목록 참조)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| JITAI 오작동 (잘못된 개입) | Medium | High | Rule별 점진 롤아웃 (10%→100%) |
| 튜링 게임 윤리 이슈 | Low | High | 투명성 우선 (ADR-V4-006) |
| PWA Service Worker 캐시 무효화 | Medium | Medium | 버전 기반 캐시 전략 |
| 페르소나 메모리 프롬프트 길이 초과 | Medium | Medium | 대화 요약 압축 + 토큰 제한 |
| framer-motion 번들 크기 | Low | Low | 이미 설치됨, tree-shaking 확인 |
