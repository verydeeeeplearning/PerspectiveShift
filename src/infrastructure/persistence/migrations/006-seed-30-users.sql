-- ============================================================
-- Seed 30 diverse users for testing
-- Run AFTER 005-add-profile-extras.sql
-- ============================================================

-- Step 0: Add missing columns if not yet applied
ALTER TABLE stance_profiles
  ADD COLUMN IF NOT EXISTS core_value TEXT,
  ADD COLUMN IF NOT EXISTS self_affirmation_experience TEXT,
  ADD COLUMN IF NOT EXISTS confidence_map JSONB;

-- Step 1: Clear old seed data (keep real user data)
DELETE FROM stance_profiles WHERE session_id LIKE 'seed-%';
DELETE FROM match_proposals WHERE initiator_session_id LIKE 'seed-%' OR target_session_id LIKE 'seed-%';
DELETE FROM dialogue_sessions WHERE participant_a LIKE 'seed-%' OR participant_b LIKE 'seed-%';

-- ============================================================
-- Step 2: Insert 30 stance profiles
-- Dimensions: tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality
-- Range: -1.0 ~ 1.0
-- ============================================================

-- ── 균형 탐색가 (BALANCE_SEEKER) × 5 ──
INSERT INTO stance_profiles (session_id, tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality, map_type, reasoning, readiness, precision)
VALUES
  ('seed-bs-01', 0.1, -0.1, 0.2, 0.1, 0.0, 0.15,
   'BALANCE_SEEKER', '아직 확고한 입장은 없지만 다양한 관점에 열려 있습니다.', 0.7, 'initial'),
  ('seed-bs-02', -0.1, 0.2, 0.1, -0.1, 0.15, 0.0,
   'BALANCE_SEEKER', '양쪽 주장 모두 일리가 있다고 생각합니다.', 0.8, 'initial'),
  ('seed-bs-03', 0.05, 0.05, -0.1, 0.2, -0.1, 0.1,
   'BALANCE_SEEKER', '오랜 경험을 통해 극단은 피해야 한다고 배웠습니다.', 0.6, 'initial'),
  ('seed-bs-04', -0.15, 0.1, 0.25, -0.05, 0.1, -0.1,
   'BALANCE_SEEKER', '이슈마다 다른 생각을 가지고 있어서 한쪽으로 분류하기 어렵습니다.', 0.75, 'initial'),
  ('seed-bs-05', 0.2, -0.05, 0.0, 0.1, -0.15, 0.2,
   'BALANCE_SEEKER', '아직 공부 중이라 섣불리 판단하고 싶지 않습니다.', 0.5, 'initial');

-- ── 자유 혁신가 (LIBERTY_INNOVATOR) × 5 ──
INSERT INTO stance_profiles (session_id, tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality, map_type, reasoning, readiness, precision)
VALUES
  ('seed-li-01', -0.8, -0.6, -0.3, 0.7, 0.9, -0.2,
   'LIBERTY_INNOVATOR', '규제는 혁신을 죽입니다. 시장이 스스로 해결할 수 있습니다.', 0.9, 'initial'),
  ('seed-li-02', -0.7, -0.5, 0.1, 0.6, 0.85, -0.1,
   'LIBERTY_INNOVATOR', '기술이 세상을 더 좋게 만들 수 있다고 확신합니다.', 0.85, 'initial'),
  ('seed-li-03', -0.6, -0.7, -0.2, 0.8, 0.7, -0.3,
   'LIBERTY_INNOVATOR', '자유로운 시장 경쟁이 가장 효율적인 자원 배분을 만듭니다.', 0.8, 'initial'),
  ('seed-li-04', -0.75, -0.4, 0.3, 0.5, 0.8, 0.0,
   'LIBERTY_INNOVATOR', '표현의 자유와 창작의 자유가 가장 중요합니다.', 0.7, 'initial'),
  ('seed-li-05', -0.85, -0.65, -0.4, 0.75, 0.95, -0.25,
   'LIBERTY_INNOVATOR', '탈중앙화된 시스템이 미래입니다. 중앙 통제는 비효율적입니다.', 0.95, 'initial');

