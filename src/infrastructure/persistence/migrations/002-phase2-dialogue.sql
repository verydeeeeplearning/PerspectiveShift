-- Phase 2: Structured Dialogue schema
-- Tables: anonymous_sessions, match_proposals, dialogue_sessions, dialogue_turns,
--         dialogue_feedback, understanding_scores, summary_cards

-- Anonymous sessions (localStorage UUID based)
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_anonymous_sessions_fingerprint ON anonymous_sessions(device_fingerprint);

-- Match proposals
CREATE TABLE IF NOT EXISTS match_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_session_id TEXT NOT NULL,
  target_session_id TEXT NOT NULL,
  distance_fit FLOAT NOT NULL DEFAULT 0,
  readiness_component FLOAT NOT NULL DEFAULT 0,
  score FLOAT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_proposals_initiator ON match_proposals(initiator_session_id);
CREATE INDEX idx_match_proposals_target ON match_proposals(target_session_id);
CREATE INDEX idx_match_proposals_status ON match_proposals(status) WHERE status = 'PENDING';

-- Dialogue sessions
CREATE TABLE IF NOT EXISTS dialogue_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a TEXT NOT NULL,
  participant_b TEXT NOT NULL,
  current_step TEXT NOT NULL DEFAULT 'POSITION'
    CHECK (current_step IN ('POSITION', 'QUESTION', 'ANSWER', 'REFLECTION')),
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dialogue_sessions_participant_a ON dialogue_sessions(participant_a);
CREATE INDEX idx_dialogue_sessions_participant_b ON dialogue_sessions(participant_b);
CREATE INDEX idx_dialogue_sessions_status ON dialogue_sessions(status) WHERE status = 'ACTIVE';

-- Dialogue turns
CREATE TABLE IF NOT EXISTS dialogue_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES dialogue_sessions(id) ON DELETE CASCADE,
  step TEXT NOT NULL
    CHECK (step IN ('POSITION', 'QUESTION', 'ANSWER', 'REFLECTION')),
  participant_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, step, participant_id)
);

CREATE INDEX idx_dialogue_turns_session ON dialogue_turns(session_id);

-- Dialogue feedback
CREATE TABLE IF NOT EXISTS dialogue_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES dialogue_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  satisfaction INTEGER NOT NULL CHECK (satisfaction BETWEEN 1 AND 5),
  rematch_willingness BOOLEAN NOT NULL DEFAULT false,
  emotion_check_in TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id)
);

CREATE INDEX idx_dialogue_feedback_session ON dialogue_feedback(session_id);

-- Understanding scores
CREATE TABLE IF NOT EXISTS understanding_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES dialogue_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  score FLOAT NOT NULL CHECK (score BETWEEN 0 AND 1),
  evaluation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id)
);

CREATE INDEX idx_understanding_scores_session ON understanding_scores(session_id);

-- Summary cards
CREATE TABLE IF NOT EXISTS summary_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES dialogue_sessions(id) ON DELETE CASCADE,
  key_arguments JSONB NOT NULL DEFAULT '{}',
  common_ground JSONB NOT NULL DEFAULT '[]',
  unresolved_questions JSONB NOT NULL DEFAULT '[]',
  blind_spots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_summary_cards_session ON summary_cards(session_id);

-- RLS policies
ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE understanding_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE summary_cards ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on anonymous_sessions"
  ON anonymous_sessions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on match_proposals"
  ON match_proposals FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on dialogue_sessions"
  ON dialogue_sessions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on dialogue_turns"
  ON dialogue_turns FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on dialogue_feedback"
  ON dialogue_feedback FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on understanding_scores"
  ON understanding_scores FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on summary_cards"
  ON summary_cards FOR ALL USING (auth.role() = 'service_role');

-- Anonymous access (Phase 2: no auth yet)
CREATE POLICY "Anon read own proposals"
  ON match_proposals FOR SELECT USING (true);

CREATE POLICY "Anon insert proposals"
  ON match_proposals FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon update own proposals"
  ON match_proposals FOR UPDATE USING (true);

CREATE POLICY "Anon read own sessions"
  ON dialogue_sessions FOR SELECT USING (true);

CREATE POLICY "Anon insert sessions"
  ON dialogue_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon update sessions"
  ON dialogue_sessions FOR UPDATE USING (true);

CREATE POLICY "Anon read own turns"
  ON dialogue_turns FOR SELECT USING (true);

CREATE POLICY "Anon insert turns"
  ON dialogue_turns FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon read own feedback"
  ON dialogue_feedback FOR SELECT USING (true);

CREATE POLICY "Anon insert feedback"
  ON dialogue_feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon read own scores"
  ON understanding_scores FOR SELECT USING (true);

CREATE POLICY "Anon insert scores"
  ON understanding_scores FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon read summary cards"
  ON summary_cards FOR SELECT USING (true);

CREATE POLICY "Anon insert summary cards"
  ON summary_cards FOR INSERT WITH CHECK (true);
