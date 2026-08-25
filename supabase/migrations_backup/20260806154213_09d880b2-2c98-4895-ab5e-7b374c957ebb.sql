ALTER TABLE public.estate_documentation_payments ADD COLUMN IF NOT EXISTS reference text;
CREATE INDEX IF NOT EXISTS estate_documentation_payments_reference_idx ON public.estate_documentation_payments (reference);
CREATE INDEX IF NOT EXISTS payment_requests_reference_idx ON public.payment_requests (reference);