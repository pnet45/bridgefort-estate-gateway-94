
-- Add is_sold_out and size_unit columns to estate table
ALTER TABLE public.estate ADD COLUMN IF NOT EXISTS is_sold_out boolean DEFAULT false;
ALTER TABLE public.estate ADD COLUMN IF NOT EXISTS size_unit text DEFAULT 'sqm';

-- Create estate_other_payments table for per-estate custom fees
CREATE TABLE IF NOT EXISTS public.estate_other_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES public.estate(id) ON DELETE CASCADE,
  payment_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.estate_other_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view estate other payments" ON public.estate_other_payments FOR SELECT USING (true);
CREATE POLICY "Only admins can insert estate other payments" ON public.estate_other_payments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update estate other payments" ON public.estate_other_payments FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete estate other payments" ON public.estate_other_payments FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Create role_permissions table for simple toggles
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission_key text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role, permission_key)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view role permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Only admins can manage role permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add employment_status and monthly_income to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_income numeric;

-- Insert default permissions for all roles
INSERT INTO public.role_permissions (role, permission_key, is_enabled) VALUES
  ('client', 'can_view_properties', true),
  ('client', 'can_purchase', true),
  ('client', 'can_book_inspection', true),
  ('client', 'can_download_forms', true),
  ('client', 'can_view_blog', true),
  ('client', 'can_register_training', true),
  ('pbo', 'can_view_properties', true),
  ('pbo', 'can_purchase', true),
  ('pbo', 'can_book_inspection', true),
  ('pbo', 'can_download_forms', true),
  ('pbo', 'can_view_blog', true),
  ('pbo', 'can_register_training', true),
  ('pbo', 'can_refer_clients', true),
  ('staff', 'can_view_properties', true),
  ('staff', 'can_purchase', true),
  ('staff', 'can_book_inspection', true),
  ('staff', 'can_download_forms', true),
  ('staff', 'can_view_blog', true),
  ('staff', 'can_register_training', true),
  ('staff', 'can_manage_inspections', true),
  ('guest', 'can_view_properties', true),
  ('guest', 'can_view_blog', true),
  ('guest', 'can_register_training', true)
ON CONFLICT (role, permission_key) DO NOTHING;
