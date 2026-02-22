-- Add demographic columns to stance_profiles for matching
ALTER TABLE stance_profiles
  ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS job_category TEXT DEFAULT NULL;

-- Index for matching queries that filter by demographics
CREATE INDEX IF NOT EXISTS idx_stance_profiles_demographics
  ON stance_profiles (age_group, job_category)
  WHERE age_group IS NOT NULL;
