-- Add MLM membership packages, membership purchases, commission tracking, and profile fields.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_rank text DEFAULT 'associate',
  ADD COLUMN IF NOT EXISTS current_package text DEFAULT 'associate',
  ADD COLUMN IF NOT EXISTS total_personal_volume numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_commissions numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personally_sponsored_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_size int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.mlm_packages (
  package_code text PRIMARY KEY,
  package_name text NOT NULL,
  price numeric NOT NULL,
  direct_commission_pct numeric NOT NULL,
  indirect_commission_pct numeric NOT NULL,
  withdrawable boolean NOT NULL DEFAULT true,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.mlm_packages (package_code, package_name, price, direct_commission_pct, indirect_commission_pct, withdrawable, description)
VALUES
  ('associate', 'Associate', 5000, 5, 0, false, '5% direct sales commission; commissions are not withdrawable until upgrade.'),
  ('gold', 'Gold', 35000, 10, 5, true, '10% direct sales commission and 5% 2nd level commission.'),
  ('classic_gold', 'Classic Gold', 75000, 15, 5, true, '15% direct sales commission and 5% 2nd level commission.')
ON CONFLICT (package_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.mlm_membership_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  package_code text NOT NULL REFERENCES public.mlm_packages(package_code),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paystack_reference text UNIQUE,
  purchase_type text NOT NULL DEFAULT 'membership',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mlm_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_purchase_id uuid NOT NULL REFERENCES public.mlm_membership_purchases(id),
  beneficiary_id uuid NOT NULL REFERENCES public.profiles(id),
  sponsor_level smallint NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mlm_membership_purchases_user_id ON public.mlm_membership_purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_beneficiary_id ON public.mlm_commissions (beneficiary_id);
