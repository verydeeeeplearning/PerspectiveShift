-- 010: Add optional topic to dialogue sessions for topic-aware dialogue UI

ALTER TABLE dialogue_sessions
  ADD COLUMN IF NOT EXISTS topic TEXT;
