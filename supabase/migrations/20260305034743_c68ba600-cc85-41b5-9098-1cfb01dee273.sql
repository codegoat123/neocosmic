
CREATE TABLE public.custom_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  embed_url text NOT NULL,
  image_url text DEFAULT '',
  description text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view custom games" ON public.custom_games FOR SELECT USING (true);
CREATE POLICY "Anyone can insert custom games" ON public.custom_games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete custom games" ON public.custom_games FOR DELETE USING (true);
