
CREATE TABLE public.agent_collections (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agent_name text NOT NULL,
  collection_target numeric NOT NULL DEFAULT 0,
  jan_actual numeric DEFAULT NULL,
  feb_actual numeric DEFAULT NULL,
  mar_actual numeric DEFAULT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agent_collections" ON public.agent_collections FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert agent_collections" ON public.agent_collections FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update agent_collections" ON public.agent_collections FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete agent_collections" ON public.agent_collections FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_collections;
