# PerspectiveShift v4.0 — 기능 추가/변경 명세

**Status**: 신규 피드백 반영
**Created**: 2026-02-20
**Base**: `ai-agent-features.md` + 사용자 피드백

---

## 핵심 변경 요약

### 기존 설계의 문제
```
❌ 기존: AI Agent와 실제 사람이 분리된 별도 트랙
   - "AI 대화 상대와 연습해보세요" ← 처음부터 AI임을 노출
   - PersonaSelector가 별도 UI로 존재
   - Cold Start 시에만 Agent 제안
```

### 변경된 설계 원칙
```
✅ 변경: AI Agent와 실제 사람이 동일한 매칭 풀에 혼합
   - "대화 상대를 찾았어요" ← AI/사람 구분 없는 동일 프레이밍
   - 하단에 조그맣게: "상대가 AI일 수 있어요. 맞추면 리워드!"
   - 매칭 카드 UI 완전 동일 (AI 여부 식별 불가)
   - 앵커 필터가 AI/사람 모두에게 동일 적용
```

---

## 목차

1. [변경 1: 통합 매칭 풀 (AI + 사람 혼합)](#변경-1-통합-매칭-풀)
2. [변경 2: 매칭 카드 — AI 비구분 UX](#변경-2-매칭-카드--ai-비구분-ux)
3. [변경 3: 앵커 매칭 + 다름 조절 통합 설계](#변경-3-앵커-매칭--다름-조절-통합-설계)
4. [변경 4: 튜링 게임 — 사전 고지 방식 전환](#변경-4-튜링-게임--사전-고지-방식-전환)
5. [변경 5: 대화 중 자연스러움 강화](#변경-5-대화-중-자연스러움-강화)
6. [영향받는 기존 기능 변경 목록](#영향받는-기존-기능-변경-목록)
7. [삭제/폐기 항목](#삭제폐기-항목)
8. [신규 ADR](#신규-adr)
9. [이벤트 변경](#이벤트-변경)
10. [전체 플로우 다이어그램](#전체-플로우-다이어그램)

---

## 변경 1: 통합 매칭 풀 (AI + 사람 혼합)

### 기존
- 매칭 풀 충분 → 사람 매칭
- 매칭 풀 부족 → `CheckMatchingPool` → `suggestPersona: true` → **별도 PersonaSelector UI** 노출
- AI와 사람이 완전히 분리된 트랙

### 변경
- AI 페르소나가 매칭 풀에 **상시 포함**
- 사람과 AI가 동일한 스코어링 공식으로 경쟁
- 사용자는 매칭 결과에서 AI/사람을 구분할 수 없음

### Domain Layer 변경

**변경**: `MatchCandidate` 엔티티
```typescript
export class MatchCandidate {
  constructor(
    // 기존 필드 유지
    public readonly id: string,
    public readonly stanceVector: StanceVector,
    public readonly energyLevel: EnergyLevel,
    // ...

    // 신규: 후보 유형 (내부용, UI에 노출하지 않음)
    public readonly candidateType: 'human' | 'agent',

    // 신규: Agent인 경우 페르소나 참조
    public readonly personaId?: string,
  ) {}
}
```

**변경**: `MatchScore` VO — AI 혼합 가중치 추가
```typescript
// 매칭 풀 상태에 따른 Agent 우선도 동적 조정
match_score = w1 × distance_fit
            + w2 × readiness_score
            + w3 × topic_relevance
            + w4 × energy_compat
            + w5 × anchor_similarity
            - penalty_recent_decline
            + pool_scarcity_bonus  // 풀 부족 시 Agent에게 가산점
```

- `pool_scarcity_bonus`: 매칭 풀 내 사람 후보가 적을수록 Agent 후보의 점수에 가산
  - 사람 후보 0명 → bonus = 0.3
  - 사람 후보 1~2명 → bonus = 0.1
  - 사람 후보 3명+ → bonus = 0.0

### Application Layer 변경

**변경**: `FindMatchCandidates` UC
```
기존: 사람 후보 검색 → 부족하면 suggestPersona 플래그
변경: 사람 후보 + Agent 후보를 하나의 풀에서 통합 스코어링 → 상위 N개 반환
```

- Agent 후보 생성 로직:
  1. 등록된 페르소나 프로필 로드
  2. 각 페르소나를 `MatchCandidate`로 변환 (candidateType: 'agent')
  3. 사람 후보와 동일한 스코어링 공식 적용
  4. 통합 정렬 후 상위 후보 반환

**폐기**: `CheckMatchingPool` UC의 `suggestPersona` 분기
- 더 이상 "AI 제안" 별도 분기 불필요
- UC 자체는 유지하되, 반환값에서 `suggestPersona` 제거

### Infrastructure Layer 변경

**변경**: 매칭 쿼리
- 기존: `SELECT FROM users WHERE ...`
- 변경: `SELECT FROM users WHERE ... UNION SELECT FROM personas WHERE ...`
- 통합 후보 풀에서 동일 스코어링

---

## 변경 2: 매칭 카드 — AI 비구분 UX

### 기존
```
┌─────────────────────────────┐
│  🤖 AI 대화 상대와 연습해보세요  │  ← AI 노출
│  실제 사람과 비슷한 대화를       │
│  미리 경험할 수 있어요          │
│                               │
│  [페르소나 A] [페르소나 B] [C]  │  ← 별도 선택 UI
└─────────────────────────────┘
```

### 변경
```
┌─────────────────────────────────────┐
│  📌 주제: 최저임금 인상              │
│  거리: ●●●○○ 적당한 차이           │
│  난이도: Level 1                    │
│  예상 시간: 10분                    │
│  ──────────────────────────────    │
│  👤 대화 상대 미리보기               │  ← "대화 상대" 통일
│  "이 분은 경제 효율을 중시하지만,    │
│   사회 안전망도 필요하다고 봐요."    │
│  ──────────────────────────────    │
│         [ 대화 시작 ]               │
│                                     │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │
│  🎯 상대가 AI일 수 있어요.          │  ← 하단, 작은 폰트
│     대화 후 맞추면 리워드!          │
└─────────────────────────────────────┘
```

### 핵심 UX 규칙

| 규칙 | 설명 |
|------|------|
| **동일 카드 구조** | AI든 사람이든 매칭 카드 레이아웃/정보량 완전 동일 |
| **"대화 상대"로 통일** | "AI 연습", "봇", "에이전트" 단어 매칭 카드에 사용 금지 |
| **Trailer 동일 포맷** | AI 페르소나의 Trailer도 사람과 동일한 LLM 생성 포맷 |
| **하단 고지문** | 작은 폰트 + 회색 톤으로 "상대가 AI일 수 있어요. 대화 후 맞추면 리워드!" |
| **프로필 정보 동일** | 연령대, 직군 등 표시 방식 사람/AI 구분 불가 |

### Presentation Layer 변경

**폐기**: `PersonaSelector.tsx` — 별도 페르소나 선택 UI 삭제

**변경**: `IntegratedMatchCard.tsx`
```typescript
// 기존: candidateType에 따라 다른 UI
// 변경: candidateType 무관하게 동일 UI

interface IntegratedMatchCardProps {
  topic: string;
  distance: DistanceBand;
  difficulty: number;
  timeBudget: number;
  trailer: ConversationTrailer;
  energy: EnergyLevel;
  declineBadge?: AdjustmentBadge;
  // candidateType은 props에 포함하지 않음 (UI에서 구분 불가)
}
```

**신규**: `AiDisclaimerBanner.tsx`
```typescript
// 매칭 카드 하단 고지 배너
// - 작은 폰트 (12px), 회색 (#999)
// - 아이콘: 🎯 또는 작은 info 아이콘
// - 텍스트: "상대가 AI일 수 있어요. 대화 후 맞추면 리워드!"
// - 탭 시 리워드 상세 바텀시트 (옵션)

export const AiDisclaimerBanner: React.FC = () => (
  <div className="disclaimer-banner">
    <span className="icon">🎯</span>
    <span className="text">
      상대가 AI일 수 있어요. 대화 후 맞추면 리워드!
    </span>
  </div>
);
```

**변경**: `MatchingPage.tsx`
- 매칭 결과 표시 시 `candidateType` 기반 분기 로직 제거
- 모든 후보에 동일한 `IntegratedMatchCard` 렌더링
- 하단에 `AiDisclaimerBanner` 상시 표시

---

## 변경 3: 앵커 매칭 + 다름 조절 통합 설계

### 개요
"같은 X, 다른 Y" 필터가 AI/사람 통합 풀에 동일하게 적용

### 사용자 플로우
```
1. 에너지 선택 (🔋높음 / 🔋보통 / 🔋낮음)
       │
       ▼
2. 앵커 선택 (선택사항)
   ┌─────────────────────────────────────┐
   │  🔗 공통점 선택 (복수 가능)          │
   │                                     │
   │  [ 같은 성별 ] [ 같은 연령대 ]       │
   │  [ 같은 직업군 ] [ 같은 지역 ]       │
   │                                     │
   │  📏 생각 차이 정도                   │
   │  살짝 다른 ──●────── 완전 다른       │
   │                                     │
   │  💡 미리보기:                        │
   │  "같은 30대인데, 최저임금에 대해      │
   │   적당히 다른 생각을 가진 상대"       │
   └─────────────────────────────────────┘
       │
       ▼
3. 매칭 결과 (AI + 사람 혼합, 구분 불가)
   ┌─────────────────────────────────────┐
   │  📌 주제: 최저임금 인상              │
   │  공통점: 같은 30대                   │
   │  거리: ●●●○○ 적당한 차이           │
   │  ...                               │
   │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │
   │  🎯 상대가 AI일 수 있어요.          │
   │     대화 후 맞추면 리워드!          │
   └─────────────────────────────────────┘
```

### Domain Layer

**기존 유지**: `AnchorType`, `AnchorAttribute` VO

**신규 VO**: `DifferenceLevel`
```typescript
export class DifferenceLevel {
  // 0.0 ~ 1.0 (0: 거의 같음, 1: 완전 다름)
  constructor(public readonly value: number) {
    if (value < 0 || value > 1) throw new Error('DifferenceLevel must be 0-1');
  }

  toDistanceRange(): [number, number] {
    // 슬라이더 값 → cosine distance 범위 매핑
    const center = this.value * 0.8; // max distance 0.8
    const spread = 0.1;
    return [
      Math.max(0, center - spread),
      Math.min(1, center + spread),
    ];
  }

  toLabel(): string {
    if (this.value < 0.3) return '살짝 다른';
    if (this.value < 0.6) return '적당히 다른';
    return '완전 다른';
  }
}
```

**변경**: `PersonaProfile` — 앵커 매핑 메서드 추가
```typescript
export class PersonaProfile {
  // 기존 필드 유지

  toAnchorAttributes(): AnchorAttribute[] {
    return [
      new AnchorAttribute('age_group', this.ageGroup),
      new AnchorAttribute('job_category', this.jobCategory),
      // gender, region은 페르소나 프로필 확장 시 추가
    ];
  }
}
```

### Application Layer

**변경**: `ApplyAnchorFilter` UC
```
입력:
  - userId
  - anchors: AnchorAttribute[]     // 사용자가 선택한 공통점
  - differenceLevel: DifferenceLevel // 다름의 정도 슬라이더 값
  - energyLevel: EnergyLevel
  - topic: string

처리:
  1. 사람 후보 + Agent 후보 통합 로드
  2. 앵커 속성 일치 필터링 (AI 페르소나 포함)
  3. stance distance가 differenceLevel 범위 내인 후보 필터링
  4. 에너지 레벨로 다름 슬라이더 상한 제한
     - 🔋낮음 → max differenceLevel = 0.4
     - 🔋보통 → max differenceLevel = 0.7
     - 🔋높음 → max differenceLevel = 1.0
  5. 통합 스코어링 → 상위 후보 반환

출력:
  - MatchCandidate[] (candidateType 혼합, UI에는 미노출)
```

### Presentation Layer

**변경**: `AnchorFilterPanel.tsx`
- 공통점 멀티 선택 (칩 버튼)
- 다름 정도 슬라이더 (연속형, 0~1)
- 실시간 미리보기 텍스트: "같은 [X]인데, [주제]에 대해 [정도] 다른 생각을 가진 상대"
- 에너지에 따라 슬라이더 상한 시각적 제한

---

## 변경 4: 튜링 게임 — 사전 고지 방식 전환

### 기존 (P2-3 원안)
- 대화 **종료 후** "사람이었을까요, AI였을까요?" 게임
- 피크-엔드 플로우 Step 5에 배치

### 변경
- 매칭 카드 하단에 **사전 고지**: "상대가 AI일 수 있어요. 대화 후 맞추면 리워드!"
- 대화 중에는 힌트 없음 (자연스러운 대화 유지)
- 대화 종료 후 피크-엔드 플로우에서 추측 UI 노출

### 고지 타이밍 & 톤

| 시점 | 위치 | 톤 | 문구 |
|------|------|-----|------|
| 매칭 카드 | 카드 하단 | 가볍고 게임적 | "🎯 상대가 AI일 수 있어요. 대화 후 맞추면 리워드!" |
| 대화 진입 | 없음 | — | 어떤 힌트도 노출하지 않음 |
| 대화 중 | 없음 | — | AI 관련 UI 요소 일체 없음 |
| 피크-엔드 | Step 5 (KPI 다음) | 흥미 유발 | "방금 대화한 상대는 사람이었을까요?" |

### 금지 문구 목록
다음 문구/패턴은 매칭~대화 전 과정에서 사용 금지:

- ❌ "AI 대화 상대와 연습해보세요"
- ❌ "실제 사람과 비슷한 대화를 미리 경험할 수 있어요"
- ❌ "봇과 대화하기"
- ❌ "AI 에이전트"
- ❌ "연습 모드"
- ❌ "페르소나 선택" (사용자 대면 UI에서)
- ❌ 매칭 카드에 🤖 아이콘 사용

### 리워드 체계 변경

**기존** (P2-3):
| 조건 | 리워드 |
|------|--------|
| 정답 | Passport에 "관찰자 뱃지" +1 |
| 3연속 정답 | "날카로운 관찰자" 칭호 |

**변경** — 사전 고지에서 리워드를 언급했으므로, 오답에도 긍정 피드백:
| 조건 | 리워드 | 메시지 |
|------|--------|--------|
| AI를 AI로 맞춤 | 뱃지 +1 | "정확해요! 관찰력이 날카로워요 👀" |
| 사람을 사람으로 맞춤 | 뱃지 +1 | "맞아요! 좋은 대화였죠 🎉" |
| 3연속 정답 | 칭호 획득 | "날카로운 관찰자" |
| AI를 사람으로 오인 | 경험치 +0.5 | "그만큼 자연스러운 관점이었어요 😊" |
| 사람을 AI로 오인 | 경험치 +0.5 | "그만큼 독특한 시각이었네요 🤔" |

---

## 변경 5: 대화 중 자연스러움 강화

### 목표
통합 매칭에서 AI가 섞이므로, Agent 대화의 자연스러움이 더욱 중요

### 기존 대비 강화 항목

#### 5-1. 타이핑 인디케이터 통일
```
기존: Agent 대화 시에만 타이핑 인디케이터 표시
변경: 사람 대화에서도 "상대가 작성 중..." 표시 (실제 작성 중일 때)
      → AI/사람 모두 동일한 인디케이터 = 구분 불가
```

#### 5-2. 응답 시간 분포 자연화
```
기존: PersonaResponseDelay = baseDelay + perCharDelay + jitter
변경: 실제 사용자 응답 시간 분포를 학습하여 Agent 딜레이에 적용
      - 초기(데이터 부족): 기존 공식 유지
      - 데이터 축적 후: 실제 분포에서 샘플링
```

**변경**: `PersonaResponseDelay` VO
```typescript
export class PersonaResponseDelay {
  // Phase 1: 규칙 기반 (기존)
  static calculateRule(responseLength: number): number {
    const baseDelay = 3;
    const perCharDelay = 0.05;
    const jitter = Math.random() * 3 - 1;
    return baseDelay + (responseLength * perCharDelay) + jitter;
  }

  // Phase 2: 실제 분포 기반 (데이터 축적 후)
  static calculateFromDistribution(
    responseLength: number,
    humanResponseStats: { mean: number; stdDev: number },
  ): number {
    // 정규분포에서 샘플링 (Box-Muller)
    const u1 = Math.random();
    const u2 = Math.random();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const delay = humanResponseStats.mean + normal * humanResponseStats.stdDev;
    return Math.max(2, Math.min(30, delay)); // 2~30초 클램핑
  }
}
```

#### 5-3. 대화 스텝 전환 동일화
```
기존: Agent는 사용자 완료 즉시 응답 (딜레이만 적용)
변경: Agent도 사람과 동일한 "상대 차례" 상태를 거침
      → "상대가 작성 중..." → 딜레이 → 응답 표시
      → 사람 대화와 동일한 UX 흐름
```

#### 5-4. LLM 프롬프트 강화
System prompt에 추가:
```
추가 규칙:
- 가끔 오타를 내라 (10% 확률).
- 이전 답변을 가끔 수정/보완하라 ("아 아까 말한 건 좀 다시 생각해보면...").
- 모든 질문에 완벽하게 답하지 마라. "음... 잘 모르겠는데" 허용.
- 가끔 주제에서 살짝 벗어나라 (경험담으로 새기).
- 응답 길이를 불규칙하게 하라 (1문장 ~ 3문장 랜덤).
```

---

## 영향받는 기존 기능 변경 목록

| 기존 기능 | 변경 내용 | 영향도 |
|----------|----------|--------|
| **P0-A3 PersonaSelector UI** | 별도 선택 UI → **폐기**. 페르소나가 매칭 풀에 자동 포함 | 🔴 Major |
| **P0-A3 CheckMatchingPool UC** | `suggestPersona` 분기 제거. 통합 풀 스코어링으로 대체 | 🟡 Medium |
| **P0-B3 FindMatchCandidates UC** | 사람만 검색 → 사람+Agent 통합 검색 | 🔴 Major |
| **P0-B5 IntegratedMatchCard** | candidateType 분기 UI 제거. 동일 카드 렌더링 | 🟡 Medium |
| **P0-D3 피크-엔드 CTA** | Agent 전용 CTA 분기 제거. 통합 CTA 로직 | 🟡 Medium |
| **P2-3 튜링 게임** | 대화 후 게임 유지 + 매칭 카드 사전 고지 추가 | 🟢 Minor |
| **대화 페이지** | Agent 전용 UI 요소 일체 제거 | 🟡 Medium |

### 피크-엔드 CTA 변경

기존:
| 조건 | CTA |
|------|-----|
| Agent 대화 완료 + 매칭 풀 있음 | "실제 사람과 대화하기" |
| Agent 대화 + 매칭 풀 부족 | "알림 받기 + 다른 페르소나" |

변경:
| 조건 | CTA |
|------|-----|
| 대화 완료 (AI/사람 무관) | "다음 대화 찾기" |
| Feel Heard ≥4 | "친구 되기" (사람인 경우만 내부 분기) |
| 에너지 낮음 | "오늘은 여기까지" |

- "실제 사람과 대화하기" 문구 삭제 (AI였음을 암시하므로)
- "다른 페르소나" 문구 삭제 (페르소나 개념 미노출)
- "친구 되기"는 상대가 사람인 경우에만 서버에서 활성화 (UI에서는 "왜 안 되지?" 없이 자연스럽게 미노출)

---

## 삭제/폐기 항목

| 항목 | 이유 |
|------|------|
| `PersonaSelector.tsx` | AI를 별도로 선택하는 UI 불필요 |
| `CheckMatchingPool.suggestPersona` | 통합 풀에서 자동 처리 |
| `persona_select_{id}` 이벤트 | 사용자가 직접 페르소나를 선택하지 않음 |
| `persona_dialogue_start` 이벤트 | AI 대화 시작을 별도 추적하지 않음 (내부 로그만 유지) |
| 매칭 카드 내 "AI 연습" 관련 모든 카피 | UX 원칙 위반 |
| `FinalCTAType.HUMAN_MATCH_AVAILABLE` | AI였음을 암시하는 CTA |
| `FinalCTAType.PERSONA_SWITCH` | 페르소나 개념 미노출 |

---

## 신규 ADR

### ADR-V4-007: AI/사람 통합 매칭 풀

**결정**: AI Agent와 실제 사람을 동일한 매칭 풀에 혼합하여 구분 없이 매칭
**근거**:
- AI를 미리 알려주면 대화 태도가 변함 (성의 없는 응답, 테스트 행동)
- 통합 풀이 Cold Start 문제를 자연스럽게 해결
- 튜링 게임의 재미가 극대화됨 (진짜 모르니까 맞추는 재미)
**트레이드오프**:
- Agent 자연스러움 품질 기준이 훨씬 높아야 함
- AI 비율 관리 필요 (사람 후보가 많아지면 AI 비율 자동 감소)
- "친구 되기" 등 사람 전용 기능의 내부 분기 복잡도 증가

### ADR-V4-008: 사전 고지 + 게임화로 투명성 확보

**결정**: "AI일 수 있다"는 사전 고지를 하되, 게임 요소로 포장하여 자연스러운 대화 유도
**근거**:
- 완전 비공개 → 윤리적 문제 + 발각 시 신뢰 붕괴
- 완전 공개 → 대화 품질 저하
- "일 수 있다" + 리워드 → 투명성과 몰입의 균형
**트레이드오프**: 일부 사용자가 모든 상대를 의심하며 대화할 수 있음 → 리워드와 게임 톤으로 완화

---

## 이벤트 변경

### 삭제 이벤트
| 이벤트 | 삭제 이유 |
|--------|----------|
| `persona_select_{id}` | 사용자 직접 선택 없음 |
| `persona_dialogue_start` | 사용자 대면 이벤트 아님 |

### 변경 이벤트
| 이벤트 | 변경 내용 |
|--------|----------|
| `match_accept` | 페이로드에 `candidateType` 추가 (내부 분석용, UI 미노출) |
| `match_decline` | 동일 |

### 신규 이벤트
| 이벤트 | 트리거 | 페이로드 |
|--------|--------|---------|
| `ai_disclaimer_view` | 고지 배너 뷰포트 진입 | `{ timestamp }` |
| `ai_disclaimer_tap` | 고지 배너 탭 (리워드 상세) | `{ timestamp }` |
| `turing_guess_submit` | 튜링 추측 제출 | `{ guess, actual, isCorrect, candidateType }` |
| `turing_reward_shown` | 리워드 메시지 표시 | `{ rewardType, message }` |
| `anchor_filter_set` | 앵커 필터 설정 완료 | `{ anchors[], differenceLevel }` |
| `anchor_preview_render` | 미리보기 텍스트 렌더링 | `{ previewText }` |

### 내부 전용 이벤트 (사용자 미노출, 분석용)
| 이벤트 | 트리거 | 용도 |
|--------|--------|------|
| `_agent_matched` | Agent가 매칭됨 | AI 비율 모니터링 |
| `_agent_response_generated` | Agent 응답 생성 | 응답 품질 추적 |
| `_agent_misidentified_as_human` | AI를 사람으로 오인 | 자연스러움 KPI |
| `_human_misidentified_as_agent` | 사람을 AI로 오인 | 대화 품질 추적 |

---

## 전체 플로우 다이어그램

```
[에너지 선택]
     │
     ▼
[앵커 필터 선택] (선택사항)
  - 공통점: 같은 성별/연령대/직업군
  - 다름 정도: 슬라이더 0~1
     │
     ▼
[통합 매칭 엔진]
  - 사람 후보 + Agent 후보 통합 스코어링
  - 앵커 필터 + 에너지 + 다름 정도 적용
  - pool_scarcity_bonus로 AI 비율 자동 조정
     │
     ▼
[매칭 카드 표시] ──── AI/사람 구분 불가
  - 주제, 거리, 난이도, 시간, Trailer
  - 하단: "🎯 상대가 AI일 수 있어요. 맞추면 리워드!"
     │
     ▼
[대화 진행] ──── AI/사람 동일 UX
  - 타이핑 인디케이터 통일
  - Agent: 자연 딜레이 + 오타 + 불완전 표현
  - 탭 하이라이트, 톤 체크 동일 적용
     │
     ▼
[리플렉션]
     │
     ▼
[피크-엔드 플로우]
  1. 공동 요약 카드
  2. 선물 한 문장
  3. Blind Spot Discovery
  4. KPI 수집
  5. 🎯 튜링 게임: "방금 상대는 사람이었을까요?"
     → 추측 제출 → 리워드 메시지
  6. 다음 질문 저장
  7. 최종 CTA (AI/사람 구분 없는 통합 CTA)
     │
     ▼
[사후]
  - 페르소나 저장 & 메모리 (P2-4, 내부 처리)
  - D+1 복기
  - Passport 업데이트
```

---

## Appendix: Guardrail 추가/변경

| Guardrail | 임계값 | 위반 시 |
|-----------|--------|--------|
| AI 매칭 비율 | 사람 3명+ 시 AI <30% | pool_scarcity_bonus 하향 |
| AI 오인율 (사람으로 착각) | >40% 유지 | 프롬프트/딜레이 품질 충분 |
| AI 오인율 (사람으로 착각) | <20% 하락 시 | 긴급 프롬프트 리뷰 |
| "속은 느낌" 불만 | <2% | 고지 문구 강화 |
| 모든 상대 의심 행동 | 대화 중 "너 AI지?" 빈도 >10% | 고지 문구 톤 조정 |
| 앵커 필터 사용률 | 추적 | 낮으면 UI 노출 방식 개선 |
| 다름 슬라이더 분포 | 추적 | 극단값 편중 시 기본값 조정 |