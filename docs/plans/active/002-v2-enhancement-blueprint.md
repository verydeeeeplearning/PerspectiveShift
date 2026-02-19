# PerspectiveShift v2.0 Enhancement Blueprint

**Status**: Complete
**Created**: 2026-02-19
**Last Updated**: 2026-02-19

---

## 1. Overview

v2.0 기획서(`perspectiveshift_v2.md`)에서 새로 추가/변경된 기능을 현재 코드베이스에 반영하는 종합 수정 계획.

### 1.1 North Star

> "내가 틀릴 수도 있다는 위협 없이, 서로를 이해하는 경험을 반복 가능하게 만든다."

### 1.2 현재 상태 요약

| 레이어 | 파일 수 | 상태 |
|--------|---------|------|
| Domain (entities + VOs + interfaces + services) | ~80 | Phase 1-3 v1 + v2 P1-P8 구현 완료 |
| Application (use cases + DTOs + services) | ~70 | Phase 1-3 v1 + v2 P1-P8 구현 완료 |
| Infrastructure (repos + adapters + config) | ~45 | Phase 1-3 v1 + v2 P1-P8 구현 완료 |
| Presentation (pages + components + API routes) | ~65 | Phase 1-3 v1 + v2 P1-P8 구현 완료 |
| Tests | 877 (149 files) | Phase 1-3 v1 + v2 P1-P8 전체 통과 |

### 1.3 v2 변경사항 Gap 분석

v2에서 **신규 추가**되거나 **기존 대비 변경**되는 항목:

#### Phase 1 (Stance Discovery) 변경사항

| # | 항목 | 유형 | 영향 범위 |
|---|------|------|----------|
| 1 | Self-Affirmation Warmup | **신규** | Domain + App + Infra + UI |
| 2 | Stance Profile에 `confidence_map`, `core_value` 추가 | **변경** | Domain + App + Infra |
| 3 | Progressive Profiling (Core 5 → Extended 5 분리) | **변경** | App + UI |
| 4 | Stance 축 6차원 확장 (`opportunity_equality` 추가) | **변경** | Domain + App + Infra |
| 5 | Misperceived Polarization 교정 카드 | **신규** | Domain + App + Infra + UI |
| 6 | 별명(Alias) 시스템 | **신규** | Domain + App + UI |
| 7 | 비교 뷰 5단계 (Level 0-4) | **변경** | App + UI |
| 8 | Instant Micro-Insight (질문 사이 인사이트) | **신규** | App + UI |
| 9 | Adaptive Questioning (LLM 동적 follow-up) | **신규** | App + Infra |
| 10 | Self-Correction Loop (교정 흐름 UX) | **신규** | UI |

#### Phase 2 (Structured Dialogue) 변경사항

| # | 항목 | 유형 | 영향 범위 |
|---|------|------|----------|
| 11 | 적응형 Opinion Distance (Distance-Safety Package) | **변경** | Domain + App |
| 12 | Topic Ladder (난이도 사다리 Level 0-3) | **신규** | Domain + App + UI |
| 13 | "Micro-Debate" → "Perspective Exchange" 명칭 변경 | **변경** | 전체 |
| 14 | 대화 Step 0: Self-affirmation 재확인 | **신규** | Domain + App + UI |
| 15 | 입장 제시: "개인적 맥락 1문장" 템플릿 | **신규** | Domain + App + UI |
| 16 | 수용성 템플릿 추천 (Receptiveness Template) | **신규** | App + Infra + UI |
| 17 | 강화된 Reflection (R1-R5 구조) | **변경** | Domain + App + UI |
| 18 | 공동 요약 카드 (Joint Summary) | **신규** | Domain + App + Infra + UI |
| 19 | Feel Heard Score | **신규** | Domain + App + UI |
| 20 | Affective Warmth | **신규** | Domain + App + UI |
| 21 | Facilitator 설득 방지 아키텍처 (stance data 접근 차단) | **변경** | Infra |
| 22 | Effort Gradient (5분/15분/30분+ 포맷) | **신규** | Domain + App + UI |
| 23 | 공동 목표 명시 UX | **신규** | UI |
| 24 | Receptiveness Points (유능감 트래킹) | **신규** | Domain + App |
| 25 | 1주 후 재측정 체크인 | **신규** | App + Infra + UI |

