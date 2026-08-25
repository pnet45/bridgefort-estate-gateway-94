-- BHRealtors commission model v2
--
-- Membership/network marketing:
--   A successful membership payment of MORE THAN ₦5,000 can pay referral
--   commissions using the package's legacy direct/indirect rates.
--   Associate = 5% direct / 0% indirect
--   Gold = 10% direct / 5% indirect
--   Classic Gold = 15% direct / 5% indirect
--   Only the first and second upline levels are eligible.
--   Payments of ₦5,000 or less create no membership referral commission.
--
-- Estate-land sales:
--   Associate seller = 5%, locked until upgrade; no upline commission.
--   Gold seller = 10%, withdrawable; seller's first-level upline gets 5%
--       only when that upline is Gold or Classic Gold.
--   Classic Gold seller = 15%, withdrawable; seller's first-level upline gets
--       5% only when that upline is Gold or Classic Gold.
--   No level 3+ commission is ever created.

-- ---------------------------------------------------------------------------
-- 1. Restore the legacy package commission configuration for MEMBERSHIP
--    referrals. These columns are now used only for membership/network income.
-- ---------------------------------------------------------------------------
UPDATE public.mlm_packages
SET
  direct_commission_pct = CASE package_code
    WHEN 'associate' THEN 5
    WHEN 'gold' THEN 10
    WHEN 'classic_gold' THEN 15
    ELSE direct_commission_pct
  END,
  indirect_commission_pct = CASE package_code
    WHEN 'associate' THEN 0
    WHEN 'gold' THEN 5
    WHEN 'classic_gold' THEN 5
    ELSE indirect_commission_pct
  END,
  withdrawable = CASE package_code
    WHEN 'associate' THEN false
    WHEN 'gold' THEN true
    WHEN 'classic_gold' THEN true
    ELSE withdrawable
  END,
  description = CASE package_code
    WHEN 'associate' THEN 'Associate: 5% membership referral income; property-sale commission 5% and locked until upgrade.'
    WHEN 'gold' THEN 'Gold: 10% membership referral income + 5% second-level membership income; property-sale commission 10% and withdrawable.'
    WHEN 'classic_gold' THEN 'Classic Gold: 15% membership referral income + 5% second-level membership income; property-sale commission 15% and withdrawable.'
    ELSE description
  END;

-- ---------------------------------------------------------------------------
-- 2. Admin-controlled membership pricing.
-- ---------------------------------------------------------------------------
ALTER TABLE public.mlm_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view BHRealtor packages" ON public.mlm_packages;
CREATE POLICY "Authenticated users can view BHRealtor packages"
ON public.mlm_packages
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can update BHRealtor package prices" ON public.mlm_packages;
CREATE POLICY "Admins can update BHRealtor package prices"
ON public.mlm_packages
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only package price may be changed by the admin-facing RPC. Commission rates
-- remain controlled by this business-rule migration and are not client-editable.
CREATE OR REPLACE FUNCTION public.update_bhrealtor_package_price(
  p_package_code text,
  p_price numeric
)
RETURNS public.mlm_packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_package public.mlm_packages;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only authorized admins can change BHRealtor package prices';
  END IF;

  IF p_package_code NOT IN ('associate', 'gold', 'classic_gold') THEN
    RAISE EXCEPTION 'Invalid BHRealtor package';
  END IF;

  IF p_price <= 0 OR p_price > 1000000000 THEN
    RAISE EXCEPTION 'Package price must be greater than zero and within the allowed range';
  END IF;

  UPDATE public.mlm_packages
  SET price = ROUND(p_price, 2)
  WHERE package_code = p_package_code
  RETURNING * INTO v_package;

  IF v_package IS NULL THEN
    RAISE EXCEPTION 'BHRealtor package not found';
  END IF;

  RETURN v_package;
END;
$$;

