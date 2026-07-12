
CREATE TABLE public.bh_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  estate_slug TEXT NOT NULL,
  estate_name TEXT NOT NULL,
  plot_size TEXT NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly')),
  installment_amount NUMERIC(14,2) NOT NULL,
  total_installments INTEGER NOT NULL,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bh_subscriptions TO authenticated;
GRANT ALL ON public.bh_subscriptions TO service_role;
ALTER TABLE public.bh_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subs select" ON public.bh_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own subs insert" ON public.bh_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own subs update" ON public.bh_subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin subs delete" ON public.bh_subscriptions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER bh_subs_updated_at BEFORE UPDATE ON public.bh_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bh_subscription_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.bh_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  paystack_reference TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bh_subscription_payments TO authenticated;
GRANT ALL ON public.bh_subscription_payments TO service_role;
ALTER TABLE public.bh_subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pmt select" ON public.bh_subscription_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own pmt insert" ON public.bh_subscription_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
