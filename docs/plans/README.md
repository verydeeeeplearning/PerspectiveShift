# Plans

## Directory Structure
- `active/`: 진행 중인 계획
- `done/`: 완료된 계획 (아카이브)
- `debt/`: 기술부채/나중에 처리

## Active Plans (Handoff Index)
- `docs/plans/active/000-bootstrap.md`: Bootstrap 환경 구성 계획
- `docs/plans/active/001-phase-2-structured-dialogue.md`: Phase 2 상세 개발 계획
- `docs/plans/active/001-phase-3-relationship-escalation.md`: Phase 3 (Relationship Escalation) 상세 개발 계획

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
