
-- 1. Create the orders table for checkout processing
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  total_amount numeric NOT NULL,
  payment_reference text UNIQUE NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view their own orders
CREATE POLICY "Users can select their own orders" 
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own orders
CREATE POLICY "Users can insert their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Users can update their own orders (e.g. mark as paid)
CREATE POLICY "Users can update their own orders"
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own orders (optional)
CREATE POLICY "Users can delete their own orders"
  ON public.orders
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. (Optional) Add index for fast lookups by payment_reference
CREATE INDEX idx_orders_payment_reference ON public.orders (payment_reference);

