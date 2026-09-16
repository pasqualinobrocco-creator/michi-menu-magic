CREATE TABLE public.opening_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label text NOT NULL,
    open_time text NOT NULL,
    close_time text NOT NULL,
    position integer NOT NULL DEFAULT 0,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.opening_hours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opening_hours TO authenticated;
GRANT ALL ON public.opening_hours TO service_role;

ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view opening hours" ON public.opening_hours FOR SELECT USING (true);
CREATE POLICY "Staff can manage opening hours" ON public.opening_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_opening_hours_updated_at
BEFORE UPDATE ON public.opening_hours
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.opening_hours (label, open_time, close_time, position, enabled) VALUES
('Colazione', '07:30', '10:00', 0, true),
('Pranzo', '12:00', '14:00', 1, true),
('Aperitivo', '17:00', '19:00', 2, true);