#### Phase 3 (Relationship Escalation) 변경사항

| # | 항목 | 유형 | 영향 범위 |
|---|------|------|----------|
| 26 | 라이트 프로토콜 3종 (Common Ground / Joint Question / Switch Sides) | **신규** | Domain + App + Infra + UI |
| 27 | 실시간 대화 오픈 조건 변경 (라이트 프로토콜 1회+ 필수) | **변경** | Domain + App |
| 28 | 20분마다 마이크로 체크인 (실시간 대화) | **신규** | App + Infra + UI |
| 29 | 오프라인 만남: 공동 산출물 포맷 ("관점 카드 5개") | **신규** | Domain + App + UI |
| 30 | 그룹 만남 우선 + 1:1 조건 강화 | **변경** | Domain + App |

#### 공통 / 인프라 변경사항

| # | 항목 | 유형 | 영향 범위 |
|---|------|------|----------|
| 31 | Selective Attrition 분석 프레임 | **신규** | App + Infra |
| 32 | KPI 3층 분리 (경험/인지/정서) | **신규** | Domain + Infra |
| 33 | Fatigue 감지 + 쿨다운 모드 | **신규** | Domain + App + Infra |
| 34 | LLM 평가 운영 지표 4종 | **신규** | Infra |
| 35 | Conversation Highlights (커뮤니티 공유 준비) | **미래 준비** | - |

---

## 2. 구현 Phase 분할

총 **8 Phase**, Phase별 별도 문서로 관리.

| Phase | 문서 | 주제 | 예상 규모 | 선행 조건 |
|-------|------|------|----------|----------|
| V2-P1 | `002-v2-phase1-self-affirmation.md` | Self-Affirmation Warmup + Core Value | Small | 없음 |
| V2-P2 | `002-v2-phase2-stance-profile-v2.md` | Stance Profile 확장 (6차원 + confidence_map) + Progressive Profiling | Medium | V2-P1 |
| V2-P3 | `002-v2-phase3-thought-map-v2.md` | 별명 시스템 + Misperception 교정 카드 + 비교 뷰 확장 | Medium | V2-P2 |
| V2-P4 | `002-v2-phase4-adaptive-matching.md` | 적응형 매칭 (Distance-Safety Package) + Topic Ladder + Effort Gradient | Large | V2-P2 |
| V2-P5 | `002-v2-phase5-perspective-exchange.md` | Perspective Exchange 구조 개편 (Step 0 + 맥락 1문장 + 수용성 템플릿 + 강화된 Reflection) | Large | V2-P4 |
| V2-P6 | `002-v2-phase6-feedback-metrics.md` | Feel Heard Score + Affective Warmth + Receptiveness Points + 1주 후 체크인 | Medium | V2-P5 |
| V2-P7 | `002-v2-phase7-light-protocol.md` | 라이트 프로토콜 3종 + 실시간 대화 조건 변경 + 마이크로 체크인 | Medium | V2-P6 |
| V2-P8 | `002-v2-phase8-analytics-safety.md` | Selective Attrition 분석 + KPI 3층 + Fatigue 감지 + Facilitator 설득 방지 강화 | Medium | V2-P5 |

### 2.1 의존성 그래프

```
V2-P1 (Self-Affirmation)
  │
  ▼
V2-P2 (Stance Profile v2)
  │
  ├─────────────┐
  ▼             ▼
V2-P3          V2-P4
(Thought Map)  (Adaptive Matching)
  │             │
  │             ▼
  │           V2-P5
  │           (Perspective Exchange)
  │             │
  │             ├──────────┐
  │             ▼          ▼
  │           V2-P6      V2-P8
  │           (Feedback)  (Analytics)
  │             │
  │             ▼
  │           V2-P7
  │           (Light Protocol)
  │
  └──── (독립, V2-P2 후 언제든 가능)
```

---

## 3. Architecture Decision Records (ADRs)

### ADR-001: Self-Affirmation 데이터 모델

**결정**: Self-Affirmation을 별도 Value Object(`SelfAffirmation`)로 모델링하고, `StanceProfile`에 합성.
**근거**: 온보딩과 대화 전 둘 다에서 재사용. 독립 측정 메트릭(참여율) 필요.

### ADR-002: Confidence Map 저장 방식

