-- Phase 1: Stance Discovery schema
-- PerspectiveShift stance_profiles table + RLS policies

CREATE TABLE IF NOT EXISTS stance_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tech_reg FLOAT NOT NULL DEFAULT 0,
  redistrib FLOAT NOT NULL DEFAULT 0,
  work_life FLOAT NOT NULL DEFAULT 0,
  meritocracy FLOAT NOT NULL DEFAULT 0,
  tech_optim FLOAT NOT NULL DEFAULT 0,
  opp_equality FLOAT NOT NULL DEFAULT 0,
  map_type TEXT NOT NULL DEFAULT 'BALANCE_SEEKER',
  reasoning TEXT,
  readiness FLOAT NOT NULL DEFAULT 0.5,
  precision TEXT NOT NULL DEFAULT 'initial' CHECK (precision IN ('initial', 'refined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stance_profiles_session_id ON stance_profiles(session_id);
CREATE INDEX idx_stance_profiles_user_id ON stance_profiles(user_id);
CREATE INDEX idx_stance_profiles_map_type ON stance_profiles(map_type);

-- RLS policies
ALTER TABLE stance_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profiles
CREATE POLICY "Users can view own stance profiles"
  ON stance_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profiles
CREATE POLICY "Users can insert own stance profiles"
  ON stance_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profiles
CREATE POLICY "Users can update own stance profiles"
  ON stance_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Anonymous sessions (no auth yet in Phase 1): allow service role
CREATE POLICY "Service role full access"
  ON stance_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow anonymous inserts for Phase 1 (session-based, no auth)
CREATE POLICY "Anonymous session insert"
  ON stance_profiles
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Allow anonymous session reads
CREATE POLICY "Anonymous session read"
  ON stance_profiles
  FOR SELECT
  USING (user_id IS NULL);
