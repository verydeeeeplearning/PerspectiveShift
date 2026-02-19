# v3.0 Enhancement Blueprint

**Status**: Planning
**Created**: 2026-02-19
**Last Updated**: 2026-02-19

## Overview

v3.0은 v2.0에서 구축한 도메인/비즈니스 로직 위에 **UX 혁신 + 리텐션 인프라**를 추가하는 고도화이다.
v2.0이 "무엇을 할 수 있는가(기능)"를 만들었다면, v3.0은 "어떻게 경험하는가(UX) + 왜 다시 오는가(리텐션)"를 만든다.

### v2.0 → v3.0 Gap 요약

| 영역 | v2.0 (구현 완료) | v3.0 (추가/개정) |
|------|-----------------|-----------------|
| 온보딩 | 5문항 고정, Stance Profile 6축 | 정밀도 사다리(5/10/20), Anchor/Rotating Bank, 정밀도 게이지 |
| 결과 화면 | Thought Map + 별명 + Misperception | 공유 카드 3종, Next Step Hub, Confidence Meter |
| 매칭 | Distance-Safety Package | 매칭 카드 UX 전면 개편 (Trailer + 에너지 + 거절) |
| 대화 | 6단계 FSM + PersonalContext | 스캐폴딩, Coach, 밑줄/인용, 톤 체크 개선 |
| Reflection | ReflectionItem 기본 | R1 퀴즈→주관식, R2 슬라이더 검증, R3 역할극 |
| 대화 종료 | 기본 피드백 | 공동 요약 카드, Peak-End 카드, 나쁜 경험 복구 |
| 리텐션 | 1주 후 체크인 | 상태 기반 홈, D+1 복기, D+7 Passport, 알림 3종 |
| 인프라 | 기본 메트릭 | 이벤트 택소노미, A/B 테스트, 마이크로카피 |

## 의존성 그래프

```
V3-P1 정밀도 사다리 + 질문 Bank ─┐
V3-P2 공유 카드 3종 + Next Step Hub ─┤
                                    ├─→ V3-P3 매칭 카드 UX
V3-P9 이벤트 로깅 택소노미 ─────────┘      │
                                          ├─→ V3-P4 대화 UX 개선
                                          │      │
                                          │      ├─→ V3-P5 Reflection 전면 개편
                                          │      │      │
                                          │      │      ├─→ V3-P6 Peak-End 카드
                                          │      │      │      │
                                          │      │      │      └─→ V3-P7 나쁜 경험 복구
                                          │      │      │
                                          │      │      └─→ V3-P6
V3-P8 상태 기반 홈 + 리텐션 ────────────────┘
V3-P10 마이크로카피 + A/B 인프라 ──── (병렬, 모든 Phase에 점진적 적용)
V3-P11 Stance Drift + Perspective Passport ──── (V3-P8 이후)
```

## Phase 목록 (11 Phases)

| Phase | 이름 | 핵심 기능 | 의존성 | 추정 규모 |
|-------|------|----------|--------|----------|
| V3-P1 | 정밀도 사다리 + 질문 Bank | 온보딩 모드 선택, Anchor/Rotating 질문, 정밀도 게이지 | 없음 | Medium |
| V3-P2 | 공유 카드 3종 + Next Step Hub | 별명/Map/Misperception 카드, Phase1→2 전환 허브 | V3-P1 | Medium |
| V3-P3 | 매칭 카드 UX | Conversation Trailer, 에너지 체크, 거절 UX, 의견 거리 언어화 | V3-P2 | Large |
| V3-P4 | 대화 UX 개선 | 스캐폴딩, Coach 버튼, 밑줄/자동 인용, 톤 체크 개선 | V3-P3 | Large |
| V3-P5 | Reflection 전면 개편 | R1 퀴즈→주관식, R2 슬라이더 검증, R3 역할극 Steelman, R4 공통점 | V3-P4 | Large |
| V3-P6 | Peak-End 카드 + 공동 요약 | 상대 한 문장 선물, Blind Spot, 슬라이더 KPI, 공동 요약 카드 | V3-P5 | Large |
| V3-P7 | 나쁜 경험 복구 루틴 | 복구 UI, 자동 매칭 조정, "다음에 묻고 싶은 질문" 저장 | V3-P6 | Small |
| V3-P8 | 상태 기반 홈 + 리텐션 루프 | 상태 머신 홈, D+1 복기 카드, D+7 Passport, 알림 3종 | V3-P6 | Large |
| V3-P9 | 이벤트 로깅 택소노미 | Phase 1/2/3 전체 이벤트 스키마, 로깅 인프라 | 없음 (병렬) | Medium |
| V3-P10 | 마이크로카피 + A/B 인프라 | 카피 라이브러리, A/B 실험 프레임워크, Feature Flag | 없음 (병렬) | Medium |
| V3-P11 | Stance Drift + Perspective Passport 고도화 | 옵트인 Drift 알림, 누적 탐험 지도, 여정 표시 | V3-P8 | Medium |

---

## V3-P1: 정밀도 사다리 + 질문 Bank

**Goal**: 온보딩에서 사용자가 5/10/20문항 모드를 선택할 수 있고, Anchor 질문(7개) + Rotating Bank에서 나머지 문항이 회전 샘플링되는 시스템 구축.

**Non-goals**: Adaptive Questioning (LLM 동적 질문 조정)은 이 Phase에서 제외.

### Domain Layer 변경

- [ ] `OnboardingMode` VO 생성 — QUICK(5) / STANDARD(10) / PRECISE(20) enum + 문항 수 매핑
- [ ] `QuestionBank` Entity 생성 — Anchor/Rotating 분류, axis별 문항 풀
  - `QuestionItem` VO: id, text, type(OX/Rubric/OpenEnded), axis, isAnchor, variant
  - `QuestionBank.sampleForMode(mode, previousAnswers?)`: 모드별 문항 선택 로직
- [ ] `PrecisionScore` VO 생성 — 답변 수 + 일관성 기반 정밀도 계산 (0~100%)
  - `PrecisionScore.calculate(answeredCount, consistencyScore)`: 정밀도 산출 공식
  - `PrecisionScore.nextMilestone()`: 다음 정밀도 단계까지 필요한 문항 수
- [ ] `AntiAbusePolicy` VO — 하루 1회 리테이크 제한, 과다 반복 감지
- [ ] `OnboardingSession` Entity 확장 — mode 필드 추가, 교정 질문 진입 시 confidence_map 1회 수집 로직

### Application Layer 변경

- [ ] `SelectOnboardingModeUseCase` — 모드 선택 → QuestionBank에서 문항 샘플링
- [ ] `CalculatePrecisionUseCase` — 현재 답변 기반 정밀도 계산 + 다음 마일스톤 안내
- [ ] `ExtendOnboardingUseCase` — 결과 화면에서 추가 질문 진입 (정밀도 업그레이드)
- [ ] `CheckRetakeLimitUseCase` — Anti-abuse 리테이크 제한 확인
- [ ] Port interfaces: `QuestionBankRepository`, `OnboardingSessionRepository` 확장

### Infrastructure Layer 변경

