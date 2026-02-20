-- 007: Update dialogue_sessions CHECK constraint to match full FSM steps
-- The domain FSM has 6 steps: AFFIRMATION, POSITION, QUESTION, ANSWER, REFLECTION, JOINT_SUMMARY
-- But the original constraint (002) only allowed 4 steps.

ALTER TABLE dialogue_sessions
  DROP CONSTRAINT IF EXISTS dialogue_sessions_current_step_check;

ALTER TABLE dialogue_sessions
  ADD CONSTRAINT dialogue_sessions_current_step_check
  CHECK (current_step IN ('AFFIRMATION', 'POSITION', 'QUESTION', 'ANSWER', 'REFLECTION', 'JOINT_SUMMARY'));
