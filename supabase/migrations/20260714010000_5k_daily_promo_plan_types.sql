-- Allow the "5K Daily Promo" savings plans (daily/weekly/monthly recurring
-- contributions toward a land plot) to be recorded in the existing payments
-- table alongside the current outright/1-3/4-6/7-12 installment plans.
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_type_check;

ALTER TABLE public.payments ADD CONSTRAINT payments_plan_type_check
  CHECK (plan_type IN ('outright', '1-3', '4-6', '7-12', 'daily', 'weekly', 'monthly'));

-- Track which recurring frequency + target estate/tier a "5K Daily Promo"
-- plan belongs to, so the cart page can compute an accurate countdown.
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS promo_estate_slug TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS promo_installment_amount NUMERIC;