-- ── 공정 수호자 (FAIRNESS_GUARDIAN) × 5 ──
INSERT INTO stance_profiles (session_id, tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality, map_type, reasoning, readiness, precision)
VALUES
  ('seed-fg-01', 0.6, 0.8, 0.5, -0.6, 0.1, 0.85,
   'FAIRNESS_GUARDIAN', '사회적 약자를 위한 제도적 보장이 민주주의의 핵심입니다.', 0.9, 'initial'),
  ('seed-fg-02', 0.5, 0.7, 0.6, -0.5, 0.2, 0.8,
   'FAIRNESS_GUARDIAN', '교육의 기회 균등 없이는 공정한 사회를 기대할 수 없습니다.', 0.85, 'initial'),
  ('seed-fg-03', 0.7, 0.85, 0.7, -0.7, -0.1, 0.9,
   'FAIRNESS_GUARDIAN', '복지는 시혜가 아니라 권리입니다.', 0.8, 'initial'),
  ('seed-fg-04', 0.55, 0.75, 0.8, -0.65, 0.0, 0.75,
   'FAIRNESS_GUARDIAN', '노동자의 권리가 보장되어야 경제도 건강해집니다.', 0.75, 'initial'),
  ('seed-fg-05', 0.4, 0.6, 0.4, -0.4, 0.3, 0.7,
   'FAIRNESS_GUARDIAN', '의료 접근성은 소득 수준과 무관해야 합니다.', 0.7, 'initial');

-- ── 실용 중재자 (PRAGMATIC_MEDIATOR) × 5 ──
INSERT INTO stance_profiles (session_id, tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality, map_type, reasoning, readiness, precision)
VALUES
  ('seed-pm-01', 0.3, -0.3, 0.4, 0.3, -0.25, 0.35,
   'PRAGMATIC_MEDIATOR', '이론보다 현장에서 작동하는 해결책이 중요합니다.', 0.8, 'initial'),
  ('seed-pm-02', -0.3, 0.35, -0.25, 0.4, 0.3, -0.3,
   'PRAGMATIC_MEDIATOR', '상황에 따라 다르다는 게 무책임한 게 아니라 현실적인 겁니다.', 0.75, 'initial'),
  ('seed-pm-03', 0.25, 0.3, 0.35, -0.3, 0.4, -0.25,
   'PRAGMATIC_MEDIATOR', '규제도 필요하지만 과도하면 안 됩니다. 균형이 중요해요.', 0.7, 'initial'),
  ('seed-pm-04', -0.35, -0.25, 0.5, 0.35, 0.25, 0.4,
   'PRAGMATIC_MEDIATOR', '디자인도 현실적 제약 안에서 최선을 찾는 과정이니까요.', 0.65, 'initial'),
  ('seed-pm-05', 0.4, -0.4, 0.3, -0.3, 0.35, 0.3,
   'PRAGMATIC_MEDIATOR', '타협은 약함이 아니라 지혜입니다.', 0.85, 'initial');

-- ── 체제 도전자 (SYSTEM_CHALLENGER) × 5 ──
INSERT INTO stance_profiles (session_id, tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality, map_type, reasoning, readiness, precision)
VALUES
  ('seed-sc-01', 0.3, 0.8, 0.6, -0.7, 0.7, 0.85,
   'SYSTEM_CHALLENGER', '현재 시스템은 구조적 불평등을 재생산합니다. 근본적 변화가 필요합니다.', 0.9, 'initial'),
  ('seed-sc-02', 0.5, 0.7, 0.8, -0.8, 0.6, 0.9,
   'SYSTEM_CHALLENGER', '기후위기는 체제 전환 없이 해결할 수 없습니다.', 0.85, 'initial'),
  ('seed-sc-03', 0.2, 0.65, 0.7, -0.6, 0.75, 0.8,
   'SYSTEM_CHALLENGER', '교육 시스템 자체를 바꿔야 합니다. 패치로는 부족합니다.', 0.8, 'initial'),
  ('seed-sc-04', 0.4, 0.75, 0.5, -0.75, 0.65, 0.85,
   'SYSTEM_CHALLENGER', '언론의 독립성 없이 민주주의는 형식에 불과합니다.', 0.75, 'initial'),
  ('seed-sc-05', 0.35, 0.85, 0.65, -0.65, 0.5, 0.9,
   'SYSTEM_CHALLENGER', '대의 민주주의의 한계를 넘어 직접 참여가 필요합니다.', 0.95, 'initial');