- [ ] `QuestionBankRepository` 구현 — Supabase에서 문항 풀 로드 + 캐싱
- [ ] DB 스키마: `question_bank` 테이블 (id, text, type, axis, is_anchor, variants[])
- [ ] DB 스키마: `onboarding_sessions` 테이블에 `mode`, `precision_score` 컬럼 추가

### Presentation Layer 변경

- [ ] 모드 선택 화면 컴포넌트 — 3개 카드 (빠르게 시작/표준/정밀) + "정밀 분석은 매칭 품질이 좋아짐" 프레이밍
- [ ] 정밀도 게이지(Confidence Meter) 컴포넌트 — 결과 화면 상단 프로그레스 바
- [ ] "정밀도 올리기" CTA 버튼 — 추가 5문항 / 추가 15문항 옵션
- [ ] 1문항 답변마다 Thought Map 실시간 업데이트 연동 (교정 질문 구간)
- [ ] Anti-abuse: 리테이크 시 "내일 다시 해볼까요?" 안내 UI

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | OnboardingMode, QuestionBank, PrecisionScore, AntiAbusePolicy | >=90% |
| Unit | SelectOnboardingModeUseCase, CalculatePrecisionUseCase | >=80% |
| Integration | QuestionBank 샘플링 + PrecisionScore 계산 end-to-end | Critical paths |
| Component | 모드 선택 UI, 정밀도 게이지 UI | Render + interaction |

### Quality Gate

- [ ] 도메인 엔티티에 외부 의존성 없음
- [ ] 모든 테스트 통과
- [ ] 빌드 에러 없음
- [ ] ESLint 클린
- [ ] Anchor 질문은 항상 7개 포함됨 (불변 조건)
- [ ] 정밀도 계산 공식이 답변 수에 비례하여 단조 증가

---

## V3-P2: 공유 카드 3종 + Next Step Hub

**Goal**: Thought Map 결과 화면에서 공유 가능한 카드 3종(별명/Map/Misperception)을 생성하고, Phase1→Phase2로의 seamless 전환을 위한 Next Step Hub를 구축.

**Non-goals**: SNS API 직접 연동(공유 링크만 생성).

### Domain Layer 변경

- [ ] `ShareCard` Entity 생성 — type(ALIAS/THOUGHT_MAP/MISPERCEPTION), 생성 데이터, 프라이버시 문구
  - `ShareCard.create(type, stanceProfile, misperceptionResult?)`: 카드 생성 팩토리
  - 필수 문구 검증: "이 카드는 개인정보 없이 생성됩니다", "원문 답변은 저장되지 않습니다"
- [ ] `ShareCardType` enum — ALIAS, THOUGHT_MAP, MISPERCEPTION
- [ ] `NextStepHub` VO — 사용자 상태에 따른 CTA 우선순위 결정
  - Primary: 대화 상대 찾기
  - Secondary: 정밀도 올리기 / AI 심층 분석
- [ ] `ShareCard` 내 축 선택 로직 — Thought Map 카드: 6축 중 사용자가 3축 선택 (기본값 상위 3축)

### Application Layer 변경

- [ ] `GenerateShareCardUseCase` — 카드 타입별 데이터 조립 + 프라이버시 문구 주입
- [ ] `DetermineNextStepUseCase` — 현재 사용자 상태 → CTA 우선순위 반환
- [ ] `TrackShareEventUseCase` — 공유 이벤트 기록 (share_type_select, share_complete)

### Infrastructure Layer 변경

- [ ] 카드 이미지 생성 서비스 — OG Image 스타일 카드 렌더링 (서버 사이드)
- [ ] 공유 URL 생성: `/share/card/{cardId}` → 카드 프리뷰 + 앱 링크

### Presentation Layer 변경

- [ ] 공유 카드 선택 UI — 3종 카드 프리뷰 + 선택
  - 별명 카드: 별명 + 축 2~3개
  - Thought Map 카드: 6축 중 선택한 3축 바 차트
  - Misperception 카드: 내 예측 vs 실제 데이터 비교 (표본/기간 라벨 필수)
- [ ] Next Step Hub 화면
  - Primary CTA: "대화 상대 찾기 →" (가장 크게)
  - Secondary CTA: "정밀도 올리기 (2분)" / "AI 심층 분석 (7분)"
  - Misperception 교정 카드 (선택형)
  - 별명 + 분포 내 위치 요약
- [ ] 카드 공유 버튼 → 클립보드 복사 / 카카오톡 / 트위터 공유 옵션

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | ShareCard, ShareCardType, NextStepHub | >=90% |
| Unit | GenerateShareCardUseCase, DetermineNextStepUseCase | >=80% |
| Component | 공유 카드 프리뷰, Next Step Hub CTA 렌더링 | Render + click |

### Quality Gate

- [ ] 모든 공유 카드에 프라이버시 필수 문구 포함 (테스트 강제)
- [ ] PII 없는 데이터만 카드에 포함
- [ ] Next Step Hub의 Primary CTA가 항상 "대화 상대 찾기"
- [ ] 빌드/테스트/린트 클린

---

## V3-P3: 매칭 카드 UX

**Goal**: 매칭 수락률을 올리기 위한 매칭 카드 전면 개편 — 의견 거리 언어화, Conversation Trailer, 에너지 체크, 거절 UX.

**Non-goals**: 매칭 알고리즘 자체의 변경 (v2.0 적응형 매칭 유지).

### Domain Layer 변경

- [ ] `OpinionDistanceLabel` VO 생성 — 5단계 언어화 시스템
  - `SLIGHT` (0.1~0.2, 🌱 "살짝 다른", "비슷한 전제, 다른 결론")
  - `MODERATE` (0.2~0.4, 🌊 "적당한 차이", "한두 축에서 뚜렷이 다름")
  - `MEANINGFUL` (0.4~0.6, ⛰️ "의미있는 차이", "여러 축에서 다름")
  - `CHALLENGING` (0.6~0.8, 🌋 "도전적 차이", "핵심 가치에서 다름")
  - `DISABLED` (0.8~1.0, 비활성화)
  - `OpinionDistanceLabel.fromDistance(distance)`: 거리 → 라벨 변환
- [ ] `ConversationTrailer` VO — LLM이 생성하는 상대 stance 자연어 요약
  - 2줄, 40자 이내, 단정적 어조 금지, 가치 라벨 금지
  - 입력: stance_vector만 (PII 없음)
  - 출력: "이 분은 [관찰 가능한 입장]이지만, [유연하거나 공감 가능한 측면]이에요."
- [ ] `EnergyLevel` VO — HIGH / NORMAL(기본값) / LOW
  - `EnergyLevel.adjustMatch(currentMatch)`: 에너지에 따른 Distance/Level 자동 조정
  - LOW: Level -1, Distance -0.1 + "오늘은 가볍게 5분짜리" 텍스트 변경
- [ ] `DeclineReason` VO — 거절 사유 4종 (주제 무거움 / 시간 없음 / 쉬고 싶음 / 다른 주제)
  - `DeclineReason.toMatchingAdjustment()`: 거절 사유 → 다음 매칭 조정 입력
- [ ] `MatchCard` Entity 확장 — trailer, distanceLabel, energyLevel, estimatedTime 필드

