
CREATE TABLE public.agent_settlements (
  id integer generated always as identity primary key,
  agent_name text not null,
  settlement_target numeric not null default 50000,
  jan_actual numeric default null,
  feb_actual numeric default null,
  mar_actual numeric default null,
  updated_at timestamp with time zone not null default now()
);

ALTER TABLE public.agent_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agent_settlements" ON public.agent_settlements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert agent_settlements" ON public.agent_settlements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update agent_settlements" ON public.agent_settlements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete agent_settlements" ON public.agent_settlements FOR DELETE USING (true);

CREATE TRIGGER update_agent_settlements_updated_at
  BEFORE UPDATE ON public.agent_settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_settlements;
