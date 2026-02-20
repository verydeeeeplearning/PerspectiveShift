-- Add self-affirmation and confidence columns to stance_profiles
-- These are used by SubmitSelfAffirmationUseCase and SubmitConfidenceUseCase

ALTER TABLE stance_profiles
  ADD COLUMN IF NOT EXISTS core_value TEXT,
  ADD COLUMN IF NOT EXISTS self_affirmation_experience TEXT,
  ADD COLUMN IF NOT EXISTS confidence_map JSONB;