### Application Layer 변경

- [ ] `GenerateConversationTrailerUseCase` — stance_vector → LLM → 자연어 트레일러
  - LLM 프롬프트: 금지(원문, 인구통계, "진보적/보수적" 등 가치 라벨), 출력(2줄, 40자)
- [ ] `SelectEnergyLevelUseCase` — 에너지 선택 → 매칭 파라미터 자동 조정
- [ ] `RecordDeclineReasonUseCase` — 거절 사유 기록 + 다음 매칭 조정 트리거
- [ ] `BuildMatchCardUseCase` — 매칭 결과 + trailer + label + 시간 예측 통합
- [ ] Port: `ConversationTrailerGenerator` (LLM 어댑터 인터페이스)

### Infrastructure Layer 변경

- [ ] `LLMConversationTrailerAdapter` — OpenAI API 호출, 프롬프트 템플릿 관리
  - 프롬프트 가드레일: stance data만 입력, PII 차단
- [ ] `decline_reasons` 테이블 또는 `match_events` 테이블에 reason 컬럼

### Presentation Layer 변경

- [ ] 매칭 카드 컴포넌트 전면 재설계 (v3.0 기획서 UI 기준)
  - 상단: [TODAY'S MATCH] + 🔒 익명
  - 주제 섹션: 오늘의 주제 텍스트
  - 거리/난이도/시간: OpinionDistanceLabel 바 + Level 텍스트 + 예상 시간
  - Conversation Trailer: 2줄 자연어 요약
  - 사회적 증거: "어제 이 주제로 N쌍이 대화했어요"
  - 에너지 체크: 3단계 탭 UI (🔋🔋🔋/🔋/🪫)
  - 메인 CTA: "대화 시작하기 →"
  - 보조 액션: [난이도 낮추기] [다른 주제 보기]
- [ ] 거절 UX: "다음에" 클릭 시 4지선다 이유 선택 팝업
- [ ] Trailer 로딩 스켈레톤 (LLM 응답 대기 중)

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | OpinionDistanceLabel, ConversationTrailer, EnergyLevel, DeclineReason | >=90% |
| Unit | GenerateConversationTrailerUseCase, SelectEnergyLevelUseCase | >=80% |
| Integration | LLM Trailer 생성 → 카드 조립 end-to-end | Critical paths |
| Component | 매칭 카드 전체 렌더링, 에너지 체크 인터랙션, 거절 팝업 | Render + interaction |

### Quality Gate

- [ ] Conversation Trailer에 PII, 가치 라벨 포함 불가 (LLM 출력 검증 테스트)
- [ ] EnergyLevel LOW 시 Distance/Level 자동 조정 (불변 조건)
- [ ] 거절 사유가 다음 매칭에 실제 반영되는 E2E 검증
- [ ] 빌드/테스트/린트 클린

---

## V3-P4: 대화 UX 개선

**Goal**: 대화 중 UX 혁신 — 스캐폴딩 플레이스홀더, Coach 버튼, 밑줄 긋기+자동 인용, 개선된 톤 체크.

**Non-goals**: Reflection 단계는 V3-P5에서 별도 처리.

### Domain Layer 변경

- [ ] `ScaffoldTemplate` VO — 단계별 스캐폴딩 플레이스홀더 텍스트
  - POSITION 단계: "나는 ____에 대해 ____라고 생각해요. 왜냐하면 _______"
  - QUESTION 단계: "[인용된 텍스트]라고 하셨는데, ____?"
  - 단계별 Coach 시나리오 3종 (입장부터/경험부터/질문부터)
- [ ] `CoachSuggestion` VO — Coach 버튼 탭 시 표시되는 3개 시작 방법
  - method(POSITION_FIRST/EXPERIENCE_FIRST/QUESTION_FIRST), template text
- [ ] `Highlight` Entity — 밑줄 긋기 데이터
  - `startOffset`, `endOffset`, `highlightedText`, `turnId`
  - `Highlight.toAutoQuote()`: 인용 텍스트 → 질문 프리픽스 자동 생성
- [ ] `ToneCheckResult` VO 개선 — "경고" → "제안" 프레이밍
  - `originalText`, `suggestedText`, `userChoice`(USE_SUGGESTION / SEND_ORIGINAL)
  - 0.5초 지연 후 표시 로직 (도메인 규칙)
- [ ] `ReceptivenessTemplate` VO — 수용성 템플릿 텍스트 풀
  - "제가 이해한 게 맞나요? ____ 라는 건가요?"
  - "그 부분이 흥미로운데, 좀 더 설명해주실 수 있나요?"

### Application Layer 변경

- [ ] `GetScaffoldForStepUseCase` — 현재 대화 단계 → 적절한 스캐폴딩 반환
- [ ] `GetCoachSuggestionsUseCase` — Coach 버튼 탭 시 3개 시작 방법 반환
- [ ] `CreateHighlightUseCase` — 텍스트 선택 범위 → Highlight 저장 + 자동 인용 생성
- [ ] `CheckToneUseCase` 개선 — 0.5초 지연 규칙, "제안" 프레이밍, 원래대로 보내기 옵션 추가
- [ ] `SuggestReceptivenessTemplateUseCase` — 현재 맥락에 맞는 수용성 템플릿 추천

### Infrastructure Layer 변경

- [ ] `HighlightRepository` 구현 — highlights 테이블
- [ ] 톤 체크 LLM 프롬프트 개선 — "경고" 톤 → "제안" 톤 프롬프트 변경
  - "이렇게도 표현할 수 있어요:" (제안)
  - [이 표현 사용하기] + [원래대로 보내기] 항상 양쪽 제공

### Presentation Layer 변경

- [ ] **스캐폴딩 플레이스홀더** — 입력 단계별 플레이스홀더 텍스트 (반투명, 입력 시 사라짐)
- [ ] **Coach 버튼** — 💡 "어떻게 쓸지 막막해요" → 탭 시 3개 방법 바텀시트
- [ ] **밑줄 긋기** — 상대 텍스트 드래그 → "밑줄" 팝업 → 질문 박스에 자동 인용 삽입
  - 텍스트 셀렉션 핸들링 (모바일/데스크톱)
  - 인용 프리픽스: `"[인용 텍스트]"라고 하셨는데,`
  - 인용 없이도 질문 가능 (강제 아님)
- [ ] **개인적 맥락 1줄** — "내가 이 생각을 갖게 된 경험 1줄" 선택형 입력 필드 + 예시 플레이스홀더
- [ ] **개선된 톤 체크 UI**
  - 전송 버튼 클릭 후 0.5초 지연
  - "잠깐, 한 가지 제안이 있어요" 카드
  - 현재 문장 / 대안 문장 비교
  - [이 표현 사용하기] [원래대로 보내기] 양쪽 버튼
- [ ] **수용성 템플릿 추천** — 📎 아이콘 + 추천 문장 + [이 표현 사용하기] 버튼

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | ScaffoldTemplate, CoachSuggestion, Highlight, ToneCheckResult | >=90% |
| Unit | CreateHighlightUseCase, CheckToneUseCase | >=80% |
| Component | Coach 바텀시트, 밑줄+자동 인용, 톤 체크 카드 | Render + interaction |
| Integration | 밑줄 → 자동 인용 → 질문 전송 E2E | Critical paths |

### Quality Gate

- [ ] 밑줄은 강제가 아닌 선택임 (인용 없이 질문 가능 테스트)
- [ ] 톤 체크에 항상 "원래대로 보내기" 옵션 존재 (자율성 보장)
- [ ] PII scrubber가 "개인적 맥락 1줄"에 적용됨
- [ ] 빌드/테스트/린트 클린

---

## V3-P5: Reflection 전면 개편

**Goal**: Reflection을 "숙제"가 아닌 "마지막 2분 발견"으로 리프레이밍. R1(퀴즈→주관식), R2(슬라이더 검증), R3(역할극 Steelman), R4(공통점 발견).

**Non-goals**: 공동 요약 카드 애니메이션은 V3-P6에서 구현.

### Domain Layer 변경

- [ ] `ReflectionQuiz` Entity — R1 객관식 퀴즈
  - `options[]`: LLM이 대화 내용 기반으로 자동 생성하는 4개 선택지
  - `correctOption`: 실제 상대 핵심 주장에 해당하는 옵션
  - `ReflectionQuiz.generate(dialogueContent)`: 퀴즈 자동 생성 (LLM)
- [ ] `MutualVerification` VO — R2 상호 검증
  - `summarizedByOpponent`: 상대가 작성한 내 입장 요약
  - `accuracySlider`: 0~100 (😐~😊)
  - `correctionText?`: "조금 다른 부분은: ___" (선택)
  - 수정 제안이 상대에게 실제 전달되는 규칙
- [ ] `RoleplaySteelman` VO — R3 역할극
  - `oppositeRolePrompt`: "AI 일자리 감소 우려론자라면, 내 주장의 가장 약한 부분은:"
  - `userResponse?`: 사용자 작성 텍스트
  - `isSkipped`: 건너뛰기 여부
  - 점진적 강제 규칙: 첫 3회 선택 → 이후 Understanding Score 기반 강제 전환
- [ ] `CommonGroundDiscovery` VO — R4 공통점 발견
  - `mostConvincingPoint?`: "상대방의 주장 중 가장 설득력 있었던 부분"
  - `nextQuestion?`: "다음엔 ___를 더 묻고 싶다" → 재매칭 시 출발점
- [ ] `ReflectionFlow` Entity 개편 — R1→R2→R3→R4 순서 관리 + 단계별 강제/선택 정책

### Application Layer 변경

- [ ] `GenerateReflectionQuizUseCase` — 대화 내용 → LLM → 4개 선택지 + 정답 생성
- [ ] `SubmitQuizAnswerAndTextUseCase` — 객관식 답변 → 피드백 → 주관식 전환 유도
- [ ] `SubmitMutualVerificationUseCase` — 슬라이더 값 + 수정 제안 → 상대에게 전달
- [ ] `SubmitRoleplaySteelmanUseCase` — 역할극 응답 저장 + Understanding Score 반영
- [ ] `SaveCommonGroundUseCase` — R4 응답 저장 + "다음에 묻고 싶은 질문" 재매칭 연결
- [ ] `DetermineReflectionPolicyUseCase` — 사용자 대화 횟수 + Understanding Score → R3 강제/선택 결정

### Infrastructure Layer 변경

- [ ] LLM 퀴즈 생성 프롬프트 — 대화 원문 → 4개 선택지 + 정답 (중립 톤, 가치 판단 없음)
- [ ] LLM 역할극 프롬프트 — stance_vector에서 반대 입장 힌트 생성
- [ ] `mutual_verifications` 테이블 — slider_value, correction_text, delivered_to_opponent
- [ ] `reflection_quizzes` 테이블 — options[], correct_option, user_answer
- [ ] `next_questions` 테이블 — text, dialogue_id, used_in_rematch

### Presentation Layer 변경

- [ ] **R1 퀴즈 UI** — "상대방이 가장 중요하게 생각한 건?" + 4개 라디오 버튼 (10초)
  - 정답/오답 피드백 → "그렇다면 상대의 핵심 주장을 당신 말로 한 문장만요:" 주관식 전환
- [ ] **R2 슬라이더 UI** — 상대의 요약 표시 + 😐──────😊 슬라이더 + [수정 제안 추가하기]
- [ ] **R3 역할극 UI** — 🎭 아이콘 + "30초 동안 상대방 입장에서 내 주장을 비판해보세요"
  - 텍스트 입력 + [건너뛰기] + [작성 완료]
  - 첫 3회는 건너뛰기 표시, 이후 조건부 숨김
- [ ] **R4 공통점 UI** — "상대방의 주장 중 가장 설득력 있었던 부분" (선택)
- [ ] **"거의 다 왔어요! 마지막 2분"** Progress 강조 헤더

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | ReflectionQuiz, MutualVerification, RoleplaySteelman, CommonGroundDiscovery | >=90% |
| Unit | GenerateReflectionQuizUseCase, DetermineReflectionPolicyUseCase | >=80% |
| Integration | 퀴즈 생성 → 주관식 전환 → 검증 → 역할극 E2E | Critical paths |
| Component | R1~R4 각 UI 단계별 렌더링 + 인터랙션 | Render + flow |

### Quality Gate

- [ ] R1 퀴즈 선택지가 항상 4개 (LLM 출력 검증)
- [ ] R2 수정 제안이 상대에게 실제 전달됨 (E2E)
- [ ] R3 점진적 강제: 첫 3회 선택 → 이후 Understanding Score 기반 (조건 테스트)
- [ ] 전체 Reflection이 2분 이내로 완료 가능한 UX 흐름
- [ ] 빌드/테스트/린트 클린

---

## V3-P6: Peak-End 카드 + 공동 요약

**Goal**: 대화 종료의 감정적 경험을 설계 — 공동 요약 카드(합쳐지는 애니메이션), 상대 한 문장 선물(Gift Message), Blind Spot Discovery, 슬라이더 KPI 수집.

**Non-goals**: 공유 기능 (카드 이미지 공유는 V3-P2에서 처리된 인프라 활용).

### Domain Layer 변경

- [ ] `JointSummaryCard` Entity — 공동 요약 카드
  - `agreedPoints[]`: "우리가 동의한 것" (LLM 추출)
  - `disagreedPoints[]`: "우리가 다르게 본 것" (LLM 추출)
  - `sharedQuestion?`: "함께 더 알고 싶은 질문" (R4에서 가져옴)
  - `JointSummaryCard.generate(dialogueContent, reflections)`: LLM 자동 생성
- [ ] `GiftMessage` VO — 상대에게 남기는 한 문장
  - `text`: 한 문장 (100자 제한)
  - `writtenAtStep`: 작성 시점 (QUESTION 단계 이후)
  - `revealedAtPeakEnd`: Peak-End 카드에서 공개 여부
  - PII scrubber 적용
- [ ] `BlindSpotDiscovery` VO — 이번 대화에서 처음 접한 관점
  - `discoveredConcept`: LLM 추출 텍스트
  - `BlindSpotDiscovery.extract(userTurns, opponentTurns)`: 추출 로직
  - 추출 기준: 상대 발화에만 있고, 사용자 발화에 유사 표현 없는 개념
  - "메커니즘/관점" 레벨로만 추출 (가치판단 아님)
- [ ] `PeakEndKPI` VO — KPI 수집 (2문항)
  - `feelHeardSlider`: 0~100 (😕~😊 "상대가 내 말을 이해했나요?")
  - `rematchIntentSlider`: 0~100 (🙅~🙋 "이 사람과 더 이야기하고 싶나요?")
  - Affective Warmth = rematchIntentSlider의 행동 프록시 (별도 문항 없음)
- [ ] `NextQuestionSave` VO — "다음에 묻고 싶은 질문" 저장
  - `questionText`: 텍스트
  - `linkedToDialogueId`: 현재 대화 ID
  - 재매칭 시 이 질문으로 시작하는 규칙
- [ ] `PeakEndFlow` Entity — 전체 Peak-End 플로우 관리
  - 순서: 공동요약 → PEAK①(선물) → PEAK②(Blind Spot) → END(KPI) → NEXT(질문 저장)

### Application Layer 변경

- [ ] `GenerateJointSummaryUseCase` — 대화+Reflection → LLM → 공동 요약 카드
- [ ] `WriteGiftMessageUseCase` — 대화 중 Gift Message 작성 (QUESTION 단계 이후)
- [ ] `RevealGiftMessageUseCase` — Peak-End 시점에 상대 Gift 공개
- [ ] `ExtractBlindSpotUseCase` — 대화 내용 → LLM → Blind Spot 추출
- [ ] `CollectPeakEndKPIUseCase` — 슬라이더 값 수집 + Feel Heard Score / Affective Warmth 계산
- [ ] `SaveNextQuestionUseCase` — "다음에 묻고 싶은 질문" 저장 → 재매칭 시 활용 표시

### Infrastructure Layer 변경

- [ ] LLM 공동 요약 프롬프트 — 양측 Reflection + 대화 원문 → 동의/이견/공동 질문
- [ ] LLM Blind Spot 추출 프롬프트 — 사용자 발화에 없는 상대 개념 추출 (가치판단 배제)
- [ ] `joint_summaries` 테이블
- [ ] `gift_messages` 테이블 — sender_id, receiver_id, text, revealed_at
- [ ] `blind_spots` 테이블 — user_id, dialogue_id, concept_text
- [ ] `peak_end_kpis` 테이블 — feel_heard, rematch_intent
- [ ] `next_questions` 테이블 — text, dialogue_id, used_in_rematch_id

### Presentation Layer 변경

- [ ] **공동 요약 카드** — ✅ 동의 / 💬 차이 / ❓ 공동 질문 3섹션
  - 합쳐지는 애니메이션: 동의 항목 2개 버블이 합쳐지는 시각 효과 (Framer Motion)
  - 소프트 효과음 on/off 토글
  - [카드 저장] [공유하기]
- [ ] **Gift Message 작성 UI** — 단계 2(경청) 완료 직후, 작은 텍스트로 배경 안내
  - "대화 마지막에 상대에게 한 문장을 남길 수 있어요. 지금 써두면 나중에 전달돼요. (선택)"
- [ ] **PEAK① Gift 공개 UI** — 💌 "상대방이 당신에게 남긴 한 마디" + 서프라이즈 카드
- [ ] **PEAK② Blind Spot UI** — 🔍 "오늘의 발견" + [이 주제 더 탐색하기] + [저장]
- [ ] **KPI 슬라이더 UI** — 2문항 이모지 앵커 슬라이더 (10초 목표)
  - "상대가 내 말을 이해했나요?" 😕──😊
  - "이 사람과 더 이야기하고 싶나요?" 🙅──🙋
- [ ] **최종 화면** — Understanding Score + Feel Heard + Receptiveness Points
  - Primary CTA: "다음 대화 찾기 →"
  - 조건부: [이 사람과 친구 되기]
- [ ] **"다음에 묻고 싶은 질문" UI** — 💭 텍스트 입력 + "저장하면 재매칭 시 이 질문으로 시작해요"

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | JointSummaryCard, GiftMessage, BlindSpotDiscovery, PeakEndKPI, NextQuestionSave | >=90% |
| Unit | 모든 UseCase | >=80% |
| Integration | Reflection 완료 → 공동요약 → Peak-End 전체 플로우 | Critical paths |
| Component | 애니메이션 카드, Gift 공개, 슬라이더 KPI | Render + interaction |

### Quality Gate

- [ ] Gift Message에 PII scrubber 적용됨
- [ ] Blind Spot이 "메커니즘/관점" 레벨만 추출 (가치판단 배제 테스트)
- [ ] KPI 수집이 2문항 10초 이내로 완료 가능
- [ ] Affective Warmth를 별도 문항으로 묻지 않음 (rematch slider로 프록시)
- [ ] 빌드/테스트/린트 클린

---

## V3-P7: 나쁜 경험 복구 루틴

**Goal**: Feel Heard Score < 2 또는 감정 체크인 부정 응답 시 즉시 복구 루틴 표시. 영구 이탈 방지.

**Non-goals**: 신고/차단 시스템 (이미 v2.0에서 구현).

### Domain Layer 변경

- [ ] `BadExperienceDetector` VO — 나쁜 경험 감지 조건
  - `feelHeardScore < 2` OR `emotionalCheckin.isNegative`
  - `BadExperienceDetector.shouldTrigger(peakEndKPI, emotionalCheckin)`: 트리거 판단
- [ ] `RecoveryAction` VO — 구체적 행동 변화 약속
  - `topicLevel`: Level 0 (가벼운 주제)로 자동 다운그레이드
  - `distanceBand`: 0.2~0.3으로 최소화
  - `facilitatorIntensity`: 최대로 설정
  - `dialogueExcluded`: 이번 대화를 기록에서 제거 (기록 치우기)
- [ ] `RecoveryRoutine` Entity — 복구 루틴 전체
  - 3원칙: 사과 안 함, 구체적 행동 변화 명시, 즉시 재시작 강요 안 함
  - `nextMatchAdjustment`: 자동 매칭 파라미터 조정

### Application Layer 변경

- [ ] `DetectBadExperienceUseCase` — KPI + 감정 체크인 → 나쁜 경험 판단
- [ ] `ApplyRecoveryRoutineUseCase` — 복구 조치 적용 (다음 매칭 자동 조정)
- [ ] `ExcludeDialogueFromRecordUseCase` — "이번 대화는 기록에서 치울게요" 처리

### Presentation Layer 변경

- [ ] **복구 루틴 UI**
  - "오늘 대화가 불편했다니 속상하네요."
  - "이번 대화는 기록에서 치울게요. ✓"
  - 구체적 행동 변화 리스트 (Level 0 / 최소 거리 / 꼼꼼 확인)
  - "지금 당장 새로 시작할 필요 없어요."
  - [나중에 다시 보기] + [바로 찾아봐요] (양쪽 동등)

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | BadExperienceDetector, RecoveryAction, RecoveryRoutine | >=90% |
| Unit | DetectBadExperienceUseCase, ApplyRecoveryRoutineUseCase | >=80% |
| Integration | Feel Heard < 2 → 복구 트리거 → 다음 매칭 조정 | Critical paths |

### Quality Gate

- [ ] "사과" 문구가 없음 (플랫폼 책임 과잉 표현 금지)
- [ ] 즉시 재시작 CTA가 강요되지 않음 (양쪽 버튼 동등)
- [ ] 다음 매칭이 실제로 Level 0, Distance 0.2~0.3으로 조정됨
- [ ] 빌드/테스트/린트 클린

---

## V3-P8: 상태 기반 홈 + 리텐션 루프

**Goal**: 재방문 시 "지금 뭘 할 수 있는가"가 명확한 상태 기반 홈 화면 + D+1 복기, D+7 Passport, 알림 3종.

**Non-goals**: Stance Drift (V3-P11에서 처리).

### Domain Layer 변경

- [ ] `HomeState` VO — 사용자 상태 6종
  - `FIRST_VISIT` → Thought Map 생성 CTA
  - `MAP_COMPLETED` → 매칭 추천 카드
  - `WAITING_MATCH` → 대기 중 + 예상 시간
  - `POST_DIALOGUE_D1` → 대화 복기 카드
  - `HAS_FRIENDS` → 라이트 프로토콜 추천
  - `RETURNING_AFTER_14D` → 재온보딩
  - `HomeState.determine(userProfile)`: 상태 결정 로직
- [ ] `DialogueReplayCard` VO — D+1 복기 카드
  - `opponentKeyStatement`: 상대의 핵심 발언
  - `topic`: 대화 주제
  - `userThoughtChange`: "여전히 잘 모르겠어요" / "좀 더 생각하게 됐어요" / "내 생각이 조금 바뀌었어요"
  - "내 생각이 바뀌었어요" 선택 시 → stance_vector 재측정 유도 (강제 아님)
- [ ] `PerspectivePassport` Entity — 누적 탐험 지도
  - `weeklyExploredCount`: 이번 주 탐험 관점 수
  - `totalExploredCount`: 누적 관점 수
  - `discoveredConcepts[]`: 새로 발견한 개념 목록
  - 스트릭(연속 접속) 없음 — 축적 지도만
- [ ] `JourneyProgress` VO — 상단 여정 표시
  - Phase 1: "내 생각 지도 만들기" (✓ / →)
  - Phase 2: "1번 대화 완료"
  - Phase 3: "좋은 대화 상대 저장"
  - 각 Phase는 "다음 행동 하나만 제안"
- [ ] `NotificationType` enum — INSIGHT / CURIOSITY / ACTION
- [ ] `NotificationTemplate` VO — 알림 3종 템플릿
  - INSIGHT: 집계/정직한 규범 정보 (K-anonymity 검증 필수)
  - CURIOSITY: 오해교정 예측게임 유입
  - ACTION: 대화 초대 + 난이도 포함
- [ ] `NotificationPreference` VO — 기본값 "핵심만 (주 1~2회)", 끄기/빈도 조절

### Application Layer 변경

- [ ] `DetermineHomeStateUseCase` — 사용자 프로필 → HomeState 결정
- [ ] `GenerateReplayCardUseCase` — D+1 시점에 복기 카드 생성
- [ ] `UpdatePerspectivePassportUseCase` — D+7 시점에 Passport 업데이트
- [ ] `HandleThoughtChangeResponseUseCase` — "바뀌었어요" → stance 재측정 유도
- [ ] `BuildNotificationUseCase` — 알림 타입별 템플릿 조립
- [ ] `CheckNotificationEligibilityUseCase` — K-anonymity, 빈도 제한 확인
- [ ] `ManageNotificationPreferenceUseCase` — 설정 관리

### Infrastructure Layer 변경

- [ ] `perspective_passports` 테이블
- [ ] `dialogue_replay_responses` 테이블 — thought_change, triggered_re_measurement
- [ ] `notification_preferences` 테이블
- [ ] `notifications` 테이블 — type, template_data, sent_at
- [ ] 스케줄러: D+1 / D+7 알림 트리거 (Vercel Cron 또는 Supabase Edge Function)

### Presentation Layer 변경

- [ ] **상태 기반 홈 화면** — HomeState별 6가지 레이아웃
  - FIRST_VISIT: Thought Map CTA 히어로
  - MAP_COMPLETED: 매칭 추천 카드
  - WAITING_MATCH: "대화 상대를 찾고 있어요" + 예상 시간
  - POST_DIALOGUE_D1: 대화 복기 카드
  - HAS_FRIENDS: 라이트 프로토콜 추천
  - RETURNING_AFTER_14D: "오랜만이에요" 재온보딩
- [ ] **상단 여정 Progress** — 3단계 체크리스트 (가벼운 progress bar)
- [ ] **D+1 복기 카드 UI** — 상대 핵심 발언 + 3개 응답 선택 + "또 다른 대화 찾기" CTA
- [ ] **D+7 Perspective Passport UI** — 이번 주 탐험 관점 수 + 누적 + 새 발견 목록
- [ ] **알림 설정 UI** — 3종 알림 on/off + "핵심만/모두/끄기" 빈도 선택

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | HomeState, DialogueReplayCard, PerspectivePassport, JourneyProgress, NotificationType/Template | >=90% |
| Unit | 모든 UseCase | >=80% |
| Integration | 상태 변화 → 홈 화면 렌더링 전환 | Critical paths |
| Component | 홈 6종 레이아웃, D+1 카드, D+7 Passport | Render + interaction |

### Quality Gate

- [ ] 6가지 HomeState가 모두 올바르게 결정됨 (상태 전이 테스트)
- [ ] INSIGHT 알림에 K-anonymity 검증 통과 (최소 15명)
- [ ] 스트릭/연속 접속 지표 없음 (축적만)
- [ ] 알림 기본값이 "핵심만" (다크패턴 방지)
- [ ] 빌드/테스트/린트 클린

---

## V3-P9: 이벤트 로깅 택소노미

**Goal**: v3.0 기획서 Appendix B의 전체 이벤트 택소노미를 도메인 레이어에서 정의하고, 인프라 레이어에서 로깅 파이프라인 구축.

**Non-goals**: 분석 대시보드 (별도 도구 연동).

### Domain Layer 변경

- [ ] `AnalyticsEvent` 도메인 이벤트 계층 구조
  - **Phase 1 이벤트 (12종)**:
    - `TrustMomentViewed`, `TrustMomentMoreClicked`
    - `WarmupViewed`, `WarmupSkipped`, `WarmupCompleted`
    - `OnboardingModeSelected(mode)` — 5/10/20
    - `OnboardingQuestionViewed(qId, qType, axis, variant)`
    - `OnboardingQuestionAnswered(qId, qType, axis, variant)`
    - `PrecisionMeterViewed`, `PrecisionUpgradeClicked`
    - `ThoughtMapViewed`, `ThoughtMapShareClicked`, `ShareTypeSelected(type)`, `ShareCompleted(type)`
    - `MisperceptionViewed`, `MisperceptionPredictSubmitted`, `MisperceptionResultViewed`
    - `NextStepHubViewed`, `CTAMatchClicked`, `CTAPrecisionClicked`, `CTADeepDiveClicked`
  - **Phase 2 이벤트 (30종)**:
    - 매칭: `MatchCardImpression`, `MatchAccepted`, `MatchDeclined`, `DeclineReasonSubmitted(reason)`
    - 에너지: `EnergyCheckSelected(level)`
    - 대화: `DialogueStepViewed(step)`, `DialogueStepCompleted(step)`
    - Coach: `CoachButtonTapped`, `ScaffoldUsed`
    - 밑줄: `HighlightCreated`, `HighlightAutoCited`
    - 톤 체크: `ToneCheckShown`, `ToneCheckAccepted`, `SentAnyway`
    - 수용성: `ReceptiveTemplateInserted`
    - Reflection: `R1QuizAnswered`, `R1TextSubmitted`, `R2SliderMoved`, `R2CorrectionAdded`, `R3RoleplayStarted`, `R3Submitted`, `R3Skipped`
    - 요약: `JointSummaryViewed`, `JointSummaryShared`
    - Gift: `GiftMessageWritten`, `GiftMessageReceived`
    - Blind Spot: `BlindSpotViewed`, `BlindSpotSaved`
    - KPI: `PeakEndKPISubmitted(feelHeard, rematchIntent)`
    - 질문: `NextQuestionSaved`, `NextQuestionSkipped`
    - 복구: `BadExperienceTriggered`, `BadExperienceCTAClicked`
    - 복기: `D1ReplayViewed`, `D1ReplayResponsed`, `D7PassportViewed`, `D7PassportNewConversation`
  - **Phase 3 이벤트 (6종)**:
    - `FriendRequestPromptViewed`, `FriendRequestSent`, `FriendRequestMatched`
    - `LightProtocolStarted`, `LightProtocolCompleted`
    - `RealtimeChatStarted`
    - `OfflineMeetEligible`, `OfflineMeetRSVP`
    - `StanceDriftOptedIn`, `StanceDriftNotificationViewed`
- [ ] `EventMetadata` VO — 공통 메타데이터 (userId, timestamp, sessionId, deviceType, appVersion)

### Application Layer 변경

- [ ] `TrackEventUseCase` — 이벤트 수집 + 메타데이터 부착
- [ ] `EventEmitter` Port interface — 인프라 레이어 구현 위임

### Infrastructure Layer 변경

- [ ] `EventEmitter` 구현 — 이벤트 큐잉 + 배치 전송
  - 로컬 버퍼 (30초 또는 10개 이상일 때 flush)
  - Supabase 또는 외부 분석 서비스 연동
- [ ] `analytics_events` 테이블 — event_type, payload(jsonb), metadata, created_at
- [ ] 이벤트 검증 미들웨어 — 필수 필드 누락 시 에러 로깅

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | 모든 이벤트 VO, EventMetadata | >=90% |
| Unit | TrackEventUseCase | >=80% |
| Integration | 이벤트 발행 → 큐잉 → 저장 E2E | Critical paths |

### Quality Gate

- [ ] 모든 이벤트에 EventMetadata 필수 포함
- [ ] PII가 이벤트 payload에 포함되지 않음
- [ ] 기획서 Appendix B의 48+ 이벤트 전수 커버
- [ ] 빌드/테스트/린트 클린

---

## V3-P10: 마이크로카피 + A/B 인프라

**Goal**: 페이지 전환 마이크로카피 라이브러리 구축 + Feature Flag 기반 A/B 테스트 프레임워크.

**Non-goals**: 실제 A/B 실험 실행 (인프라만 구축).

### Domain Layer 변경

- [ ] `Microcopy` VO — 카피 텍스트 + 노출 위치(전환 지점만) + 프레임 타입(자율성/호기심/유능감)
  - 노출 원칙: 페이지마다 무조건 ❌ → 로딩/대기/Reflection 진입/종료 전환 지점만 ✅
  - 안전/자율/호기심/유능감 톤만 허용
- [ ] `MicrocopyLibrary` — 카피 풀 관리 + 랜덤/순차/A/B 노출 정책
  - 사전 정의 카피 6종:
    - "설득이 아니라, **이해**가 목표예요."
    - "불편하면 언제든 **난이도를 낮출 수 있어요.**"
    - "상대는 당신의 **개인정보를 모릅니다.**"
    - "오늘은 **가볍게 5분**만 해도 충분해요."
    - "대화 후엔 **한 장 요약 카드**가 남아요."
    - "오늘의 발견이 내일의 당신을 조금 바꿀 수 있어요."
- [ ] `FeatureFlag` VO — 기능 플래그 (name, enabled, variant, rolloutPercentage)
- [ ] `ABExperiment` Entity — 실험 정의
  - `experimentId`, `name`, `variants[]`, `primaryMetric`, `guardrailMetric`
  - `ABExperiment.assignVariant(userId)`: 사용자별 variant 할당 (deterministic hash)
- [ ] `ExperimentAssignment` VO — 사용자-실험-variant 매핑

### Application Layer 변경

- [ ] `GetMicrocopyForContextUseCase` — 현재 전환 지점 → 적절한 마이크로카피 반환
- [ ] `CheckFeatureFlagUseCase` — Feature Flag 확인
- [ ] `GetExperimentVariantUseCase` — 사용자 → 실험 variant 할당/조회
- [ ] `RecordExperimentExposureUseCase` — 실험 노출 기록

### Infrastructure Layer 변경

- [ ] `feature_flags` 테이블 — name, enabled, variant_config, rollout_pct
- [ ] `experiment_assignments` 테이블 — user_id, experiment_id, variant, assigned_at
- [ ] `experiment_exposures` 테이블 — user_id, experiment_id, variant, exposed_at
- [ ] Feature Flag 미들웨어 — 서버 컴포넌트에서 플래그 확인

### Presentation Layer 변경

- [ ] `<Microcopy context="loading|waiting|reflection-enter|dialogue-end" />` 컴포넌트
- [ ] `useFeatureFlag(name)` 훅
- [ ] `useExperiment(experimentId)` 훅 — variant 반환 + 자동 exposure 기록

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | Microcopy, FeatureFlag, ABExperiment, ExperimentAssignment | >=90% |
| Unit | 모든 UseCase | >=80% |
| Integration | variant 할당 → exposure 기록 → 메트릭 연결 | Critical paths |

### Quality Gate

- [ ] 마이크로카피가 전환 지점에만 노출 (페이지 전체 노출 금지)
- [ ] A/B variant 할당이 deterministic (같은 userId → 같은 variant)
- [ ] Feature Flag 꺼짐 시 기본 동작 보장
- [ ] 빌드/테스트/린트 클린

---

## V3-P11: Stance Drift + Perspective Passport 고도화

**Goal**: 옵트인 기반 Stance Drift 알림 + Perspective Passport의 누적 탐험 지도 고도화.

**Non-goals**: 자동 stance 업데이트 (항상 사용자 동의 필요).

### Domain Layer 변경

- [ ] `StanceDrift` Entity — 시간 경과에 따른 stance_vector 변화 추적
  - `driftByAxis[]`: 축별 이동량 (현재 vs 이전)
  - 발송 기준:
    - 최소 4회 이상 대화 후에만
    - 동일 축에서 0.2 이상 이동 시에만
    - 월 1회 이하 빈도 제한
- [ ] `StanceDriftPreference` VO — 옵트인 상태 + "언제든 끄고 삭제 가능"
- [ ] `StanceDriftNotification` VO — 알림 텍스트
  - "4주 전보다 기술 규제 이슈에서 당신의 입장이 중도에 가까워졌어요."
- [ ] `PerspectivePassport` 고도화 — Thought Map 연동 업데이트
  - D+7 업데이트 시 Thought Map 변화 시각적 비교
  - "Thought Map이 조금 업데이트됐어요. [업데이트 확인하기]"

### Application Layer 변경

- [ ] `CalculateStanceDriftUseCase` — 대화 N회 후 drift 계산
- [ ] `CheckDriftNotificationEligibilityUseCase` — 발송 조건 검증 (4회+, 0.2+, 월 1회)
- [ ] `SendDriftNotificationUseCase` — 알림 발송
- [ ] `ManageDriftPreferenceUseCase` — 옵트인/아웃 + 데이터 삭제
- [ ] `UpdatePassportWithThoughtMapUseCase` — Thought Map 변화 반영

### Presentation Layer 변경

- [ ] **Stance Drift 동의 화면** — 첫 1회, 완전 선택
  - 예시 표시 + ⚠️ "언제든 끄고 삭제 가능"
  - [켜기] / [지금은 안 할게요]
- [ ] **Drift 알림 UI** — "4주 전보다 ___에서 ___" + Thought Map 비교 뷰
- [ ] **Perspective Passport 고도화** — Thought Map 변화 오버레이 + 탐험 지도 시각화

### 테스트 전략

| 테스트 유형 | 대상 | 커버리지 |
|------------|------|---------|
| Unit | StanceDrift, StanceDriftPreference, StanceDriftNotification | >=90% |
| Unit | CalculateStanceDriftUseCase, CheckDriftNotificationEligibilityUseCase | >=80% |
| Integration | 대화 4회 완료 → drift 계산 → 알림 발송 E2E | Critical paths |

### Quality Gate

- [ ] 옵트인 없이 drift 데이터 수집/알림 발송 불가
- [ ] 발송 빈도 월 1회 이하 (엄격 제한)
- [ ] "끄고 삭제" 시 모든 drift 데이터 즉시 삭제
- [ ] 빌드/테스트/린트 클린

---

## Architecture Decision Records (ADRs)

### ADR-V3-001: Conversation Trailer LLM 격리

**결정**: Conversation Trailer 생성 시 LLM에 stance_vector만 전달, PII/인구통계/원문 일체 차단.
**근거**: v2.0 ADR의 Facilitator stance 접근 차단 원칙을 Trailer 생성에도 동일 적용.
**구현**: `ConversationTrailerGenerator` 포트의 input 타입에 stanceVector만 포함.

### ADR-V3-002: 이벤트 로깅 PII 제거

**결정**: analytics_events 테이블의 payload에 PII 포함 불가. userId만 anonymized hash로 저장.
**근거**: 프라이버시 by design. 이벤트 분석에 개인 식별 불필요.
**구현**: EventEmitter에서 payload PII scrubber 적용 후 저장.

### ADR-V3-003: A/B Variant Deterministic Assignment

**결정**: userId의 hash 기반 deterministic variant 할당. 세션 간 동일 variant 보장.
**근거**: A/B 실험의 내적 타당성. 같은 사용자가 다른 variant를 경험하면 실험 결과 오염.
**구현**: `ABExperiment.assignVariant(userId)` = hash(userId + experimentId) % variantCount

### ADR-V3-004: 마이크로카피 노출 지점 제한

**결정**: 마이크로카피는 페이지 전환 지점(로딩/대기/Reflection 진입/종료)에만 노출.
**근거**: 매 페이지 노출은 피로감 유발. 전환 지점은 사용자 주의가 자연스럽게 전환되는 순간.
**구현**: `<Microcopy context={...} />` 컴포넌트에 허용 context enum 강제.

### ADR-V3-005: Stance Drift 절제 원칙

**결정**: Drift 알림은 옵트인 전용, 4회 대화 후, 0.2 이상 이동 시, 월 1회 이하.
**근거**: 과도한 "당신이 바뀌었다" 메시지는 정체성 위협 유발. North Star의 "위협 없이"에 부합.
**구현**: `CheckDriftNotificationEligibilityUseCase`에서 4중 조건 AND 검증.

---

## 구현 순서 및 타임라인 추정

```
Week 1-2:  V3-P9 (이벤트 로깅)  +  V3-P10 (마이크로카피/A/B) — 병렬, 인프라 기반
Week 3-4:  V3-P1 (정밀도 사다리 + 질문 Bank)
Week 5-6:  V3-P2 (공유 카드 3종 + Next Step Hub)
Week 7-8:  V3-P3 (매칭 카드 UX)
Week 9-10: V3-P4 (대화 UX 개선)
Week 11-12: V3-P5 (Reflection 전면 개편)
Week 13-14: V3-P6 (Peak-End 카드 + 공동 요약)
Week 15:    V3-P7 (나쁜 경험 복구 루틴)
Week 16-17: V3-P8 (상태 기반 홈 + 리텐션)
Week 18:    V3-P11 (Stance Drift + Passport 고도화)
```

## Risk Assessment

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| LLM Trailer 품질 불안정 | 중간 | 높음 | 프롬프트 A/B 테스트 + 폴백 템플릿 |
| 밑줄 긋기 모바일 UX 어려움 | 높음 | 중간 | 모바일은 탭+홀드 간소화 UX |
| 합쳐지는 애니메이션 성능 이슈 | 낮음 | 낮음 | Framer Motion 최적화 + 저사양 폴백 |
| 이벤트 로깅 데이터량 폭증 | 중간 | 중간 | 배치 전송 + 보관 기간 정책 |
| A/B 테스트 표본 부족 | 높음 | 중간 | 초기는 정성 피드백 병행 |
| Peak-End 카드 플로우 너무 김 | 중간 | 높음 | 각 단계 시간 제한 + 건너뛰기 |

## Progress Tracking

| Phase | Status | Progress |
|-------|--------|----------|
| V3-P1 정밀도 사다리 + 질문 Bank | Pending | 0% |
| V3-P2 공유 카드 3종 + Next Step Hub | Pending | 0% |
| V3-P3 매칭 카드 UX | Pending | 0% |
| V3-P4 대화 UX 개선 | Pending | 0% |
| V3-P5 Reflection 전면 개편 | Pending | 0% |
| V3-P6 Peak-End 카드 + 공동 요약 | Pending | 0% |
| V3-P7 나쁜 경험 복구 루틴 | Pending | 0% |
| V3-P8 상태 기반 홈 + 리텐션 | Pending | 0% |
| V3-P9 이벤트 로깅 택소노미 | Pending | 0% |
| V3-P10 마이크로카피 + A/B 인프라 | Pending | 0% |
| V3-P11 Stance Drift + Passport 고도화 | Pending | 0% |

**Overall: 0%**
