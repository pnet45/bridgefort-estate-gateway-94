
-- Payment agreements: each represents a client choosing a plan for a property
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  property_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('outright', '1-3', '4-6', '7-12')),
  months INTEGER NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_percent NUMERIC NOT NULL,
  interest_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Every payment made is stored as a transaction
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  channel TEXT, -- e.g. "paystack", "bank", etc
  notes TEXT
);

-- RLS for payments: user can only see/modify their own
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own payment plans" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments"   ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments"   ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payments"   ON public.payments FOR DELETE USING (auth.uid() = user_id);

-- RLS for payment_transactions: user can only see/modify their own
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own payment transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment transactions" ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment transactions" ON public.payment_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment transactions" ON public.payment_transactions FOR DELETE USING (auth.uid() = user_id);