REVOKE ALL ON FUNCTION public.update_bhrealtor_package_price(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_bhrealtor_package_price(text, numeric) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Commission eligibility helpers.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bhrealtor_package_rank(p_package text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_package
    WHEN 'associate' THEN 1
    WHEN 'gold' THEN 2
    WHEN 'classic_gold' THEN 3
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.bhrealtor_package_can_withdraw(p_package text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.bhrealtor_package_rank(p_package) >= 2;
$$;

-- ---------------------------------------------------------------------------
-- 4. Membership purchase commissions.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_bhrealtor_membership_commissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sponsor_id uuid;
  v_sponsor2_id uuid;
  v_sponsor_is_pbo boolean;
  v_sponsor2_is_pbo boolean;
  v_package public.mlm_packages;
  v_rate numeric;
  v_amount numeric;
  v_status text;
BEGIN
  -- Only a transition to completed is commissionable.
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Explicit threshold: ₦5,000 and below earns no network commission.
  IF COALESCE(NEW.amount, 0) <= 5000 THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_package
  FROM public.mlm_packages
  WHERE package_code = NEW.package_code;

  IF v_package IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.referred_by_id, p.is_pbo
  INTO v_sponsor_id, v_sponsor_is_pbo
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF v_sponsor_id IS NULL OR NOT COALESCE(v_sponsor_is_pbo, false) THEN
    RETURN NEW;
  END IF;

  -- First-level sponsor: package's direct membership rate.
  v_rate := COALESCE(v_package.direct_commission_pct, 0);
  IF v_rate > 0 THEN
    v_amount := ROUND(NEW.amount * v_rate / 100, 2);
    v_status := CASE
      WHEN public.bhrealtor_package_can_withdraw((SELECT current_package FROM public.profiles WHERE id = v_sponsor_id))
        THEN 'available'
      ELSE 'locked'
    END;

    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NEW.id, NULL, 'membership',
      v_sponsor_id, 1, v_rate, v_amount,
      v_status, format('%s membership referral commission - first level', v_package.package_name)
    );

    UPDATE public.profiles
    SET total_commissions = COALESCE(total_commissions, 0) + v_amount,
        updated_at = now()
    WHERE id = v_sponsor_id;

    IF v_status = 'available' THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_amount
      WHERE id = v_sponsor_id;
    END IF;
  END IF;

  -- Second-level sponsor: package's indirect rate. No third level.
  SELECT p.referred_by_id, p.is_pbo
  INTO v_sponsor2_id, v_sponsor2_is_pbo
  FROM public.profiles p
  WHERE p.id = v_sponsor_id;

  IF v_sponsor2_id IS NOT NULL AND COALESCE(v_sponsor2_is_pbo, false)
     AND COALESCE(v_package.indirect_commission_pct, 0) > 0 THEN
    v_rate := v_package.indirect_commission_pct;
    v_amount := ROUND(NEW.amount * v_rate / 100, 2);
    v_status := CASE
      WHEN public.bhrealtor_package_can_withdraw((SELECT current_package FROM public.profiles WHERE id = v_sponsor2_id))
        THEN 'available'
      ELSE 'locked'
    END;

    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NEW.id, NULL, 'membership',
      v_sponsor2_id, 2, v_rate, v_amount,
      v_status, format('%s membership referral commission - second level', v_package.package_name)
    );

    UPDATE public.profiles
    SET total_commissions = COALESCE(total_commissions, 0) + v_amount,
        updated_at = now()
    WHERE id = v_sponsor2_id;

    IF v_status = 'available' THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_amount
      WHERE id = v_sponsor2_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_bhrealtor_membership_commissions ON public.mlm_membership_purchases;
CREATE TRIGGER trg_award_bhrealtor_membership_commissions
AFTER UPDATE OF status ON public.mlm_membership_purchases
FOR EACH ROW
EXECUTE FUNCTION public.award_bhrealtor_membership_commissions();

-- ---------------------------------------------------------------------------
-- 5. Upgrade unlock: Associate commissions remain locked until the Realtor
--    upgrades to Gold/Classic Gold. On upgrade, all locked commission ledger
--    entries for that beneficiary become available and are added to wallet.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unlock_bhrealtor_commissions_on_upgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locked numeric := 0;
BEGIN
  IF NEW.current_package IS NOT DISTINCT FROM OLD.current_package THEN
    RETURN NEW;
  END IF;

  IF public.bhrealtor_package_rank(NEW.current_package) < 2
     OR public.bhrealtor_package_rank(NEW.current_package) <= public.bhrealtor_package_rank(OLD.current_package) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(commission_amount), 0)
  INTO v_locked
  FROM public.mlm_commissions
  WHERE beneficiary_id = NEW.id
    AND status = 'locked';

  IF v_locked > 0 THEN
    UPDATE public.mlm_commissions
    SET status = 'available'
    WHERE beneficiary_id = NEW.id
      AND status = 'locked';

    NEW.wallet_balance := COALESCE(NEW.wallet_balance, 0) + v_locked;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unlock_bhrealtor_commissions_on_upgrade ON public.profiles;
