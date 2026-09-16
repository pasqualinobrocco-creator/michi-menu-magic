CREATE TABLE public.page_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  page text NOT NULL,
  visits integer NOT NULL DEFAULT 0,
  UNIQUE (visit_date, page)
);

GRANT SELECT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff reads visits" ON public.page_visits FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.track_page_visit(p_page text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_visits (visit_date, page, visits)
  VALUES (CURRENT_DATE, left(p_page, 50), 1)
  ON CONFLICT (visit_date, page)
  DO UPDATE SET visits = page_visits.visits + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_page_visit(text) TO anon, authenticated;