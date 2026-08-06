ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS reference text;
CREATE INDEX IF NOT EXISTS payments_reference_idx ON public.payments (reference);