CREATE TRIGGER trg_unlock_bhrealtor_commissions_on_upgrade
BEFORE UPDATE OF current_package ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.unlock_bhrealtor_commissions_on_upgrade();

-- ---------------------------------------------------------------------------
-- 6. Property-sale commission model based on the SELLING REALTOR'S package.
--    The purchaser's referred_by_id identifies the realtor who made the sale.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_bhrealtor_property_sale_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id uuid;
  v_seller_id uuid;
  v_level1_id uuid;
  v_seller_package text;
  v_level1_package text;
  v_seller_is_pbo boolean;
  v_level1_is_pbo boolean;
  v_seller_rate numeric;
  v_level1_rate numeric;
  v_item jsonb;
  v_property_price numeric;
  v_quantity numeric;
  v_property_id text;
  v_plot_id text;
  v_sale_id uuid;
  v_commission numeric;
  v_status text;
BEGIN
  IF NEW.payment_status <> 'paid' OR OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  v_buyer_id := NEW.user_id;

  -- Buyer is the customer. Their referred_by_id is the Realtor who made the sale.
  SELECT p.referred_by_id
  INTO v_seller_id
  FROM public.profiles p
  WHERE p.id = v_buyer_id;

  IF v_seller_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.current_package, p.is_pbo, p.referred_by_id
  INTO v_seller_package, v_seller_is_pbo, v_level1_id
  FROM public.profiles p
  WHERE p.id = v_seller_id;

  IF NOT COALESCE(v_seller_is_pbo, false) THEN
    RETURN NEW;
  END IF;

  -- Property-sale rates are determined by the seller's package.
  v_seller_rate := CASE v_seller_package
    WHEN 'associate' THEN 5
    WHEN 'gold' THEN 10
    WHEN 'classic_gold' THEN 15
    ELSE 0
  END;

  IF v_seller_rate <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT p.current_package, p.is_pbo
  INTO v_level1_package, v_level1_is_pbo
  FROM public.profiles p
  WHERE p.id = v_level1_id;

  -- Only Gold/Classic Gold uplines receive the 5% sale referral commission.
  IF v_level1_is_pbo AND public.bhrealtor_package_rank(v_level1_package) >= 2 THEN
    v_level1_rate := 5;
  ELSE
    v_level1_rate := 0;
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) LOOP
    IF COALESCE(v_item->>'property_type', '') = 'Agrovest'
       OR COALESCE(v_item->>'property_type', '') ILIKE 'Documentation%'
       OR COALESCE(v_item->>'property_type', '') ILIKE '%subscription%'
       OR COALESCE(v_item->>'property_type', '') ILIKE '%promo%' THEN
      CONTINUE;
    END IF;

    v_property_id := NULLIF(v_item->>'property_id', '');
    v_plot_id := NULLIF(v_item->>'plot_id', '');
    v_quantity := GREATEST(1, COALESCE((v_item->>'quantity')::numeric, 1));
    v_property_price := COALESCE((v_item->>'price')::numeric, 0) * v_quantity;

    IF v_property_id IS NULL OR v_property_price <= 0 THEN
      CONTINUE;
    END IF;

    -- Idempotency: commission the property/plot only once across installments.
    v_sale_id := NULL;
    IF v_plot_id IS NOT NULL THEN
      INSERT INTO public.bh_property_sales(buyer_id, order_id, property_id, plot_id, property_price)
      VALUES (v_buyer_id, NEW.id, v_property_id, v_plot_id, v_property_price)
      ON CONFLICT (buyer_id, property_id, plot_id) DO NOTHING
      RETURNING id INTO v_sale_id;
    ELSE
      INSERT INTO public.bh_property_sales(buyer_id, order_id, property_id, property_price)
      VALUES (v_buyer_id, NEW.id, v_property_id, v_property_price)
      ON CONFLICT (buyer_id, property_id) WHERE plot_id IS NULL DO NOTHING
      RETURNING id INTO v_sale_id;
    END IF;

    IF v_sale_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Selling Realtor commission.
    v_commission := ROUND(v_property_price * v_seller_rate / 100, 2);
    v_status := CASE
      WHEN v_seller_package = 'associate' THEN 'locked'
      ELSE 'available'
    END;

    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NULL, NEW.id, 'property_sale',
      v_seller_id, 1, v_seller_rate, v_commission,
      v_status, format('%s%% estate-land sales commission for %s Realtor', v_seller_rate, initcap(replace(v_seller_package, '_', ' ')))
    ) ON CONFLICT (source_order_id, beneficiary_id, sponsor_level) DO NOTHING;

    IF FOUND THEN
      UPDATE public.profiles
      SET total_commissions = COALESCE(total_commissions, 0) + v_commission,
          total_personal_volume = COALESCE(total_personal_volume, 0) + v_property_price,
          wallet_balance = CASE
            WHEN v_status = 'available' THEN COALESCE(wallet_balance, 0) + v_commission
            ELSE COALESCE(wallet_balance, 0)
          END,
          updated_at = now()
      WHERE id = v_seller_id;
    END IF;

    -- First-level upline only. No level 3+.
    IF v_level1_rate > 0 THEN
      v_commission := ROUND(v_property_price * v_level1_rate / 100, 2);
      INSERT INTO public.mlm_commissions (
        source_purchase_id, source_order_id, commission_source,
        beneficiary_id, sponsor_level, commission_rate, commission_amount,
        status, description
      ) VALUES (
        NULL, NEW.id, 'property_sale',
        v_level1_id, 2, v_level1_rate, v_commission,
        'available', '5% first-level referrer commission on an estate-land sale'
      ) ON CONFLICT (source_order_id, beneficiary_id, sponsor_level) DO NOTHING;

      IF FOUND THEN
        UPDATE public.profiles
        SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
            total_commissions = COALESCE(total_commissions, 0) + v_commission,
            updated_at = now()
        WHERE id = v_level1_id;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_bhrealtor_property_sale_commission ON public.orders;
CREATE TRIGGER trg_award_bhrealtor_property_sale_commission
AFTER UPDATE OF payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_bhrealtor_property_sale_commission();

-- The old blocker would discard the membership commissions we now intentionally
-- create. Replace it with a harmless trigger that allows the two supported sources.
DROP TRIGGER IF EXISTS trg_block_membership_referral_commission ON public.mlm_commissions;
DROP FUNCTION IF EXISTS public.block_membership_referral_commission();

CREATE INDEX IF NOT EXISTS idx_mlm_commissions_membership_source
  ON public.mlm_commissions(source_purchase_id, sponsor_level)
  WHERE commission_source = 'membership';
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_beneficiary_status
  ON public.mlm_commissions(beneficiary_id, status, created_at DESC);

COMMENT ON FUNCTION public.award_bhrealtor_membership_commissions() IS
  'Pays first/second-level membership referral commissions only after successful completion and only for payments above ₦5,000.';

COMMENT ON FUNCTION public.award_bhrealtor_property_sale_commission() IS
  'BHRealtors estate-land sales: Associate 5% locked/no upline; Gold 10% available + 5% to Gold+ upline; Classic Gold 15% available + 5% to Gold+ upline; no level 3+.';
