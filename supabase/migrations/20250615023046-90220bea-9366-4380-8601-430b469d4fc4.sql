
-- Create a new table to track documentation payments per user and estate
CREATE TABLE public.estate_documentation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  estate_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 150000,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on the table
ALTER TABLE public.estate_documentation_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own documentation payments
CREATE POLICY "select_own_docs_payments" ON public.estate_documentation_payments
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own documentation payments
CREATE POLICY "insert_own_docs_payments" ON public.estate_documentation_payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update only their own documentation payments
CREATE POLICY "update_own_docs_payments" ON public.estate_documentation_payments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can never delete documentation payments (admin only)
