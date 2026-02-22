-- 008: Update dialogue_turns step CHECK constraint to match full FSM steps
-- The domain FSM has 6 steps: AFFIRMATION, POSITION, QUESTION, ANSWER, REFLECTION, JOINT_SUMMARY
-- But the original constraint (002) only allowed 4 steps for the turns table.

ALTER TABLE dialogue_turns
  DROP CONSTRAINT IF EXISTS dialogue_turns_step_check;

ALTER TABLE dialogue_turns
  ADD CONSTRAINT dialogue_turns_step_check
  CHECK (step IN ('AFFIRMATION', 'POSITION', 'QUESTION', 'ANSWER', 'REFLECTION', 'JOINT_SUMMARY'));
