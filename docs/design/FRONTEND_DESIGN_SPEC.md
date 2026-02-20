# PerspectiveShift Frontend Design Specification v1.0

**Status**: Active
**Created**: 2026-02-19
**Last Updated**: 2026-02-19
**Language**: 한국어 (Korean-first, English labels for dev)

---

## 목차

1. [디자인 철학](#1-디자인-철학)
2. [디자인 토큰 (Foundations)](#2-디자인-토큰-foundations)
3. [핵심 컴포넌트 라이브러리](#3-핵심-컴포넌트-라이브러리)
4. [화면 템플릿](#4-화면-템플릿)
5. [화면별 상세 스펙](#5-화면별-상세-스펙)
6. [인터랙션 패턴](#6-인터랙션-패턴)
7. [접근성 (A11y)](#7-접근성-a11y)
8. [구현 체크리스트](#8-구현-체크리스트)

---

## 1. 디자인 철학

### 1.1 핵심 원칙: "Intellectual Serenity"

PerspectiveShift는 시민 대화 플랫폼이다. 정치적 스펙트럼이 아니라 **편집·설계·기록**의 느낌으로,
사용자가 자신의 생각을 차분하게 정리하고 상대와 구조화된 대화를 나누는 공간이다.

| 원칙 | 설명 | 금지 사항 |
|------|------|----------|
| **Paper, not Screen** | 종이 위에 쓰는 느낌. grain 텍스처, 따뜻한 배경 | 순수 white(#FFF) 배경 금지 |
| **One CTA per Screen** | 화면당 Primary 버튼 1개만 | 복수 CTA 경쟁 금지 |
| **Jewel = 특별한 순간** | 글래스모피즘은 제한된 곳만 | Jewel Surface 남발 금지 |
| **Blueprint, not Spectrum** | 생각 지도는 설계도/편집 느낌 | 좌-우 정치 스펙트럼 시각화 금지 |
| **Marker, not Highlighter** | 형광펜 아닌 종이 마커 느낌 | 공격적 neon 형광 금지 |
| **Read, not Scroll** | 에디토리얼 리듬, 넉넉한 여백 | 정보 과밀 레이아웃 금지 |

### 1.2 톤 & 무드

```
차분함(Calm) ──────────────── 활력(Energy)
    ◆━━━━━━━●━━━━━━━━━━━━━━◆
          여기가 우리 위치
          (calm-leaning neutral)
```

- **배경**: 따뜻한 Paper(#FAFAF9) + 미세한 grain noise
- **텍스트**: Deep Indigo(#2C3E50) — 검정이 아닌 깊은 남색
- **억양**: Teal(유사), Orange(차이) — 의미를 전달하는 색
- **상태**: Yellow Marker — 행동/선택 상태 표현

### 1.3 디자인 레퍼런스 매핑

| 레퍼런스 | 적용 화면 | 핵심 차용 |
|---------|----------|----------|
| **Ref A** (Editorial Hero) | 온보딩, Trust Moment, 설명 화면 | Section Label + Serif H1 + 단일 CTA |
| **Ref B** (Thought Map) | 생각 지도, 주간 인사이트 | Blueprint 그리드 + 프리즘 시각화 + 비네트 |
| **Ref C** (Conversation Editor) | 대화 턴, 하이라이트, 톤 제안 | Paper Marker + Minimal Composer |

---

## 2. 디자인 토큰 (Foundations)

### 2.1 Color Tokens

```css
/* === globals.css에 추가 === */
@theme {
  /* ── Base ── */
  --color-indigo-depth: #2C3E50;
  --color-slate-soft: #64748B;
  --color-paper: #FAFAF9;
  --color-paper-warm: #F5F3EF;

  /* ── Surface ── */
  --color-surface-card: rgba(255, 255, 252, 1);
  --color-surface-jewel: rgba(255, 255, 255, 0.72);
  --color-surface-elevated: rgba(255, 255, 252, 0.95);

  /* ── Border ── */
  --color-border-soft: rgba(44, 62, 80, 0.10);
  --color-border-divider: rgba(44, 62, 80, 0.08);
  --color-border-focus: rgba(44, 62, 80, 0.18);

  /* ── Text ── */
  --color-text-primary: #2C3E50;
  --color-text-secondary: #64748B;
  --color-text-tertiary: rgba(44, 62, 80, 0.55);
  --color-text-inverse: #FFFFFF;

  /* ── Energy States (매칭 카드) ── */
  --color-energy-rest-base: #E2E8F0;
  --color-energy-rest-accent: #94A3B8;
  --color-energy-steady-base: #DBEAFE;
  --color-energy-steady-accent: #60A5FA;
  --color-energy-active-base: #E0F2FE;
  --color-energy-active-accent: #0EA5E9;

  /* ── Semantic (의미색: 유사/차이) ── */
  --color-semantic-similarity: #14B8A6;   /* Teal */
  --color-semantic-difference: #F97316;   /* Orange */
  --color-semantic-similarity-soft: rgba(20, 184, 166, 0.12);
  --color-semantic-difference-soft: rgba(249, 115, 22, 0.12);

  /* ── Marker (행동 상태: 선택/편집) ── */
  --color-marker-paper: rgba(246, 240, 171, 0.75);
  --color-marker-paper-soft: rgba(246, 240, 171, 0.45);

  /* ── Status ── */
  --color-status-safety: #22C55E;
  --color-status-autonomy: #3B82F6;
  --color-status-curiosity: #A855F7;
  --color-status-competence: #F59E0B;

  /* ── CTA ── */
  --color-cta-primary: #2C3E50;
  --color-cta-primary-hover: #1A2A3A;
  --color-cta-disabled: #CBD5E1;
}
```

**색상 사용 규칙 (엄격)**:

| 색상 | 용도 | 금지 |
|------|------|------|
| Teal/Orange | "유사/차이" 의미 전달 (점, 라인, 라벨) | 마커로 쓰지 않음 |
| Marker Yellow | "선택됨/편집 중" 행동 상태 | 의미 전달에 쓰지 않음 |
| Indigo Depth | 본문 텍스트, CTA 배경 | 배경색으로 쓰지 않음 |
| Slate Soft | 메타/설명 텍스트만 | 본문에 쓰지 않음 (대비 부족) |

### 2.2 Spacing Tokens (4pt Grid)

```css
@theme {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --container-x: 16px;        /* 좌우 기본 패딩 */
  --container-x-wide: 24px;   /* 넓은 컨테이너 */
  --cta-bar-h: 64px;          /* 하단 CTA 바 높이 */
  --tab-bar-h: 56px;          /* 하단 탭 바 높이 */
  --app-bar-h: 56px;          /* 상단 앱 바 높이 */
}
```

**세로 리듬 규칙**:

| 요소 간 | 간격 |
|---------|------|
| H2 아래 | 16px |
| 타이틀 → 본문 | 8px |
| 문단 간 | 12px |
| CTA 위 | 16~24px |
| 카드 간 gap | 12~16px |
| 카드 내 padding | 16px 또는 24px만 (다른 값 금지) |

### 2.3 Radius & Shadow Tokens

```css
@theme {
  --radius-card: 16px;
  --radius-sheet: 24px;
  --radius-pill: 9999px;
  --radius-input: 12px;
  --radius-chip: 8px;

  --shadow-paper: 0 1px 2px rgba(44, 62, 80, 0.06);
  --shadow-card: 0 2px 8px rgba(44, 62, 80, 0.06);
  --shadow-elevated: 0 4px 16px rgba(44, 62, 80, 0.08);
  --shadow-jewel: 0 12px 30px rgba(44, 62, 80, 0.10),
                  0 1px 0 rgba(255, 255, 255, 0.35) inset;
  --shadow-cta: 0 2px 8px rgba(44, 62, 80, 0.12),
                0 1px 2px rgba(44, 62, 80, 0.06);
}
```

### 2.4 Typography Tokens

```css
@theme {
  --font-heading: "Playfair Display", "Merriweather", "Noto Serif KR", serif;
  --font-body: "Pretendard", "Geist Sans", system-ui, sans-serif;
  --font-num: "Geist Sans", "Pretendard", system-ui, sans-serif;
}
```

**타이포그래피 스케일**:

| 이름 | 크기 | 행간 | 무게 | 폰트 | 용도 |
|-----|------|------|------|------|------|
| **hero** | 32px | 1.2 | 700 | heading | H1 히어로 타이틀 |
| **title-lg** | 24px | 1.3 | 600 | heading | 섹션 타이틀 |
| **title** | 20px | 1.4 | 600 | body | 카드/페이지 타이틀 |
| **subtitle** | 18px | 1.4 | 500 | body | 서브 타이틀 |
| **body** | 16px | 1.6 | 400 | body | 본문 텍스트 |
| **body-sm** | 14px | 1.5 | 400 | body | 보조 텍스트 |
| **caption** | 12px | 1.4 | 500 | body | 라벨, 캡션 |
| **overline** | 11px | 1.3 | 600 | body | Section Label (uppercase-like) |
| **num** | 가변 | — | 500 | num | 숫자 (tabular-nums) |

**한글 주의사항**:
- 한글은 영문보다 시각적으로 크므로 hero/title에서 Serif(Noto Serif KR) 사용 시 letter-spacing: -0.02em
- 본문은 반드시 Sans-serif(Pretendard) — Serif 본문은 한글 가독성 저하
- line-height 1.6 이상 유지 (한글 자간 특성)

### 2.5 Motion Presets

```typescript
// src/app/_shared/motion.ts

/** Sheet, 카드 모프, 레이아웃 변화 */
export const springSoft = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

/** 버튼 프레스, 토글, 빠른 피드백 */
export const springSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.7,
};

/** 숫자 카운트, 프로그레스 바 */
export const springGentle = {
  type: "spring" as const,
  stiffness: 180,
  damping: 24,
  mass: 1.0,
};

/** Reduce Motion 대응 */
export const reducedMotion = {
  floating: false,               // floating 애니메이션 끄기
  sheet: { opacity: 1, y: 0 },  // fade + 짧은 slide만
  number: "instant",             // 숫자 트랜지션 즉시 교체
};
```

---

## 3. 핵심 컴포넌트 라이브러리

### 3.0 컴포넌트 목록 총괄

| # | 컴포넌트 | 유형 | 사용처 |
|---|---------|------|--------|
| 3.1 | AppBackground | Layout | 전역 |
| 3.2 | TopAppBar | Navigation | 전역 |
| 3.3 | BottomTabBar | Navigation | (main) |
| 3.4 | SectionLabel + HeroTitle | Typography | Template A/B |
| 3.5 | PrimaryButton | Action | 전역 CTA |
| 3.6 | SecondaryButton | Action | 보조 액션 |
| 3.7 | PaperCard | Surface | 전역 카드 |
| 3.8 | JewelSurface | Surface | 제한된 특별 순간 |
| 3.9 | ThoughtMapFrame | Visualization | 생각 지도 |
| 3.10 | MarkerHighlight | Inline | 대화 텍스트 선택 |
| 3.11 | MinimalComposer | Input | 대화 입력 |
| 3.12 | StepProgressBar | Progress | 대화 FSM |
| 3.13 | EnergyIndicator | Status | 매칭 |
| 3.14 | MatchCard | Card | 매칭 후보 |
| 3.15 | TurnBubble | Chat | 대화 턴 |
| 3.16 | CoachSheet | Sheet | AI 코치 |
| 3.17 | MicrocopyBanner | Feedback | 톤 안내 |
| 3.18 | ChipSelector | Input | 선택지 |
| 3.19 | SliderInput | Input | 감정 척도 |
| 3.20 | DialogBadge | Status | 상태 뱃지 |

---

### 3.1 AppBackground

**역할**: 전체 앱의 Paper 배경 + grain 텍스처 + (선택) 비네트

```
Variants:
├── paper (기본)         → --color-paper + noise(3~5%)
├── paperWarm            → --color-paper-warm + noise(3~5%)
└── paperVignette (제한) → paper + radial-gradient 비네트
```

```tsx
// 구현 구조
<div className="min-h-screen bg-[var(--color-paper)] relative">
  {/* Grain Noise Overlay */}
  <div className="pointer-events-none fixed inset-0 opacity-[0.04]
                  bg-[url('/textures/noise.svg')] bg-repeat" />

  {/* Vignette (paperVignette variant only) */}
  {variant === 'paperVignette' && (
    <div className="pointer-events-none fixed inset-0
                    bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(44,62,80,0.12)_100%)]" />
  )}

  {children}
</div>
```

**비네트 허용 구간 (엄격)**:
- ThoughtMap 히어로 화면
- Peak-End 선물/발견 카드
- 그 외 사용 금지

---

### 3.2 TopAppBar

**Anatomy**: `[Left: Wordmark/Back] ──── [Center: Title?] ──── [Right: IconButton]`

```
Size:
├── height: 56px (safe-area 별도)
├── IconButton hit area: 44×44px
└── padding-x: 16px

Typography:
├── Wordmark: 18px, Serif(heading), text-primary
├── Title: 16px, Sans(body), font-semibold, text-primary
└── Icon: 24px line icon, stroke 1.75px

Variants:
├── wordmark   → "PerspectiveShift" 로고 텍스트 (Serif)
├── title      → 가운데 제목 + 좌측 뒤로가기
├── minimal    → 좌측 뒤로가기만
└── immersive  → 투명 배경, 닫기(X) 아이콘
```

```
┌─────────────────────────────────────────────┐
│  ← 뒤로     대화 진행 중        ⋮ (메뉴)    │  ← title variant
│  PerspectiveShift               ☰ (메뉴)    │  ← wordmark variant
│  ←                              ✕ (닫기)    │  ← immersive variant
└─────────────────────────────────────────────┘
```

---

### 3.3 BottomTabBar

**Anatomy**: 4개 탭, 아이콘 + 라벨

```
┌─────────────────────────────────────────────┐
│   🧭          💬          👥          ⋯     │
│  매칭        대화        친구        더보기   │
└─────────────────────────────────────────────┘
```

```
Size:
├── height: 56px + safe-area-bottom
├── icon: 24px
├── label: 11px, caption
└── active indicator: 2px top border, color-indigo-depth

States:
├── default: text-tertiary, icon opacity 0.5
├── active:  text-primary, icon opacity 1.0, top accent line
└── badge:   8px red dot (알림)

Auth variants:
├── authenticated: 매칭 / 대화 / 친구 / 더보기
└── anonymous:     매칭 / 대화 / 로그인
```

---

### 3.4 SectionLabel + HeroTitle

**역할**: Ref A/B 스타일의 라벨 + 큰 Serif 타이틀 조합

```
Anatomy:
├── SectionLabel: overline (11px, uppercase-like, text-secondary, tracking-wide)
│                 예: "생각 지도" / "대화 시작" / "주간 인사이트"
├── [gap: 8px]
└── HeroTitle: hero (32px, Serif, text-primary, font-bold)
              예: "당신의 생각 풍경" / "새로운 관점을 만나세요"

Spacing:
├── SectionLabel → HeroTitle: 8px
├── HeroTitle → Body text: 16~24px
└── Top padding: 24~32px
```

**한글 히어로 타이틀 가이드**:
- 최대 2~3줄 (16자/줄 기준)
- 마침표 없음
- 명사형 종결 또는 청유형 (~하세요, ~해보세요)

---

### 3.5 PrimaryButton (CTA)

**원칙**: 화면당 1개만. 확실히 눌리고 확실히 중심이 되도록.

```
Size:
├── height: 48px (최소 44px)
├── padding-x: 20~24px
├── radius: pill (9999px)
├── width: auto (텍스트 맞춤) 또는 full-width (하단 고정 시)
└── max-width: 320px (중앙 정렬)

Style:
├── bg: --color-cta-primary (#2C3E50)
├── text: white, 16px, font-semibold
├── shadow: --shadow-cta
└── transition: springSnappy

States:
├── default:  bg indigo-depth, white text
├── hover:    bg cta-primary-hover (#1A2A3A)
├── pressed:  scale(0.98), springSnappy
├── disabled: bg cta-disabled (#CBD5E1), text-tertiary
├── loading:  텍스트 유지 + 우측 점 3개 (저속 펄스)
└── focus:    outline-none, ring-4 ring-[--color-border-focus]
```

```tsx
<button className="
  h-12 px-6 rounded-full
  bg-[var(--color-cta-primary)] text-white font-semibold
  shadow-[var(--shadow-cta)]
  active:scale-[0.98] transition-transform
  focus:outline-none focus:ring-4 focus:ring-[var(--color-border-focus)]
  disabled:bg-[var(--color-cta-disabled)] disabled:text-[var(--color-text-tertiary)]
">
  대화 찾기
</button>
```

---

### 3.6 SecondaryButton

**역할**: 보조 액션 (뒤로가기, 건너뛰기 등). CTA와 경쟁하지 않는다.

```
Style:
├── bg: transparent
├── border: 1px --color-border-soft
├── text: --color-text-primary, 14px, font-medium
├── radius: pill
├── height: 40px
└── pressed: bg --color-border-soft, scale(0.98)
```

---

### 3.7 PaperCard

**역할**: 기본 카드 컨테이너. 대부분의 콘텐츠 래퍼.

```
Style:
├── bg: --color-surface-card
├── border: 1px --color-border-soft
├── radius: 16px (--radius-card)
├── padding: 16px 또는 24px만 허용 (다른 값 금지)
├── shadow: --shadow-paper (기본) 또는 --shadow-card (강조 시)
└── gap between cards: 12~16px만

Variants:
├── default:   기본 PaperCard
├── elevated:  shadow-card, 약간 더 부각
├── selected:  border 2px --color-indigo-depth
├── semantic:  좌측 3px accent bar (Teal 또는 Orange)
└── interactive: hover시 shadow-card, cursor-pointer
```

```
┌─────────────────────────────────────┐
│  [PaperCard]                        │
│                                     │
│  padding: 16px | 24px               │
│  border: 1px rgba(44,62,80,0.10)    │
│  radius: 16px                       │
│  bg: rgba(255,255,252,1)            │
│                                     │
└─────────────────────────────────────┘
```

---

### 3.8 JewelSurface (엄격 제한)

**역할**: 글래스모피즘 카드. 특별한 순간에만 사용.

```
Style:
├── bg: --color-surface-jewel (white/72%)
├── border: 1px white/40%
├── backdrop-filter: blur(12~16px)
├── shadow: --shadow-jewel
├── radius: 16px
└── padding: 24px

허용 구간 (이외 사용 금지):
├── 대화 트레일러 박스 (Conversation Trailer)
├── 톤 제안 시트 (Tone Suggestion Sheet)
├── 공동 요약 카드 (Joint Summary Card) — 1장만
├── Peak-End 선물 카드 (Gift Reveal Card)
└── Peak-End 발견 카드 (Blind Spot Card)
```

---

### 3.9 ThoughtMapFrame (Blueprint 시각화)

**역할**: Ref B 스타일의 생각 지도 프레임. 설계도 느낌의 기하학적 시각화.

```
Anatomy:
├── Frame container: 정사각 220~260px
├── Blueprint grid: 1px lines, --color-border-divider
│   ├── opacity 8~12% (너무 진하면 공학 느낌 과함)
│   └── 가운데 십자선만 1단계 진하게 (선택)
├── Center visual: 프리즘/지도 SVG
│   ├── Stroke: --color-indigo-depth
│   ├── Fill: 반투명 indigo (opacity 10~20%)
│   └── 6각형/다면체 기하 (스탠스 6축 매핑)
└── Floating animation: 3초 호흡 (reduce-motion: off)

한글 라벨:
├── 상단 SectionLabel: "생각 지도"
├── HeroTitle: "당신의 생각 풍경" / "주간 인사이트"
└── CTA: "대화 찾기" / "요약 보기"
```

```
        ┌─ 생각 지도 ─┐
        │             │
    ┌───────────────────┐
    │    ╱ ╲   ╱ ╲     │
    │   ╱   ╲ ╱   ╲    │  ← Blueprint Grid
    │  ╱  ◆──◆──◆  ╲   │     + Prism SVG
    │   ╲   ╱ ╲   ╱    │
    │    ╲ ╱   ╲ ╱     │
    └───────────────────┘
        │             │
        └─ 대화 찾기 ─┘
```

**주간 인사이트 변형**: 프리즘이 더 복잡한 다면체(이코사헤드론)로 변경, 내부에 Teal/Orange 라인으로 유사/차이 축 표현

---

### 3.10 MarkerHighlight (파스텔 마커)

**역할**: 텍스트 선택/주목 "행동 상태" 표현 (의미색 아님)

```css
.marker {
  background: var(--color-marker-paper);        /* rgba(246,240,171,0.75) */
  padding: 0 6px;
  border-radius: 9999px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  line-height: 1.8;                             /* 마커가 줄간 겹치지 않도록 */
}

.marker--soft {
  background: var(--color-marker-paper-soft);    /* rgba(246,240,171,0.45) */
}
```

**의미색과의 구분 (핵심)**:

| 시각 요소 | Teal/Orange (의미) | Yellow Marker (행동) |
|----------|-------------------|---------------------|
| 용도 | "유사/차이" 표시 | "선택됨/편집 중" 표시 |
| 표현 방식 | 점, 라인, 사이드바, 라벨 | 인라인 텍스트 배경 |
| 예시 | `│` 좌측 3px 바, `●` 점 | 텍스트 뒤 노란 배경 |

---

### 3.11 MinimalComposer (하단 입력)

**역할**: Ref C 스타일의 단정한 하단 텍스트 입력

```
Anatomy:
├── outer: PaperCard (padding 16)
├── inner: textarea (auto-grow, max 4줄)
├── underline:
│   ├── default: 1px --color-slate-soft
│   └── focus:   2px --color-indigo-depth
├── placeholder: "생각을 적어보세요..." (첫 문장 시작형)
├── right: 전송 아이콘 (비활성: opacity 0.3)
└── counter: (선택) 글자 수 카운터 (500자 제한 등)

Position:
├── 화면 하단 고정 (sticky bottom)
├── safe-area-bottom 포함
└── 키보드 올라올 때 함께 올라감

A11y:
├── focus-ring 필수
├── aria-label="답변 입력"
└── placeholder는 사라지지 않는 라벨과 병행
```

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐    │
│  │ 생각을 적어보세요...          ▸     │    │
│  │ ─────────────────────────────       │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

### 3.12 StepProgressBar (대화 FSM)

**역할**: 6단계 대화 진행 상태 표시

```
FSM Steps (한글):
1. 긍정 (AFFIRMATION)
2. 입장 (POSITION)
3. 질문 (QUESTION)
4. 답변 (ANSWER)
5. 성찰 (REFLECTION)
6. 공동 요약 (JOINT_SUMMARY)

Anatomy:
├── Steps: 6개 원형 (12px)
│   ├── completed: bg --color-indigo-depth, white check
│   ├── current:   bg --color-indigo-depth, pulse ring
│   ├── upcoming:  bg --color-energy-rest-base, border-soft
│   └── skipped:   bg transparent, dashed border (QUICK 모드)
├── Connector lines: 1px between steps
│   ├── completed: --color-indigo-depth
│   └── upcoming:  --color-border-divider
├── Labels: caption (12px), 현재 단계만 표시
└── Effort indicator:
    ├── QUICK:      3 단계 (POSITION → REFLECTION)
    ├── STRUCTURED: 6 단계 전체
    └── DEEP:       6 단계 + 반복 표시

Layout:
├── 수평 배치 (가로 스크롤 없음)
├── 총 너비: 화면 - container-x*2
└── height: 40px
```

```
QUICK 모드:
  ○ ─── ● ─── ○ ─── ● ─── ○ ─── ○
       입장               성찰
       (현재)

STRUCTURED 모드:
  ✓ ─── ✓ ─── ● ─── ○ ─── ○ ─── ○
  긍정  입장  질문   답변   성찰  요약
             (현재)
```

---

### 3.13 EnergyIndicator

**역할**: 매칭 시 에너지 상태 시각 표현

```
States:
├── rest (휴식):    --color-energy-rest-accent, 파형 느림
├── steady (안정):  --color-energy-steady-accent, 파형 보통
└── active (활발):  --color-energy-active-accent, 파형 빠름

Visual:
├── 수평 파형 (3줄, 높이 12px)
├── 좌측 원형 인디케이터 (8px)
├── 라벨: "휴식" / "안정" / "활발"
└── Animation: CSS wave (reduce-motion: 정지)
```

---

### 3.14 MatchCard

**역할**: 매칭 후보 카드 (IntegratedMatchCard의 디자인 재정의)

```
Anatomy:
├── PaperCard (elevated)
│   ├── Header row:
│   │   ├── 익명 별칭 (AliasCard 연동)
│   │   ├── EnergyIndicator
│   │   └── 거리 배지 ("관점 거리: 0.73")
│   ├── Topic 칩: "경제 정책" / "환경" 등
│   ├── Trailer preview: JewelSurface 내 2~3줄 대화 미리보기
│   ├── Effort selector:
│   │   ├── 빠른 대화 (5분)
│   │   ├── 구조적 대화 (15분)
│   │   └── 깊은 대화 (30분+)
│   ├── Score bar: 수평 바, 4가지 가중치 시각화
│   └── Actions:
│       ├── PrimaryButton: "대화 시작"
│       └── SecondaryButton: "건너뛰기"
└── Decline badge: (이전 거절 시) 우측 상단 "거절됨" 배지

Spacing:
├── card padding: 24px
├── section gap: 16px
└── inline gap: 8~12px
```

---

### 3.15 TurnBubble

**역할**: 대화 턴 표시 (나 / 상대방)

```
Variants:
├── mine (우측 정렬):
│   ├── bg: --color-surface-card
│   ├── border: --color-border-soft
│   ├── radius: 16px (좌상, 우상, 좌하), 4px (우하)
│   └── text-align: left
├── opponent (좌측 정렬):
│   ├── bg: --color-paper-warm
│   ├── border: none
│   ├── radius: 16px (좌상, 우상, 우하), 4px (좌하)
│   └── text-align: left
└── facilitator (중앙):
    ├── bg: transparent
    ├── border: 1px dashed --color-border-divider
    ├── text: --color-text-secondary, italic
    └── 아이콘: 🤖 or ✦

Content:
├── 본문 텍스트 (body, line-height 1.6)
├── MarkerHighlight 적용 가능 (탭 시)
├── 시간 라벨: caption, text-tertiary
└── Semantic dots: 유사(●Teal) / 차이(●Orange) 상단 좌측
```

---

### 3.16 CoachSheet (AI 코치 바텀시트)

**역할**: AI 퍼실리테이터의 코칭 힌트, 톤 제안

```
Anatomy:
├── Sheet backdrop: black/30% blur
├── Sheet body:
│   ├── Handle bar (40px, 중앙)
│   ├── 타이틀: "톤 제안" / "코칭 힌트"
│   ├── 3개 옵션 (A/B/C):
│   │   ├── PaperCard (interactive variant)
│   │   ├── 제안 텍스트
│   │   └── 선택 시: border indigo-depth
│   ├── "내 표현 유지" 링크 (SecondaryButton)
│   └── 자동 닫힘 타이머 (30초)
├── radius: --radius-sheet (24px) 상단만
├── shadow: --shadow-elevated
└── Animation: springSoft (아래→위)

Motion:
├── 진입: translateY(100%) → translateY(0), springSoft
├── 퇴장: translateY(0) → translateY(100%), springSnappy
└── Reduce motion: fade only
```

---

### 3.17 MicrocopyBanner

**역할**: 안내성 메시지 (안전, 자율, 호기심, 역량)

```
Tone Colors:
├── safety (안전):     bg green-50, border green-200, icon green
├── autonomy (자율):   bg blue-50, border blue-200, icon blue
├── curiosity (호기심): bg purple-50, border purple-200, icon purple
└── competence (역량): bg amber-50, border amber-200, icon amber

Anatomy:
├── 좌측 아이콘 (20px)
├── 텍스트 (body-sm, 1~2줄)
├── (선택) 닫기 버튼
├── radius: --radius-chip (8px)
└── padding: 12px 16px
```

---

### 3.18 ChipSelector

**역할**: 단일/복수 선택지 (에너지, 주제, 노력 등급)

```
Anatomy:
├── Chip:
│   ├── height: 36px
│   ├── padding-x: 14px
│   ├── radius: pill
│   ├── border: 1px --color-border-soft
│   └── text: body-sm, text-primary
├── Selected:
│   ├── bg: --color-indigo-depth
│   ├── text: white
│   ├── border: none
│   └── animation: springSnappy
└── Layout: flex-wrap, gap 8px
```

---

### 3.19 SliderInput

**역할**: 감정 척도 (온기, 경청 정도 등)

```
Style:
├── Track: 4px height, bg energy-rest-base, radius pill
├── Fill: bg indigo-depth
├── Thumb: 20px circle, bg white, border 2px indigo-depth, shadow-card
├── Labels:
│   ├── 좌측: "전혀 아님" (text-tertiary)
│   ├── 우측: "매우 그렇다" (text-tertiary)
│   └── 현재 값: 숫자 (num font, 위에 뜸)
└── Ticks: (선택) 5~7개 눈금
```

---

### 3.20 DialogBadge

**역할**: 상태 뱃지 (진행 중, 대기, 완료, 만료)

```
Variants:
├── active:   bg indigo-depth, text white, "진행 중"
├── waiting:  bg energy-steady-base, text steady-accent, "대기 중"
├── completed: bg energy-rest-base, text text-secondary, "완료"
├── expired:  bg transparent, border dashed, text-tertiary, "만료"
└── declined: bg semantic-difference-soft, text difference, "거절됨"

Size: height 24px, padding-x 10px, radius pill, caption font
```

---

## 4. 화면 템플릿

### 4.1 Template A — Editorial Hero (에디토리얼 히어로)

**사용처**: Trust Moment, 온보딩 인트로, 기능 설명, 빈 상태

```
┌──────────────────────────────────┐
│  TopAppBar (wordmark)            │
│                                  │
│  SectionLabel ("시작하기")        │  ← overline, text-secondary
│                                  │
│  HeroTitle (Serif)               │  ← 32px, Noto Serif KR
│  "새로운 관점을                   │
│   만나보세요"                     │
│                                  │  ← gap 16~24px
│  Body paragraph                  │  ← 16px, text-secondary
│  안전하고 구조화된 대화를 통해     │
│  다른 시각을 이해해보세요.         │
│                                  │
│  (옵션: 소제목 + 문단)            │
│                                  │
│                                  │
│         ┌──────────────┐         │
│         │  시작하기      │         │  ← PrimaryButton, 중앙
│         └──────────────┘         │
│              24px                │  ← bottom safe-area
└──────────────────────────────────┘
```

**Spacing 규칙**:
- TopAppBar 아래 → SectionLabel: 24px
- SectionLabel → HeroTitle: 8px
- HeroTitle → Body: 16~24px
- Body → CTA: flex-grow (가변, 최소 24px)
- CTA → 하단: 24px + safe-area

---

### 4.2 Template B — Thought Map Hero (생각 지도 히어로)

**사용처**: 생각 지도 첫 화면, 요약 진입, 주간 인사이트

```
┌──────────────────────────────────┐
│  TopAppBar (minimal)             │
│                                  │
│  SectionLabel ("생각 지도")       │
│                                  │
│  HeroTitle (Serif)               │
│  "당신의 생각 풍경"               │
│                                  │
│    ┌────────────────────┐        │
│    │  ╱ ╲      ╱ ╲     │        │
│    │ ╱   ╲    ╱   ╲    │        │  ← ThoughtMapFrame
│    │╱  ◆──◆──◆  ╲   │        │     (blueprint grid
│    │ ╲   ╱ ╲   ╱    │        │      + prism SVG)
│    │  ╲ ╱   ╲ ╱     │        │
│    └────────────────────┘        │
│                                  │
│         ┌──────────────┐         │
│         │  대화 찾기     │         │  ← PrimaryButton
│         └──────────────┘         │
│                            ✦    │  ← 우하단 sparkle (subtle)
└──────────────────────────────────┘
   ↑ AppBackground: paperVignette
```

**배경**: paperVignette 허용 (이 화면과 Peak-End에서만)

---

### 4.3 Template C — Conversation Editor (대화 편집기)

**사용처**: 대화 턴, 하이라이트/인용/톤제안의 기반

```
┌──────────────────────────────────┐
│  TopAppBar (title: "상대 별칭")   │
│  StepProgressBar                 │
│                                  │
│  상대의 입장                      │  ← SectionLabel
│                                  │
│  본문 텍스트 (읽기 중심)           │
│  line-height 1.6                 │
│  넉넉한 여백                      │
│                                  │
│  "내려놓는 것은 포기가 아니라      │  ← MarkerHighlight
│   흐름을 신뢰하는 것이다."        │     (탭으로 선택)
│                                  │
│  의미 표시:                       │
│  │ 유사한 관점 (Teal bar + dot)   │  ← Semantic, not Marker
│  │ 다른 관점 (Orange bar + dot)   │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ 생각을 적어보세요...    ▸    │ │  ← MinimalComposer
│  │ ────────────────────────── │ │     (하단 고정)
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

**핵심 규칙**:
- 의미(유사/차이)는 Teal/Orange **점/라인/라벨**로만
- 마커는 **"선택됨"**만 표현
- 본문 가독성 최우선: body 16px, line-height 1.6

---

### 4.4 Template D — Card Feed (카드 피드)

**사용처**: 매칭 후보 목록, 대화 목록, 친구 목록

```
┌──────────────────────────────────┐
│  TopAppBar (wordmark)            │
│                                  │
│  타이틀 + 필터 칩                 │
│  ┌─────────────────────────────┐ │
│  │  MatchCard 1                 │ │  ← PaperCard (elevated)
│  │  별칭 / 에너지 / 거리         │ │
│  │  트레일러 미리보기             │ │
│  │  [대화 시작]  [건너뛰기]      │ │
│  └─────────────────────────────┘ │
│  gap: 12px                       │
│  ┌─────────────────────────────┐ │
│  │  MatchCard 2                 │ │
│  │  ...                         │ │
│  └─────────────────────────────┘ │
│                                  │
│  BottomTabBar                    │
└──────────────────────────────────┘
```

---

### 4.5 Template E — Immersive Flow (몰입 플로우)

**사용처**: Peak-End 플로우, 선물 공개, 발견 카드

```
┌──────────────────────────────────┐
│  TopAppBar (immersive: X 닫기)   │
│                                  │
│                                  │
│                                  │
│    ┌────────────────────────┐    │
│    │  JewelSurface          │    │  ← 글래스모피즘 카드
│    │                        │    │
│    │  ✦ 새로운 발견          │    │
│    │                        │    │
│    │  "상대의 입장에서       │    │
│    │   ~~를 새롭게           │    │
│    │   이해하게 되었습니다"   │    │
│    │                        │    │
│    └────────────────────────┘    │
│                                  │
│         ┌──────────────┐         │
│         │  다음          │         │
│         └──────────────┘         │
│                                  │
└──────────────────────────────────┘
   ↑ AppBackground: paperVignette
```

---

## 5. 화면별 상세 스펙

### 5.1 온보딩 플로우 — (funnel) Route Group

#### 5.1.1 Trust Moment (Template A)

```
SectionLabel: "시작하기"
HeroTitle: "당신의 관점을 안전하게 탐색하세요"
Body:
  "PerspectiveShift는 당신의 생각을 기록하고,
   다른 관점과 안전하게 대화할 수 있는 공간입니다."

  🔒 "모든 데이터는 암호화되며, 대화 상대에게
   개인 정보가 공유되지 않습니다."

CTA: "시작하기"
SecondaryLink: "데이터 관리 →" (하단)
```

#### 5.1.2 자기 긍정 (Self-Affirmation) (Template A 변형)

```
SectionLabel: "자기 긍정"
HeroTitle: "먼저, 당신이 소중하게 여기는 가치"
Body: "아래 가치 중 가장 중요하다고 느끼는 것을 골라주세요."

[ChipSelector: 6~8개 가치 칩]
  "가족" "정의" "자유" "안정" "창의" "공동체" "성장" "진실"

CTA: "다음"
ProgressBar: 1/N
```

#### 5.1.3 입장 질문 (Stance Discovery) (Template C 변형)

```
TopAppBar: title "입장 탐색"
ProgressBar: N/M

Question Card (PaperCard):
  질문 텍스트 (title-lg, Serif)

  Answer Options:
  ├── OX 질문: 2개 대형 버튼 (O / X)
  ├── 루브릭 질문: 5단계 척도 (SliderInput)
  └── 주관식: MinimalComposer

  신뢰도 선택:
  [ChipSelector: "확신" / "어느 정도" / "잘 모르겠음"]

CTA: "다음 질문"
```

#### 5.1.4 결과 화면 (Thought Map Result) (Template B)

```
SectionLabel: "생각 지도"
HeroTitle: "당신의 생각 풍경"

ThoughtMapFrame:
  - 6축 레이더 차트 (blueprint grid 위)
  - 각 축 라벨 (한글)
  - 신뢰도: 점 크기/투명도로 표현

Statistics (PaperCard):
  - 백분위 표시 (num font)
  - 축별 설명 (body-sm)

CTA: "대화 찾기"
SecondaryLink: "다시 하기 →"
```

---

### 5.2 매칭 — (main)/matching

#### 5.2.1 매칭 목록 (Template D)

```
TopAppBar: wordmark
필터 바: [ChipSelector]
  "전체" / "활발" / "안정" / "휴식"

MatchCard 목록:
  각 카드:
  ├── 익명 별칭 + EnergyIndicator
  ├── 주제 칩: "경제" "환경" 등
  ├── 관점 거리: "0.73" (num font, Teal→Orange 그라데이션 바)
  ├── 대화 트레일러 (JewelSurface):
  │   "이 주제에서 두 분의 시각이 흥미롭게 다릅니다.
  │    A님은 ~~를 중시하고, B님은 ~~를 강조하시네요."
  ├── 노력 등급 선택: [빠른|구조적|깊은]
  └── Actions: [대화 시작] [건너뛰기]

빈 상태 (Template A):
  HeroTitle: "지금은 매칭 상대가 없어요"
  Body: "잠시 후 다시 확인해보세요."

BottomTabBar: 매칭 탭 활성
```

---

### 5.3 대화 — (main)/dialogue

#### 5.3.1 대화 목록 (Template D)

```
TopAppBar: wordmark
세그먼트: [진행 중 | 완료]

DialogueCard (PaperCard interactive):
  ├── 상대 별칭 + DialogBadge (상태)
  ├── 주제 칩
  ├── StepProgressBar (축소 버전)
  ├── 마지막 활동 시간
  └── 터치 → [id] 페이지로 이동

빈 상태: Template A "아직 대화가 없어요"
BottomTabBar: 대화 탭 활성
```

#### 5.3.2 대화 진행 (Template C)

```
TopAppBar: title "상대 별칭"
StepProgressBar: 현재 단계 강조

[각 단계별 UI]:

1. 긍정 (AFFIRMATION):
   PaperCard: 자기 긍정 리마인더
   "당신이 소중하게 여기는 가치: [가치]"
   CTA: "대화 시작"

2. 입장 (POSITION):
   SectionLabel: "내 입장"
   MinimalComposer (확장형, 5줄 이상)
   가이드: MicrocopyBanner (curiosity)
   "상대를 설득하기보다, 내 생각을 명확히 표현해보세요."
   CTA: "입장 제출"

3. 질문 (QUESTION):
   상대 입장 표시 (TurnBubble: opponent)
   MarkerHighlight: 탭하여 궁금한 부분 선택
   MinimalComposer: "궁금한 점을 물어보세요..."
   CTA: "질문 제출"

4. 답변 (ANSWER):
   상대 질문 표시 (TurnBubble: opponent)
   MinimalComposer: "답변을 작성해보세요..."
   CTA: "답변 제출"

5. 성찰 (REFLECTION):
   전체 대화 요약 (PaperCard)
   성찰 퀴즈 (1문항): PaperCard
   경청 정도: SliderInput
   상호 검증: ChipSelector
   CTA: "성찰 완료"

6. 공동 요약 (JOINT_SUMMARY):
   JewelSurface:
     주제 / 날짜 / 핵심 포인트
     이해도 점수 (num)
     경청 점수 (num)
   CTA: "저장하기"
   SecondaryButton: "친구 요청"
```

#### 5.3.3 대기 상태

```
WaitingCard (PaperCard, 중앙):
  아이콘: ⏳ (subtle pulse)
  "상대방의 답변을 기다리고 있어요"
  예상 시간: "보통 2~5분 소요"
  SecondaryButton: "알림 받기"
```

#### 5.3.4 AI 퍼실리테이터 개입

```
TurnBubble (facilitator variant):
  "잠깐, 이 부분을 좀 더 구체적으로
   설명해보면 어떨까요? ✦"

톤 경고 → CoachSheet:
  "표현을 조금 부드럽게 바꿔볼까요?"
  Option A: "~라고 생각해요" (PaperCard interactive)
  Option B: "~일 수도 있겠네요" (PaperCard interactive)
  Option C: "~에 대해 더 알고 싶어요" (PaperCard interactive)
  [내 표현 유지] (SecondaryButton)
```

---

### 5.4 Peak-End 플로우 — (Template E)

**6단계 위저드 (paperVignette 배경)**:

```
Step 1: 공동 요약 → JewelSurface
Step 2: 선물 교환 →
  GiftMessageInput (MinimalComposer 변형)
  "상대에게 한마디를 남겨주세요"
Step 3: 선물 공개 →
  GiftRevealCard (JewelSurface)
  펼쳐지는 애니메이션 (springSoft)
Step 4: 발견 카드 →
  BlindSpotCard (JewelSurface)
  "✦ 이번 대화에서 새롭게 알게 된 것"
Step 5: KPI 요약 →
  PaperCard: 이해도/경청/온기 점수
Step 6: 다음 행동 CTA →
  "다른 대화 찾기" / "친구 요청" / "홈으로"
```

---

### 5.5 실시간 채팅 — (immersive)/chat

```
TopAppBar: immersive (친구 별칭 + X 닫기)

Chat bubbles (TurnBubble):
  mine → 우측, light bg
  friend → 좌측, warm bg

MicroCheckinPrompt (10분 간격):
  MicrocopyBanner (autonomy):
  "대화가 잘 진행되고 있나요? 😊"
  [잘 되고 있어요] [잠깐 쉴게요]

MinimalComposer (하단 고정):
  "메시지를 입력하세요..."
```

---

### 5.6 친구 & 관계 — (main)/friends

```
친구 목록 (Template D):
  FriendCard (PaperCard interactive):
  ├── 별칭 + 온라인 상태 (green dot)
  ├── 공통 발견: "3개의 공통점"
  ├── 마지막 대화: "2일 전"
  └── Actions: "채팅" / "관점 바꿔보기"

친구 상세 (/friends/[id]):
  CommonGroundCard (PaperCard, semantic-similarity):
    공통 관점 목록
  JointQuestions (PaperCard):
    함께 탐구할 질문들
  LightProtocol (PaperCard):
    경량 대화 규칙
```

---

## 6. 인터랙션 패턴

### 6.1 탭 하이라이트 (Mobile Tap Highlight)

```
사용자 동작: 텍스트 문장을 탭
결과: 해당 문장에 MarkerHighlight 적용
연쇄:
  ├── 탭 1회: 선택 (marker-paper)
  ├── 탭 2회: 해제
  └── 선택된 문장 → 인용으로 사용 가능

기술:
  - 문장 단위 <span> 래핑
  - 탭 시 toggle class
  - box-decoration-break: clone (줄바꿈 대응)
  - haptic feedback (navigator.vibrate(10))
```

### 6.2 에너지 반응 카드 전환

```
사용자 동작: 에너지 레벨 변경 (rest → steady → active)
결과: MatchCard 목록이 에너지에 맞게 재정렬
애니메이션:
  - 카드 shuffle: layout animation (springSoft)
  - 새 카드 진입: fadeIn + translateY(12px)
  - 퇴장 카드: fadeOut + translateY(-8px)
```

### 6.3 바텀시트 패턴 (CoachSheet 등)

```
진입: backdrop fade + sheet slide-up (springSoft)
퇴장: sheet slide-down (springSnappy) + backdrop fade
드래그: 아래로 드래그 시 dismiss (threshold: 40%)
탭 외부: dismiss
Reduce motion: fade only (no slide)
```

### 6.4 프로그레스 전환

```
단계 완료 시:
  - 현재 점: scale pulse (springSnappy)
  - 연결선: width expand (springSoft)
  - 다음 점: border fill animation
  - 라벨: fade transition

ConfettiMicro: (JOINT_SUMMARY 도달 시만)
  - 작은 파티클 5~8개
  - 1초 후 자동 소멸
  - Reduce motion: 없음
```

---

## 7. 접근성 (A11y)

### 7.1 필수 요구사항

| 항목 | 요구 | 구현 |
|------|------|------|
| **색상 대비** | WCAG AA (4.5:1 이상) | text-primary on paper: 8.2:1 ✓ |
| **터치 타겟** | 최소 44×44px | 모든 interactive 요소 |
| **키보드 탐색** | Tab 순서 논리적 | tabIndex 관리 |
| **스크린 리더** | 모든 interactive에 aria-label | ARIA 속성 필수 |
| **동작 감소** | prefers-reduced-motion 대응 | floating off, fade only |
| **색맹 대응** | 색만으로 의미 전달 금지 | 라벨/아이콘 병행 필수 |

### 7.2 색맹 대응 (의미색)

```
Teal (유사) → 항상 "●" 점 + "유사" 텍스트 라벨 병행
Orange (차이) → 항상 "●" 점 + "차이" 텍스트 라벨 병행
Marker (선택) → 선택 상태는 border 강조 + aria-selected 병행
```

### 7.3 ARIA 패턴

```tsx
// StepProgressBar
<div role="progressbar" aria-valuenow={3} aria-valuemin={1} aria-valuemax={6}
     aria-label="대화 진행: 6단계 중 3단계 (질문)">

// MarkerHighlight
<span role="option" aria-selected={true}
      aria-label="선택된 문장: 내려놓는 것은 포기가 아니라...">

// CoachSheet
<div role="dialog" aria-modal="true"
     aria-label="톤 제안">

// EnergyIndicator
<div role="status" aria-label="에너지 상태: 안정">
```

---

## 8. 구현 체크리스트

### 8.1 디자인 시스템 검증 (모든 화면)

- [ ] spacing이 4pt 스케일(4/8/12/16/24/32/48/64)을 벗어나지 않는다
- [ ] 카드 padding은 16px 또는 24px만 사용했다
- [ ] 화면당 Primary CTA 1개만 존재한다
- [ ] Jewel Surface는 허용 구간(트레일러/톤제안/공동요약/선물/발견)에서만 쓰였다
- [ ] 비네트는 ThoughtMap Hero/Peak-End에서만 쓰였다
- [ ] Thought Map이 "정치 스펙트럼"이 아니라 blueprint/편집으로 보인다
- [ ] 하이라이트가 공격적 형광이 아니라 paper-marker로 보인다
- [ ] Soft Slate(text-secondary)는 본문에 쓰지 않고 메타/설명에만 사용했다
- [ ] reduce-motion에서 floating이 꺼지고, sheet/전환이 과하지 않다
- [ ] 모든 색상이 CSS 변수(토큰)를 참조한다 (하드코딩 금지)

### 8.2 접근성 검증

- [ ] 모든 interactive 요소가 44×44px 이상이다
- [ ] 모든 버튼/링크에 aria-label이 있다
- [ ] 색만으로 의미를 전달하는 곳이 없다 (라벨 병행)
- [ ] Tab 순서가 논리적이다
- [ ] 스크린 리더로 전체 플로우를 탐색할 수 있다

### 8.3 한글 타이포그래피 검증

- [ ] 본문은 Sans-serif(Pretendard)를 사용한다
- [ ] 히어로 타이틀은 Serif(Noto Serif KR)를 사용한다
- [ ] line-height가 1.6 이상이다 (본문)
- [ ] Serif 타이틀에 letter-spacing: -0.02em이 적용되어 있다
- [ ] 숫자는 tabular-nums(font-variant-numeric)를 사용한다

### 8.4 컴포넌트 구현 우선순위

```
Phase 1 (Foundation):
  ├── AppBackground
  ├── TopAppBar
  ├── BottomTabBar
  ├── PrimaryButton / SecondaryButton
  ├── PaperCard
  └── CSS 토큰 (globals.css)

Phase 2 (Core Flow):
  ├── SectionLabel + HeroTitle
  ├── StepProgressBar
  ├── MinimalComposer
  ├── TurnBubble
  ├── MarkerHighlight
  └── ChipSelector

Phase 3 (Rich Features):
  ├── JewelSurface
  ├── ThoughtMapFrame
  ├── MatchCard
  ├── CoachSheet
  ├── EnergyIndicator
  └── SliderInput

Phase 4 (Polish):
  ├── DialogBadge
  ├── MicrocopyBanner
  ├── Motion presets 적용
  └── Reduce motion 대응
```

---

## 부록: 파일 구조 제안

```
src/app/_shared/
├── components/
│   ├── layout/
│   │   ├── AppBackground.tsx
│   │   ├── TopAppBar.tsx
│   │   └── BottomTabBar.tsx
│   ├── typography/
│   │   ├── SectionLabel.tsx
│   │   └── HeroTitle.tsx
│   ├── actions/
│   │   ├── PrimaryButton.tsx
│   │   └── SecondaryButton.tsx
│   ├── surfaces/
│   │   ├── PaperCard.tsx
│   │   └── JewelSurface.tsx
│   ├── inputs/
│   │   ├── MinimalComposer.tsx
│   │   ├── ChipSelector.tsx
│   │   └── SliderInput.tsx
│   ├── feedback/
│   │   ├── StepProgressBar.tsx
│   │   ├── EnergyIndicator.tsx
│   │   ├── DialogBadge.tsx
│   │   └── MicrocopyBanner.tsx
│   ├── visualization/
│   │   └── ThoughtMapFrame.tsx
│   └── chat/
│       ├── TurnBubble.tsx
│       ├── MarkerHighlight.tsx
│       └── CoachSheet.tsx
├── motion.ts                    ← 모션 프리셋
├── tokens.css                   ← 디자인 토큰 (globals.css에서 import)
└── hooks/
    ├── useAuth.ts
    ├── useAnonymousSession.ts
    ├── useRealtimeChat.ts
    └── useReducedMotion.ts      ← 새로 추가
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-02-19 | v1.0 | 초기 작성 — Mental Spa 레퍼런스 기반 PerspectiveShift 적용 |
