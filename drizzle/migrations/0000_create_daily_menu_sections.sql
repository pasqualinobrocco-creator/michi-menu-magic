CREATE TABLE public.daily_menu_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_menu_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_menu_sections TO authenticated;
GRANT ALL ON public.daily_menu_sections TO service_role;
ALTER TABLE public.daily_menu_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads daily sections" ON public.daily_menu_sections FOR SELECT TO anon USING (true);
CREATE POLICY "staff manage daily sections" ON public.daily_menu_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Backfill: le quattro sezioni esistenti diventano righe della nuova tabella
INSERT INTO public.daily_menu_sections (name, position) VALUES
  ('Per iniziare', 0),
  ('Primi', 1),
  ('Secondi', 2),
  ('Dolci', 3);

-- Collega i piatti alle sezioni
ALTER TABLE public.daily_menu_items ADD COLUMN section_id uuid REFERENCES public.daily_menu_sections(id) ON DELETE CASCADE;
CREATE INDEX daily_menu_items_section_id_idx ON public.daily_menu_items (section_id);
UPDATE public.daily_menu_items i SET section_id = s.id
FROM public.daily_menu_sections s
WHERE s.name = CASE i.section
  WHEN 'antipasti' THEN 'Per iniziare'
  WHEN 'primi' THEN 'Primi'
  WHEN 'secondi' THEN 'Secondi'
  WHEN 'dolci' THEN 'Dolci'
  ELSE i.section
END;
COMMENT ON COLUMN public.daily_menu_items.section IS 'DEPRECATED: replaced by section_id';