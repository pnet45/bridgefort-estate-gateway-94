
CREATE TABLE public.travel_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  travelers INTEGER NOT NULL CHECK (travelers >= 1 AND travelers <= 50),
  package TEXT NOT NULL,
  destination TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.travel_bookings TO anon;
GRANT SELECT, INSERT ON public.travel_bookings TO authenticated;
GRANT ALL ON public.travel_bookings TO service_role;

ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a travel booking"
  ON public.travel_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view travel bookings"
  ON public.travel_bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update travel bookings"
  ON public.travel_bookings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete travel bookings"
  ON public.travel_bookings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_travel_bookings_updated_at
  BEFORE UPDATE ON public.travel_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.travel_package_blackouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

GRANT SELECT ON public.travel_package_blackouts TO anon;
GRANT SELECT ON public.travel_package_blackouts TO authenticated;
GRANT ALL ON public.travel_package_blackouts TO service_role;

ALTER TABLE public.travel_package_blackouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blackouts"
  ON public.travel_package_blackouts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage blackouts"
  ON public.travel_package_blackouts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.travel_package_blackouts (package, start_date, end_date, reason) VALUES
  ('Luxury',  '2026-12-20', '2026-12-31', 'Peak season fully booked'),
  ('Premium', '2026-12-23', '2026-12-27', 'Holiday season unavailable'),
  ('Explorer','2026-07-01', '2026-07-10', 'Maintenance window');