**결정**: `StanceVector`에 `confidenceMap: Record<StanceDimension, ConfidenceLevel>` 추가. 기본값 `MEDIUM`.
**근거**: Extended 질문 미참여 시에도 매칭 가능해야 함. Nullable보다 기본값이 로직 단순화에 유리.

### ADR-003: Topic Ladder Level을 Domain Entity로

**결정**: `TopicLevel` Value Object (0-3) + `TopicLadderPolicy` Domain Service.
**근거**: Distance-Safety Package가 Topic Level에 의존. 비즈니스 로직이므로 Domain에 위치.

### ADR-004: Reflection 강화 — 기존 FSM 확장 vs 새 Entity

**결정**: 기존 `DialogueSession` FSM에 Reflection sub-steps 추가. 새 Entity 불필요.
**근거**: Reflection은 대화의 마지막 Step. 분리하면 트랜잭션 경계가 복잡해짐.

### ADR-005: Feel Heard Score + Affective Warmth 저장

**결정**: 기존 `DialogueFeedback` entity에 필드 추가. 별도 entity 불필요.
**근거**: Post-dialogue feedback의 일부. 같은 생명주기.

### ADR-006: 라이트 프로토콜 모델링

**결정**: `LightProtocolSession` 새 Entity. `Friendship`과 연관. 3가지 타입은 Enum Value Object.
**근거**: 구조화된 대화와 다른 생명주기(짧고 반복적). 별도 관리 필요.

### ADR-007: Facilitator stance data 접근 차단

**결정**: `FacilitatorInput` 타입에서 stance 관련 필드 제거. LangGraph input schema로 강제.
**근거**: v2의 핵심 안전 요구사항. 타입 시스템 수준의 차단이 프롬프트 수준보다 안전.

---

## 4. Risk Assessment (전체)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stance 6차원 확장 시 기존 데이터 마이그레이션 | High | Medium | 새 축 기본값 0.0, confidence 기본값 MEDIUM |
| Reflection FSM 변경 시 기존 테스트 대량 실패 | Medium | High | 기존 테스트를 먼저 업데이트, backward compatibility 유지 |
| Topic Ladder + Distance-Safety 복잡도 증가 | Medium | Medium | 단계적 도입: 고정값 → 적응형 |
| 라이트 프로토콜이 실시간 대화 조건과 충돌 | Low | Medium | 기존 친구 관계에 프로토콜 완료 카운트 추가 |
| 6차원 코사인 거리 계산 변경 | High | Low | 기존 5차원 → 6차원은 수학적으로 호환 |

---

## 5. 문서 인덱스

| 문서 | 경로 |
|------|------|
| Blueprint (이 문서) | `docs/plans/active/002-v2-enhancement-blueprint.md` |
| Phase 1: Self-Affirmation | `docs/plans/active/002-v2-phase1-self-affirmation.md` |
| Phase 2: Stance Profile v2 | `docs/plans/active/002-v2-phase2-stance-profile-v2.md` |
| Phase 3: Thought Map v2 | `docs/plans/active/002-v2-phase3-thought-map-v2.md` |
| Phase 4: Adaptive Matching | `docs/plans/active/002-v2-phase4-adaptive-matching.md` |
| Phase 5: Perspective Exchange | `docs/plans/active/002-v2-phase5-perspective-exchange.md` |
| Phase 6: Feedback & Metrics | `docs/plans/active/002-v2-phase6-feedback-metrics.md` |
| Phase 7: Light Protocol | `docs/plans/active/002-v2-phase7-light-protocol.md` |
| Phase 8: Analytics & Safety | `docs/plans/active/002-v2-phase8-analytics-safety.md` |

---

## 6. Progress Tracking

| Phase | Status | Progress |
|-------|--------|----------|
| V2-P1 Self-Affirmation | Complete | 100% |
| V2-P2 Stance Profile v2 | Complete | 100% |
| V2-P3 Thought Map v2 | Complete | 100% |
| V2-P4 Adaptive Matching | Complete | 100% |
| V2-P5 Perspective Exchange | Complete | 100% |
| V2-P6 Feedback & Metrics | Complete | 100% |
| V2-P7 Light Protocol | Complete | 100% |
| V2-P8 Analytics & Safety | Complete | 100% |
| **Overall** | **Complete** | **100%** |
