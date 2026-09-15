CREATE TABLE public.daily_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date date NOT NULL UNIQUE,
  bread text NOT NULL DEFAULT '',
  closing_message text NOT NULL DEFAULT 'Buon Pranzo ☀️',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_menus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_menus TO authenticated;
GRANT ALL ON public.daily_menus TO service_role;
ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published menus" ON public.daily_menus FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "staff manage menus" ON public.daily_menus FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.daily_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES public.daily_menus(id) ON DELETE CASCADE,
  section text NOT NULL,
  name text NOT NULL,
  price numeric(10,2),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX daily_menu_items_menu_idx ON public.daily_menu_items(menu_id);
GRANT SELECT ON public.daily_menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_menu_items TO authenticated;
GRANT ALL ON public.daily_menu_items TO service_role;
ALTER TABLE public.daily_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published items" ON public.daily_menu_items FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.daily_menus m WHERE m.id = menu_id AND m.status = 'published'));
CREATE POLICY "staff manage items" ON public.daily_menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.recipe_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  default_price numeric(10,2),
  section text,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_book TO authenticated;
GRANT ALL ON public.recipe_book TO service_role;
ALTER TABLE public.recipe_book ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage recipe book" ON public.recipe_book FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.fixed_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  closing_message text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.fixed_menus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_menus TO authenticated;
GRANT ALL ON public.fixed_menus TO service_role;
ALTER TABLE public.fixed_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads fixed menus" ON public.fixed_menus FOR SELECT TO anon USING (true);
CREATE POLICY "staff manage fixed menus" ON public.fixed_menus FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.fixed_menu_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES public.fixed_menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.fixed_menu_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_menu_sections TO authenticated;
GRANT ALL ON public.fixed_menu_sections TO service_role;
ALTER TABLE public.fixed_menu_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads fixed sections" ON public.fixed_menu_sections FOR SELECT TO anon USING (true);
CREATE POLICY "staff manage fixed sections" ON public.fixed_menu_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.fixed_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.fixed_menu_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2),
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
CREATE INDEX fixed_menu_items_section_idx ON public.fixed_menu_items(section_id);
GRANT SELECT ON public.fixed_menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fixed_menu_items TO authenticated;
GRANT ALL ON public.fixed_menu_items TO service_role;
ALTER TABLE public.fixed_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active fixed items" ON public.fixed_menu_items FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff manage fixed items" ON public.fixed_menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_light_url text,
  logo_dark_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads settings" ON public.app_settings FOR SELECT TO anon USING (true);
CREATE POLICY "staff read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.app_settings (id) VALUES (1);

INSERT INTO public.daily_menus (menu_date, bread, closing_message, status)
VALUES (CURRENT_DATE, 'Integrale e Noci', 'Buon Pranzo ☀️', 'published');

INSERT INTO public.daily_menu_items (menu_id, section, name, price, position)
SELECT m.id, v.section, v.name, v.price, v.position
FROM public.daily_menus m,
(VALUES
  ('antipasti','Caprese Michì',9,0),
  ('antipasti','Culatello e burratina artigianale',10,1),
  ('antipasti','Bresaola, battuto di rucola, pomodorini arrosto e stracciatella',11,2),
  ('primi','Pasta, sugo fresco ai 3 pomodori e basilico',10,0),
  ('primi','Riso Jasmine, salmone affumicato e uova strapazzate',12,1),
  ('primi','Pasta e fagioli',12,2),
  ('secondi','Carpaccio di Black Angus, chutney al mango e pepe rosa, rucola e Feta',12,0),
  ('secondi','Pollo marinato, peperoni e salsa Tzatziky',12,1),
  ('secondi','Trancio di tonno scottato, misticanza asiatica e maionese al rafano',14,2),
  ('dolci','Cheesecake Homemade',6,0)
) AS v(section,name,price,position)
WHERE m.menu_date = CURRENT_DATE;

INSERT INTO public.recipe_book (name, default_price, section)
SELECT name, price, section FROM (VALUES
  ('Caprese Michì',9,'antipasti'),
  ('Culatello e burratina artigianale',10,'antipasti'),
  ('Bresaola, battuto di rucola, pomodorini arrosto e stracciatella',11,'antipasti'),
  ('Pasta, sugo fresco ai 3 pomodori e basilico',10,'primi'),
  ('Riso Jasmine, salmone affumicato e uova strapazzate',12,'primi'),
  ('Pasta e fagioli',12,'primi'),
  ('Carpaccio di Black Angus, chutney al mango e pepe rosa, rucola e Feta',12,'secondi'),
  ('Pollo marinato, peperoni e salsa Tzatziky',12,'secondi'),
  ('Trancio di tonno scottato, misticanza asiatica e maionese al rafano',14,'secondi'),
  ('Cheesecake Homemade',6,'dolci')
) AS v(name,price,section);

INSERT INTO public.fixed_menus (slug, title, closing_message, position) VALUES
  ('colazione','COLAZIONE','Buona Giornata ☀️',0),
  ('aperitivo','APERITIVO','Buon Aperitivo 🍸',1);

INSERT INTO public.fixed_menu_sections (menu_id, name, position)
SELECT f.id, v.name, v.position FROM public.fixed_menus f,
(VALUES ('Caffetteria',0),('Lievitati',1),('Salato',2)) AS v(name,position)
WHERE f.slug = 'colazione';

INSERT INTO public.fixed_menu_sections (menu_id, name, position)
SELECT f.id, v.name, v.position FROM public.fixed_menus f,
(VALUES ('Drink',0),('Taglieri',1),('Stuzzichini',2)) AS v(name,position)
WHERE f.slug = 'aperitivo';

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER daily_menus_updated_at BEFORE UPDATE ON public.daily_menus
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();