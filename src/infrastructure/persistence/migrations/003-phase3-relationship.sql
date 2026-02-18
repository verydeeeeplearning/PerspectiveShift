-- Phase 3: Relationship Escalation schema
-- Tables: user_profiles, friend_requests, friendships, friend_disclosures,
--         realtime_messages, realtime_receipts, offline_meeting_proposals,
--         safety_reports, user_blocks, relationship_events

-- 1. User profiles (auth.users → app identity)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_alias TEXT NOT NULL,
  claimed_session_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_claimed_sessions ON user_profiles USING GIN (claimed_session_ids);

-- 2. Friend requests
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

CREATE INDEX idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX idx_friend_requests_target ON friend_requests(target_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status) WHERE status = 'PENDING';

-- 3. Friendships (normalized: user_a < user_b by UUID sort)
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

CREATE INDEX idx_friendships_user_a ON friendships(user_a);
CREATE INDEX idx_friendships_user_b ON friendships(user_b);
CREATE INDEX idx_friendships_status ON friendships(status) WHERE status = 'ACTIVE';

-- 4. Friend disclosures (asymmetric: A→B and B→A independent)
CREATE TABLE IF NOT EXISTS friend_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 3),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (friendship_id, from_user_id, to_user_id)
);

CREATE INDEX idx_friend_disclosures_friendship ON friend_disclosures(friendship_id);

-- 5. Realtime messages
CREATE TABLE IF NOT EXISTS realtime_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pii_scrubbed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_realtime_messages_friendship ON realtime_messages(friendship_id, created_at DESC);
CREATE INDEX idx_realtime_messages_sender ON realtime_messages(sender_id);

-- 6. Realtime receipts (read status)
CREATE TABLE IF NOT EXISTS realtime_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES realtime_messages(id) ON DELETE CASCADE,
  reader_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, reader_id)
);

CREATE INDEX idx_realtime_receipts_message ON realtime_receipts(message_id);

-- 7. Offline meeting proposals
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

CREATE INDEX idx_offline_proposals_friendship ON offline_meeting_proposals(friendship_id);
CREATE INDEX idx_offline_proposals_status ON offline_meeting_proposals(status) WHERE status IN ('PROPOSED', 'CONFIRMED');

-- 8. Safety reports
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

CREATE INDEX idx_safety_reports_reporter ON safety_reports(reporter_id);
CREATE INDEX idx_safety_reports_reported ON safety_reports(reported_id);
CREATE INDEX idx_safety_reports_status ON safety_reports(status) WHERE status IN ('OPEN', 'REVIEWING');

-- 9. User blocks (unidirectional)
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

-- 10. Relationship events (analytics)
CREATE TABLE IF NOT EXISTS relationship_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  target_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_relationship_events_type ON relationship_events(event_type);
CREATE INDEX idx_relationship_events_user ON relationship_events(user_id);
CREATE INDEX idx_relationship_events_created ON relationship_events(created_at DESC);

-- RLS policies

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_meeting_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_events ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on user_profiles"
  ON user_profiles FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on friend_requests"
  ON friend_requests FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on friendships"
  ON friendships FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on friend_disclosures"
  ON friend_disclosures FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on realtime_messages"
  ON realtime_messages FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on realtime_receipts"
  ON realtime_receipts FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on offline_meeting_proposals"
  ON offline_meeting_proposals FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on safety_reports"
  ON safety_reports FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on user_blocks"
  ON user_blocks FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on relationship_events"
  ON relationship_events FOR ALL USING (auth.role() = 'service_role');

-- User-specific access policies
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own friend requests"
  ON friend_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can create friend requests"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend requests they received"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = target_id);

CREATE POLICY "Users can read own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can read own disclosures"
  ON friend_disclosures FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can update own disclosure"
  ON friend_disclosures FOR UPDATE
  USING (auth.uid() = from_user_id);

CREATE POLICY "Users can read own messages"
  ON realtime_messages FOR SELECT
  USING (
    friendship_id IN (
      SELECT id FROM friendships
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON realtime_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read own receipts"
  ON realtime_receipts FOR SELECT
  USING (auth.uid() = reader_id);

CREATE POLICY "Users can mark messages read"
  ON realtime_receipts FOR INSERT
  WITH CHECK (auth.uid() = reader_id);

CREATE POLICY "Users can read own proposals"
  ON offline_meeting_proposals FOR SELECT
  USING (
    friendship_id IN (
      SELECT id FROM friendships
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

CREATE POLICY "Users can create proposals"
  ON offline_meeting_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Users can submit safety reports"
  ON safety_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own safety reports"
  ON safety_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can manage own blocks"
  ON user_blocks FOR ALL
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can read own events"
  ON relationship_events FOR SELECT
  USING (auth.uid() = user_id);
