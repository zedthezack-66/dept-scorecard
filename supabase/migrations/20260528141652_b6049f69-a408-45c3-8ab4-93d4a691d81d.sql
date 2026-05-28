ALTER TABLE public.metrics
  ADD COLUMN IF NOT EXISTS apr numeric,
  ADD COLUMN IF NOT EXISTS may numeric,
  ADD COLUMN IF NOT EXISTS jun numeric,
  ADD COLUMN IF NOT EXISTS jul numeric,
  ADD COLUMN IF NOT EXISTS aug numeric,
  ADD COLUMN IF NOT EXISTS sep numeric,
  ADD COLUMN IF NOT EXISTS oct numeric,
  ADD COLUMN IF NOT EXISTS nov numeric,
  ADD COLUMN IF NOT EXISTS dec numeric;