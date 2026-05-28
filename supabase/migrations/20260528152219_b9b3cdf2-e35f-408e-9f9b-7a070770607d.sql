
ALTER TABLE public.agent_collections
  ADD COLUMN IF NOT EXISTS apr_actual numeric,
  ADD COLUMN IF NOT EXISTS may_actual numeric,
  ADD COLUMN IF NOT EXISTS jun_actual numeric,
  ADD COLUMN IF NOT EXISTS jul_actual numeric,
  ADD COLUMN IF NOT EXISTS aug_actual numeric,
  ADD COLUMN IF NOT EXISTS sep_actual numeric,
  ADD COLUMN IF NOT EXISTS oct_actual numeric,
  ADD COLUMN IF NOT EXISTS nov_actual numeric,
  ADD COLUMN IF NOT EXISTS dec_actual numeric;

ALTER TABLE public.agent_settlements
  ADD COLUMN IF NOT EXISTS apr_actual numeric,
  ADD COLUMN IF NOT EXISTS may_actual numeric,
  ADD COLUMN IF NOT EXISTS jun_actual numeric,
  ADD COLUMN IF NOT EXISTS jul_actual numeric,
  ADD COLUMN IF NOT EXISTS aug_actual numeric,
  ADD COLUMN IF NOT EXISTS sep_actual numeric,
  ADD COLUMN IF NOT EXISTS oct_actual numeric,
  ADD COLUMN IF NOT EXISTS nov_actual numeric,
  ADD COLUMN IF NOT EXISTS dec_actual numeric;