-- ── 전통 안정가 (TRADITION_STABILIZER) × 5 ──
INSERT INTO stance_profiles (session_id, tech_reg, redistrib, work_life, meritocracy, tech_optim, opp_equality, map_type, reasoning, readiness, precision)
VALUES
  ('seed-ts-01', 0.2, -0.7, -0.3, 0.85, -0.2, -0.6,
   'TRADITION_STABILIZER', '능력에 따른 보상이 가장 공정합니다. 결과의 평등은 위험합니다.', 0.8, 'initial'),
  ('seed-ts-02', 0.3, -0.6, -0.5, 0.8, -0.3, -0.5,
   'TRADITION_STABILIZER', '질서와 안정이 발전의 기반입니다.', 0.75, 'initial'),
  ('seed-ts-03', 0.4, -0.5, 0.1, 0.7, -0.4, -0.45,
   'TRADITION_STABILIZER', '전통적 가치에는 오랜 세월 검증된 지혜가 담겨 있습니다.', 0.7, 'initial'),
  ('seed-ts-04', 0.15, -0.55, -0.1, 0.75, -0.15, -0.55,
   'TRADITION_STABILIZER', '급격한 변화보다 점진적 개선이 안전합니다.', 0.65, 'initial'),
  ('seed-ts-05', 0.25, -0.65, -0.2, 0.9, -0.1, -0.7,
   'TRADITION_STABILIZER', '법과 원칙에 따른 운영이 사회 안정의 핵심입니다.', 0.85, 'initial');

-- ============================================================
-- Step 3: Match proposals (opposing types make interesting matches)
-- ============================================================
INSERT INTO match_proposals (initiator_session_id, target_session_id, distance_fit, readiness_component, score, status, expires_at)
VALUES
  -- 자유 혁신가 ↔ 공정 수호자 (극적 대비)
  ('seed-li-01', 'seed-fg-01', 0.85, 0.9, 0.87, 'PENDING', now() + interval '24 hours'),
  ('seed-li-02', 'seed-fg-02', 0.80, 0.85, 0.82, 'PENDING', now() + interval '24 hours'),
  ('seed-li-03', 'seed-fg-03', 0.82, 0.8, 0.81, 'ACCEPTED', now() + interval '24 hours'),

  -- 체제 도전자 ↔ 전통 안정가 (극적 대비)
  ('seed-sc-01', 'seed-ts-01', 0.88, 0.85, 0.86, 'PENDING', now() + interval '24 hours'),
  ('seed-sc-02', 'seed-ts-02', 0.83, 0.75, 0.79, 'ACCEPTED', now() + interval '24 hours'),

  -- 균형 탐색가 ↔ 자유 혁신가 (탐색적 매칭)
  ('seed-bs-01', 'seed-li-04', 0.55, 0.7, 0.62, 'PENDING', now() + interval '24 hours'),
  ('seed-bs-02', 'seed-sc-03', 0.60, 0.8, 0.70, 'PENDING', now() + interval '24 hours'),

  -- 실용 중재자 ↔ 다양한 상대
  ('seed-pm-01', 'seed-fg-04', 0.65, 0.78, 0.71, 'ACCEPTED', now() + interval '24 hours'),
  ('seed-pm-02', 'seed-ts-03', 0.58, 0.72, 0.65, 'PENDING', now() + interval '24 hours'),
  ('seed-pm-03', 'seed-li-05', 0.70, 0.77, 0.73, 'PENDING', now() + interval '24 hours'),

  -- 추가 매칭
  ('seed-fg-05', 'seed-ts-04', 0.75, 0.68, 0.71, 'PENDING', now() + interval '24 hours'),
  ('seed-sc-04', 'seed-pm-04', 0.50, 0.75, 0.62, 'ACCEPTED', now() + interval '24 hours'),
  ('seed-bs-03', 'seed-fg-05', 0.45, 0.65, 0.55, 'PENDING', now() + interval '24 hours'),
  ('seed-sc-05', 'seed-ts-05', 0.90, 0.90, 0.90, 'PENDING', now() + interval '24 hours'),
  ('seed-bs-04', 'seed-pm-05', 0.35, 0.70, 0.52, 'PENDING', now() + interval '24 hours');

