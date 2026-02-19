# Plans

## Directory Structure
- `active/`: 진행 중인 계획
- `done/`: 완료된 계획 (아카이브)
- `debt/`: 기술부채/나중에 처리

## Active Plans (Handoff Index)
- `docs/plans/active/000-bootstrap.md`: Bootstrap 환경 구성 계획
- `docs/plans/active/001-phase-2-structured-dialogue.md`: Phase 2 상세 개발 계획
- `docs/plans/active/001-phase-3-relationship-escalation.md`: Phase 3 (Relationship Escalation) 상세 개발 계획

### v4.0 Development Blueprint (Current)
- `docs/plans/active/004-v4-development-blueprint.md`: **v4 전체 개발 청사진** — Gap 분석, 3-Tier 우선순위, 32개 피처 상세
  - **P0 (Core Loop MVP)**: 12개 피처, 8-12주
    - P0-A: Trust Moment + 온보딩 문항 + AI 페르소나
    - P0-B: Thought Map + 에너지 즉시반응 + 매칭 엔진 + Trailer + 매칭 카드
    - P0-C: 탭 하이라이트 + 톤 체크 제안
    - P0-D: 리플렉션 경량화 + 요약 카드 + 피크엔드 플로우
  - **P1 (Loop Quality)**: 10개 피처, 6-10주
    - 스캐폴딩 + 수용성 전염 + Decline 배지 + D+1 복기 + Passport + 앵커 매칭
  - **P2 (Persistence & Scale)**: 10개 피처, 10-16주
    - JITAI 엔진 + 복구 고도화 + 튜링 게임 + 페르소나 메모리 + PWA + 알림

### v3.0 Enhancement Plans
- `docs/plans/active/003-v3-enhancement-blueprint.md`: **v3 전체 청사진** — 11 Phases, Gap 분석, ADRs
  - V3-P1: 정밀도 사다리 + 질문 Bank
  - V3-P2: 공유 카드 3종 + Next Step Hub
  - V3-P3: 매칭 카드 UX (Conversation Trailer + 에너지 체크 + 거절 UX)
  - V3-P4: 대화 UX 개선 (스캐폴딩 + Coach + 밑줄/인용 + 톤 체크)
  - V3-P5: Reflection 전면 개편 (퀴즈→주관식 + 슬라이더 검증 + 역할극)
  - V3-P6: Peak-End 카드 + 공동 요약
  - V3-P7: 나쁜 경험 복구 루틴
  - V3-P8: 상태 기반 홈 + 리텐션 루프
  - V3-P9: 이벤트 로깅 택소노미
  - V3-P10: 마이크로카피 + A/B 인프라
  - V3-P11: Stance Drift + Perspective Passport 고도화

### v2.0 Enhancement Plans (All Complete)
- `docs/plans/active/002-v2-enhancement-blueprint.md`: **v2 전체 청사진** — Gap 분석, 의존성 그래프, ADRs
- `docs/plans/active/002-v2-phase1-self-affirmation.md`: V2-P1 Self-Affirmation Warmup + Core Value **[Complete]**
- `docs/plans/active/002-v2-phase2-stance-profile-v2.md`: V2-P2 Stance Profile 확장 (6차원 + Confidence Map) **[Complete]**
- `docs/plans/active/002-v2-phase3-thought-map-v2.md`: V2-P3 Thought Map v2 (별명 + Misperception 카드 + 비교 뷰) **[Complete]**
- `docs/plans/active/002-v2-phase4-adaptive-matching.md`: V2-P4 Adaptive Matching (Distance-Safety Package + Topic Ladder) **[Complete]**
- `docs/plans/active/002-v2-phase5-perspective-exchange.md`: V2-P5 Perspective Exchange 구조 개편 **[Complete]**
- `docs/plans/active/002-v2-phase6-feedback-metrics.md`: V2-P6 Feel Heard Score + Affective Warmth + Receptiveness Points **[Complete]**
- `docs/plans/active/002-v2-phase7-light-protocol.md`: V2-P7 라이트 프로토콜 3종 + 실시간 대화 조건 변경 **[Complete]**
- `docs/plans/active/002-v2-phase8-analytics-safety.md`: V2-P8 Analytics & Safety (Attrition + Fatigue + 설득 방지) **[Complete]**

## Implementation Summary (v2.0)

| Phase | Tests Added | Key Deliverables |
|-------|------------|-----------------|
| V2-P1 | SelfAffirmation VO, CoreValue VO | 자기긍정 웜업 흐름 |
| V2-P2 | ConfidenceMap, StanceDimension 6축 | 6차원 Stance + Confidence 매핑 |
| V2-P3 | ThoughtMapAlias, MisperceptionResult | 별명 시스템 + 오인 편향 교정 카드 |
| V2-P4 | DistanceBand, TopicLevel, EffortGrade | Distance-Safety Package + Topic Ladder |
| V2-P5 | DialogueStep 6단계, PersonalContext, ReflectionItem | AFFIRMATION→POSITION→QUESTION→ANSWER→REFLECTION→JOINT_SUMMARY |
| V2-P6 | FeelHeardScore, AffectiveWarmth, ReceptivenessScore, FollowUpCheckin | 피드백 확장 + 수용성 포인트 + 1주 후 체크인 |
| V2-P7 | LightProtocolType, LightProtocolSession, MicroCheckinScheduler | 3종 프로토콜 + 실시간 대화 조건 변경 + 20분 체크인 |
| V2-P8 | FatigueScore, CooldownMode, DialogueLimit, MetricTier | 피로 감지 + 일일 한도 + LLM 평가 지표 |

**Total: 149 test files, 877 tests passing. Build clean.**

## Plan Template (minimal)
모든 계획 문서는 아래를 포함한다:
- Goal / Non-goals
- Steps
- Definition of Done
- Risks / Rollback
- Status Log (append-only)
