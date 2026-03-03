
-- Agents table (collections data)
CREATE TABLE public.agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  target NUMERIC NOT NULL DEFAULT 0,
  movement NUMERIC NOT NULL DEFAULT 0,
  avg_days_arrears NUMERIC NOT NULL DEFAULT 0,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Metrics table (scorecard KPIs)
CREATE TABLE public.metrics (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '%',
  lower_is_better BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'Monthly',
  actual NUMERIC,
  jan NUMERIC,
  feb NUMERIC,
  mar NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Weekly data table
CREATE TABLE public.weekly (
  id SERIAL PRIMARY KEY,
  week TEXT NOT NULL,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  target NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monthly counter table
CREATE TABLE public.monthly (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly ENABLE ROW LEVEL SECURITY;

-- Everyone can read (public dashboard)
CREATE POLICY "Anyone can read agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Anyone can read metrics" ON public.metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can read weekly" ON public.weekly FOR SELECT USING (true);
CREATE POLICY "Anyone can read monthly" ON public.monthly FOR SELECT USING (true);

-- Anyone can modify (no auth in this app, admin is PIN-protected client-side)
CREATE POLICY "Anyone can insert agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete agents" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Anyone can insert metrics" ON public.metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update metrics" ON public.metrics FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete metrics" ON public.metrics FOR DELETE USING (true);

CREATE POLICY "Anyone can insert weekly" ON public.weekly FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weekly" ON public.weekly FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete weekly" ON public.weekly FOR DELETE USING (true);

CREATE POLICY "Anyone can insert monthly" ON public.monthly FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update monthly" ON public.monthly FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete monthly" ON public.monthly FOR DELETE USING (true);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON public.metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weekly_updated_at BEFORE UPDATE ON public.weekly FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_updated_at BEFORE UPDATE ON public.monthly FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