-- ============================================================
-- Step 4: Dialogue sessions (from ACCEPTED matches)
-- ============================================================
INSERT INTO dialogue_sessions (participant_a, participant_b, current_step, status)
VALUES
  ('seed-li-03', 'seed-fg-03', 'POSITION', 'ACTIVE'),
  ('seed-sc-02', 'seed-ts-02', 'QUESTION', 'ACTIVE'),
  ('seed-pm-01', 'seed-fg-04', 'ANSWER', 'ACTIVE'),
  ('seed-sc-04', 'seed-pm-04', 'REFLECTION', 'ACTIVE');

-- ============================================================
-- Step 5: Sample dialogue turns for the first session
-- ============================================================
INSERT INTO dialogue_turns (session_id, step, participant_id, content)
SELECT
  ds.id, 'POSITION', 'seed-li-03',
  '저는 기술 규제를 최소화해야 한다고 생각합니다. 규제가 혁신을 가로막고, 결국 소비자에게 피해가 돌아갑니다. 자유로운 경쟁이 최선의 결과를 만듭니다.'
FROM dialogue_sessions ds
WHERE ds.participant_a = 'seed-li-03' AND ds.participant_b = 'seed-fg-03';

INSERT INTO dialogue_turns (session_id, step, participant_id, content)
SELECT
  ds.id, 'POSITION', 'seed-fg-03',
  '복지는 시혜가 아니라 권리입니다. 시장에만 맡기면 사회적 약자는 영원히 소외됩니다. 공정한 기회를 보장하는 제도가 필요합니다.'
FROM dialogue_sessions ds
WHERE ds.participant_a = 'seed-li-03' AND ds.participant_b = 'seed-fg-03';

-- Turns for second session (QUESTION step)
INSERT INTO dialogue_turns (session_id, step, participant_id, content)
SELECT
  ds.id, 'POSITION', 'seed-sc-02',
  '기후위기는 현 경제 시스템의 구조적 결과입니다. 탄소세나 규제만으로는 부족하고, 성장 패러다임 자체를 재고해야 합니다.'
FROM dialogue_sessions ds
WHERE ds.participant_a = 'seed-sc-02' AND ds.participant_b = 'seed-ts-02';

INSERT INTO dialogue_turns (session_id, step, participant_id, content)
SELECT
  ds.id, 'POSITION', 'seed-ts-02',
  '급격한 체제 전환은 경제 혼란을 초래합니다. 기존 시스템 안에서 점진적으로 개선하는 것이 현실적입니다.'
FROM dialogue_sessions ds
WHERE ds.participant_a = 'seed-sc-02' AND ds.participant_b = 'seed-ts-02';

INSERT INTO dialogue_turns (session_id, step, participant_id, content)
SELECT
  ds.id, 'QUESTION', 'seed-sc-02',
  '점진적 개선이라고 하셨는데, 지금까지 30년간 점진적 접근으로 탄소 배출이 줄었나요? 구체적으로 어떤 성과가 있었다고 보시나요?'
FROM dialogue_sessions ds
WHERE ds.participant_a = 'seed-sc-02' AND ds.participant_b = 'seed-ts-02';
