-- Phase 4 (v4): Persistence tables for saved personas, turing guesses,
-- receptiveness scores, follow-up checkins, and light protocol sessions.

-- 1. Saved Personas (user-persona conversation memory)
CREATE TABLE IF NOT EXISTS saved_personas (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  conversation_count INTEGER NOT NULL DEFAULT 0,
  last_conversation_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  conversation_summaries JSONB NOT NULL DEFAULT '[]',
  shared_context JSONB NOT NULL DEFAULT '[]',
  user_stance_memory JSONB NOT NULL DEFAULT '[]',
  saved_questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, persona_id)
);

CREATE INDEX idx_saved_personas_user ON saved_personas(user_id);
CREATE INDEX idx_saved_personas_last_conv ON saved_personas(user_id, last_conversation_at DESC);

-- 2. Turing Guesses (human/AI detection game)
CREATE TABLE IF NOT EXISTS turing_guesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dialogue_session_id TEXT NOT NULL,
  guess TEXT NOT NULL CHECK (guess IN ('human', 'ai')),
  actual TEXT NOT NULL CHECK (actual IN ('human', 'ai')),
  is_correct BOOLEAN GENERATED ALWAYS AS (guess = actual) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, dialogue_session_id)
);

CREATE INDEX idx_turing_guesses_user ON turing_guesses(user_id, created_at);

-- 3. Receptiveness Entries (per-user aggregate score)
CREATE TABLE IF NOT EXISTS receptiveness_entries (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  template_adoptions INTEGER NOT NULL DEFAULT 0,
  feel_heard_received INTEGER NOT NULL DEFAULT 0,
  percentile DOUBLE PRECISION,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_receptiveness_total ON receptiveness_entries(total_points);

-- 4. Follow-up Checkins (post-dialogue avoidance check)
CREATE TABLE IF NOT EXISTS follow_up_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dialogue_session_id TEXT NOT NULL,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  avoidance_reduction INTEGER CHECK (avoidance_reduction BETWEEN 1 AND 5),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dialogue_session_id, participant_id)
);

CREATE INDEX idx_follow_up_participant ON follow_up_checkins(participant_id);
CREATE INDEX idx_follow_up_pending ON follow_up_checkins(participant_id)
  WHERE completed_at IS NULL;

-- 5. Light Protocol Sessions (friendship mini-protocols)
CREATE TABLE IF NOT EXISTS light_protocol_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
  initiator_response JSONB,
  responder_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_light_protocol_friendship ON light_protocol_sessions(friendship_id, created_at DESC);
CREATE INDEX idx_light_protocol_active ON light_protocol_sessions(friendship_id)
  WHERE status = 'ACTIVE';

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE saved_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE turing_guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptiveness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE light_protocol_sessions ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on saved_personas"
  ON saved_personas FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on turing_guesses"
  ON turing_guesses FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on receptiveness_entries"
  ON receptiveness_entries FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on follow_up_checkins"
  ON follow_up_checkins FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on light_protocol_sessions"
  ON light_protocol_sessions FOR ALL USING (auth.role() = 'service_role');

-- User-specific access
CREATE POLICY "Users can manage own saved personas"
  ON saved_personas FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own turing guesses"
  ON turing_guesses FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own receptiveness"
  ON receptiveness_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own follow-up checkins"
  ON follow_up_checkins FOR ALL
  USING (auth.uid() = participant_id);

CREATE POLICY "Users can read own light protocol sessions"
  ON light_protocol_sessions FOR SELECT
  USING (
    friendship_id IN (
      SELECT id FROM friendships
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

CREATE POLICY "Users can create light protocol sessions"
  ON light_protocol_sessions FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Users can update own light protocol sessions"
  ON light_protocol_sessions FOR UPDATE
  USING (
    friendship_id IN (
      SELECT id FROM friendships
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );
