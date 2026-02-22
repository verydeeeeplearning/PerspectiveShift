-- =================================================================
-- PerspectiveShift: 전체 스키마 검증 & 보정 (Idempotent)
-- Supabase SQL Editor에서 한 번에 실행 가능
-- 이미 적용된 변경은 IF NOT EXISTS / IF EXISTS로 무시됨
-- =================================================================

-- -----------------------------------------------------------------
-- 1. stance_profiles 누락 컬럼 보정 (005, 010)
-- -----------------------------------------------------------------
ALTER TABLE stance_profiles
  ADD COLUMN IF NOT EXISTS core_value TEXT,
  ADD COLUMN IF NOT EXISTS self_affirmation_experience TEXT,
  ADD COLUMN IF NOT EXISTS confidence_map JSONB;

ALTER TABLE stance_profiles
  ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS job_category TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_stance_profiles_demographics
  ON stance_profiles (age_group, job_category)
  WHERE age_group IS NOT NULL;

-- -----------------------------------------------------------------
-- 2. dialogue_sessions: 6단계 FSM 제약조건 업데이트 (008)
-- -----------------------------------------------------------------
ALTER TABLE dialogue_sessions
  DROP CONSTRAINT IF EXISTS dialogue_sessions_current_step_check;

ALTER TABLE dialogue_sessions
  ADD CONSTRAINT dialogue_sessions_current_step_check
  CHECK (current_step IN ('AFFIRMATION', 'POSITION', 'QUESTION', 'ANSWER', 'REFLECTION', 'JOINT_SUMMARY'));

-- -----------------------------------------------------------------
-- 3. dialogue_sessions: topic 컬럼 추가 (011)
-- -----------------------------------------------------------------
ALTER TABLE dialogue_sessions
  ADD COLUMN IF NOT EXISTS topic TEXT;

-- -----------------------------------------------------------------
-- 4. dialogue_turns: 6단계 FSM 제약조건 업데이트 (009)
-- -----------------------------------------------------------------
ALTER TABLE dialogue_turns
  DROP CONSTRAINT IF EXISTS dialogue_turns_step_check;

ALTER TABLE dialogue_turns
  ADD CONSTRAINT dialogue_turns_step_check
  CHECK (step IN ('AFFIRMATION', 'POSITION', 'QUESTION', 'ANSWER', 'REFLECTION', 'JOINT_SUMMARY'));

-- dialogue_turns: UNIQUE(session_id, step, participant_id) 제거
-- 에이전트 대화에서 같은 step에 여러 턴이 가능해야 함
ALTER TABLE dialogue_turns
  DROP CONSTRAINT IF EXISTS dialogue_turns_session_id_step_participant_id_key;

-- -----------------------------------------------------------------
-- 5. dialogue_feedback: 누락 컬럼 추가 (v2-P6에서 추가된 필드)
-- -----------------------------------------------------------------
ALTER TABLE dialogue_feedback
  ADD COLUMN IF NOT EXISTS feel_heard_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS affective_warmth FLOAT DEFAULT 0;

-- -----------------------------------------------------------------
-- 6. Phase 3 테이블 생성 (003) - Relationship Escalation
-- -----------------------------------------------------------------

-- 6a. User Profiles (auth.users → app identity)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_alias TEXT NOT NULL,
  claimed_session_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_claimed_sessions
  ON user_profiles USING GIN (claimed_session_ids);

-- 6b. Friend Requests
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  dialogue_session_id UUID REFERENCES dialogue_sessions(id),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'SILENT_REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (requester_id <> target_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_target ON friend_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status) WHERE status = 'PENDING';

-- 6c. Friendships (normalized: user_a < user_b by UUID sort)
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'UNMATCHED', 'BLOCKED')),
  dialogue_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_a ON friendships(user_a);
CREATE INDEX IF NOT EXISTS idx_friendships_user_b ON friendships(user_b);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status) WHERE status = 'ACTIVE';

-- 6d. Friend Disclosures (asymmetric: A→B and B→A independent)
CREATE TABLE IF NOT EXISTS friend_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 3),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (friendship_id, from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_disclosures_friendship ON friend_disclosures(friendship_id);

-- 6e. Realtime Messages
CREATE TABLE IF NOT EXISTS realtime_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pii_scrubbed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_realtime_messages_friendship ON realtime_messages(friendship_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_messages_sender ON realtime_messages(sender_id);

-- 6f. Realtime Receipts (read status)
CREATE TABLE IF NOT EXISTS realtime_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES realtime_messages(id) ON DELETE CASCADE,
  reader_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, reader_id)
);

CREATE INDEX IF NOT EXISTS idx_realtime_receipts_message ON realtime_receipts(message_id);

-- 6g. Offline Meeting Proposals
CREATE TABLE IF NOT EXISTS offline_meeting_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PROPOSED'
    CHECK (status IN ('PROPOSED', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  safety_checkin_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (safety_checkin_status IN ('PENDING', 'SAFE', 'CONCERN', 'NO_RESPONSE')),
  proposed_at TIMESTAMPTZ,
  location_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offline_proposals_friendship ON offline_meeting_proposals(friendship_id);
CREATE INDEX IF NOT EXISTS idx_offline_proposals_status ON offline_meeting_proposals(status) WHERE status IN ('PROPOSED', 'CONFIRMED');

-- 6h. Safety Reports
CREATE TABLE IF NOT EXISTS safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  reason TEXT NOT NULL
    CHECK (reason IN ('HARASSMENT', 'THREAT', 'PII_REQUEST', 'IMPERSONATION', 'OTHER')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reporter_id <> reported_id)
);

CREATE INDEX IF NOT EXISTS idx_safety_reports_reporter ON safety_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_reported ON safety_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_status ON safety_reports(status) WHERE status IN ('OPEN', 'REVIEWING');

-- 6i. User Blocks (unidirectional)
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- 6j. Relationship Events (analytics)
CREATE TABLE IF NOT EXISTS relationship_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  target_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationship_events_type ON relationship_events(event_type);
CREATE INDEX IF NOT EXISTS idx_relationship_events_user ON relationship_events(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_events_created ON relationship_events(created_at DESC);

-- -----------------------------------------------------------------
-- 7. v4 테이블 생성 (007) - IF NOT EXISTS로 안전
-- -----------------------------------------------------------------

-- 7a. Saved Personas
CREATE TABLE IF NOT EXISTS saved_personas (
  user_id UUID NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_saved_personas_user
  ON saved_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_personas_last_conv
  ON saved_personas(user_id, last_conversation_at DESC);

-- 7b. Turing Guesses
CREATE TABLE IF NOT EXISTS turing_guesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dialogue_session_id TEXT NOT NULL,
  guess TEXT NOT NULL CHECK (guess IN ('human', 'ai')),
  actual TEXT NOT NULL CHECK (actual IN ('human', 'ai')),
  is_correct BOOLEAN GENERATED ALWAYS AS (guess = actual) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, dialogue_session_id)
);

CREATE INDEX IF NOT EXISTS idx_turing_guesses_user
  ON turing_guesses(user_id, created_at);

-- 7c. Receptiveness Entries
CREATE TABLE IF NOT EXISTS receptiveness_entries (
  user_id UUID PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0,
  template_adoptions INTEGER NOT NULL DEFAULT 0,
  feel_heard_received INTEGER NOT NULL DEFAULT 0,
  percentile DOUBLE PRECISION,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receptiveness_total
  ON receptiveness_entries(total_points);

-- 7d. Follow-up Checkins
CREATE TABLE IF NOT EXISTS follow_up_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dialogue_session_id TEXT NOT NULL,
  participant_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  avoidance_reduction INTEGER CHECK (avoidance_reduction BETWEEN 1 AND 5),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dialogue_session_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_follow_up_participant
  ON follow_up_checkins(participant_id);

-- 7e. Light Protocol Sessions
CREATE TABLE IF NOT EXISTS light_protocol_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL,
  type TEXT NOT NULL,
  initiator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
  initiator_response JSONB,
  responder_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_light_protocol_friendship
  ON light_protocol_sessions(friendship_id, created_at DESC);

-- -----------------------------------------------------------------
-- 8. RLS 정책 (이미 존재하면 무시 - DO $$ 블록 사용)
-- -----------------------------------------------------------------
DO $$
BEGIN
  -- === Phase 3 테이블 RLS ===

  -- user_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Service role full access on user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on user_profiles"
      ON user_profiles FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can read own profile') THEN
    CREATE POLICY "Users can read own profile"
      ON user_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- friend_requests
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Service role full access on friend_requests') THEN
    ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on friend_requests"
      ON friend_requests FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can read own friend requests') THEN
    CREATE POLICY "Users can read own friend requests"
      ON friend_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can create friend requests') THEN
    CREATE POLICY "Users can create friend requests"
      ON friend_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can update friend requests they received') THEN
    CREATE POLICY "Users can update friend requests they received"
      ON friend_requests FOR UPDATE USING (auth.uid() = target_id);
  END IF;

  -- friendships
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Service role full access on friendships') THEN
    ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on friendships"
      ON friendships FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can read own friendships') THEN
    CREATE POLICY "Users can read own friendships"
      ON friendships FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
  END IF;

  -- friend_disclosures
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_disclosures' AND policyname = 'Service role full access on friend_disclosures') THEN
    ALTER TABLE friend_disclosures ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on friend_disclosures"
      ON friend_disclosures FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_disclosures' AND policyname = 'Users can read own disclosures') THEN
    CREATE POLICY "Users can read own disclosures"
      ON friend_disclosures FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_disclosures' AND policyname = 'Users can update own disclosure') THEN
    CREATE POLICY "Users can update own disclosure"
      ON friend_disclosures FOR UPDATE USING (auth.uid() = from_user_id);
  END IF;

  -- realtime_messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_messages' AND policyname = 'Service role full access on realtime_messages') THEN
    ALTER TABLE realtime_messages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on realtime_messages"
      ON realtime_messages FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_messages' AND policyname = 'Users can read own messages') THEN
    CREATE POLICY "Users can read own messages"
      ON realtime_messages FOR SELECT USING (
        friendship_id IN (
          SELECT id FROM friendships
          WHERE user_a = auth.uid() OR user_b = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_messages' AND policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages"
      ON realtime_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;

  -- realtime_receipts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_receipts' AND policyname = 'Service role full access on realtime_receipts') THEN
    ALTER TABLE realtime_receipts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on realtime_receipts"
      ON realtime_receipts FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_receipts' AND policyname = 'Users can read own receipts') THEN
    CREATE POLICY "Users can read own receipts"
      ON realtime_receipts FOR SELECT USING (auth.uid() = reader_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_receipts' AND policyname = 'Users can mark messages read') THEN
    CREATE POLICY "Users can mark messages read"
      ON realtime_receipts FOR INSERT WITH CHECK (auth.uid() = reader_id);
  END IF;

  -- offline_meeting_proposals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offline_meeting_proposals' AND policyname = 'Service role full access on offline_meeting_proposals') THEN
    ALTER TABLE offline_meeting_proposals ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on offline_meeting_proposals"
      ON offline_meeting_proposals FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offline_meeting_proposals' AND policyname = 'Users can read own proposals') THEN
    CREATE POLICY "Users can read own proposals"
      ON offline_meeting_proposals FOR SELECT USING (
        friendship_id IN (
          SELECT id FROM friendships
          WHERE user_a = auth.uid() OR user_b = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offline_meeting_proposals' AND policyname = 'Users can create proposals') THEN
    CREATE POLICY "Users can create proposals"
      ON offline_meeting_proposals FOR INSERT WITH CHECK (auth.uid() = proposer_id);
  END IF;

  -- safety_reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'safety_reports' AND policyname = 'Service role full access on safety_reports') THEN
    ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on safety_reports"
      ON safety_reports FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'safety_reports' AND policyname = 'Users can submit safety reports') THEN
    CREATE POLICY "Users can submit safety reports"
      ON safety_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'safety_reports' AND policyname = 'Users can read own safety reports') THEN
    CREATE POLICY "Users can read own safety reports"
      ON safety_reports FOR SELECT USING (auth.uid() = reporter_id);
  END IF;

  -- user_blocks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_blocks' AND policyname = 'Service role full access on user_blocks') THEN
    ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on user_blocks"
      ON user_blocks FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_blocks' AND policyname = 'Users can manage own blocks') THEN
    CREATE POLICY "Users can manage own blocks"
      ON user_blocks FOR ALL USING (auth.uid() = blocker_id);
  END IF;

  -- relationship_events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relationship_events' AND policyname = 'Service role full access on relationship_events') THEN
    ALTER TABLE relationship_events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on relationship_events"
      ON relationship_events FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relationship_events' AND policyname = 'Users can read own events') THEN
    CREATE POLICY "Users can read own events"
      ON relationship_events FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- === v4 테이블 RLS ===

  -- saved_personas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_personas' AND policyname = 'Service role full access on saved_personas') THEN
    ALTER TABLE saved_personas ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on saved_personas"
      ON saved_personas FOR ALL USING (auth.role() = 'service_role');
  END IF;

  -- turing_guesses
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'turing_guesses' AND policyname = 'Service role full access on turing_guesses') THEN
    ALTER TABLE turing_guesses ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on turing_guesses"
      ON turing_guesses FOR ALL USING (auth.role() = 'service_role');
  END IF;

  -- receptiveness_entries
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'receptiveness_entries' AND policyname = 'Service role full access on receptiveness_entries') THEN
    ALTER TABLE receptiveness_entries ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on receptiveness_entries"
      ON receptiveness_entries FOR ALL USING (auth.role() = 'service_role');
  END IF;

  -- follow_up_checkins
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follow_up_checkins' AND policyname = 'Service role full access on follow_up_checkins') THEN
    ALTER TABLE follow_up_checkins ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on follow_up_checkins"
      ON follow_up_checkins FOR ALL USING (auth.role() = 'service_role');
  END IF;

  -- light_protocol_sessions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'light_protocol_sessions' AND policyname = 'Service role full access on light_protocol_sessions') THEN
    ALTER TABLE light_protocol_sessions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on light_protocol_sessions"
      ON light_protocol_sessions FOR ALL USING (auth.role() = 'service_role');
  END IF;
END
$$;

-- -----------------------------------------------------------------
-- 9. 검증 쿼리: 모든 테이블과 주요 컬럼 확인
-- -----------------------------------------------------------------
SELECT 'VERIFICATION' AS section,
       table_name,
       string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'stance_profiles',
    'anonymous_sessions',
    'match_proposals',
    'dialogue_sessions',
    'dialogue_turns',
    'dialogue_feedback',
    'understanding_scores',
    'summary_cards',
    'user_profiles',
    'friend_requests',
    'friendships',
    'friend_disclosures',
    'user_blocks',
    'safety_reports',
    'realtime_messages',
    'realtime_receipts',
    'offline_meeting_proposals',
    'relationship_events',
    'light_protocol_sessions',
    'receptiveness_entries',
    'follow_up_checkins',
    'turing_guesses',
    'saved_personas'
  )
GROUP BY table_name
ORDER BY table_name;
