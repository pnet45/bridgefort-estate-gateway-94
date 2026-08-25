-- BHRealtors business-rule correction.
--
-- PROPERTY SALE COMMISSION (estate land only):
--   Seller/referring realtor: 15% of the property price.
--   Seller's own first-level referrer: 5% of the property price.
--   No level 3+ commissions.
--
-- IMPORTANT: membership/package purchases NEVER create referral commissions.
-- Membership is only a package/tier purchase; property-sale commission is
-- created when an estate-land order becomes PAID after admin approval.

-- The legacy commission table was designed around membership purchases.
-- Keep it for history, but make the source flexible enough to hold property
-- sale commissions without destroying existing records.
ALTER TABLE public.mlm_commissions
  ALTER COLUMN source_purchase_id DROP NOT NULL;

ALTER TABLE public.mlm_commissions
  ADD COLUMN IF NOT EXISTS source_order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS commission_source text NOT NULL DEFAULT 'membership';

CREATE INDEX IF NOT EXISTS idx_mlm_commissions_source_order_id
  ON public.mlm_commissions(source_order_id);

-- One beneficiary can receive only one commission at each eligible level for
-- a given property order. This makes retries/idempotent payment callbacks safe.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mlm_property_commission_per_order
  ON public.mlm_commissions(source_order_id, beneficiary_id, sponsor_level)
  WHERE source_order_id IS NOT NULL;

-- Membership purchases are NOT commissionable. The old Paystack verifier still
-- contains a legacy commission block, so silently skip membership-only inserts
-- rather than allowing old package rules to pay 5/10/15% referral commissions.
CREATE OR REPLACE FUNCTION public.block_membership_referral_commission()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.source_order_id IS NULL AND NEW.source_purchase_id IS NOT NULL THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_membership_referral_commission ON public.mlm_commissions;
CREATE TRIGGER trg_block_membership_referral_commission
BEFORE INSERT ON public.mlm_commissions
FOR EACH ROW
EXECUTE FUNCTION public.block_membership_referral_commission();

-- Package percentages no longer control property-sale commissions.
UPDATE public.mlm_packages
SET direct_commission_pct = 0,
    indirect_commission_pct = 0,
    withdrawable = true,
    description = CASE package_code
      WHEN 'associate' THEN 'Associate membership package. Property-sale commissions are governed separately by the BHRealtors 15%/5% estate-sale commission policy.'
      WHEN 'gold' THEN 'Gold membership package. Property-sale commissions are governed separately by the BHRealtors 15%/5% estate-sale commission policy.'
      WHEN 'classic_gold' THEN 'Classic Gold membership package. Property-sale commissions are governed separately by the BHRealtors 15%/5% estate-sale commission policy.'
      ELSE description
    END;

-- Canonical package/rank mapping. Membership tier and property commission
-- rate are deliberately separate concepts.
CREATE OR REPLACE FUNCTION public.sync_bhrealtor_rank_from_package()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.current_package IS DISTINCT FROM OLD.current_package THEN
    NEW.current_rank := CASE NEW.current_package
      WHEN 'classic_gold' THEN 'Classic Gold'
      WHEN 'gold' THEN 'Gold'
      WHEN 'associate' THEN 'Associate'
      ELSE COALESCE(OLD.current_rank, 'Associate')
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_bhrealtor_rank_from_package ON public.profiles;
CREATE TRIGGER trg_sync_bhrealtor_rank_from_package
BEFORE UPDATE OF current_package ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_bhrealtor_rank_from_package();

-- Recalculate network counters from the referral relationship instead of
-- trusting stale client-side numbers.
CREATE OR REPLACE FUNCTION public.refresh_bhrealtor_network_counters(p_root_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_direct int;
  v_team int;
BEGIN
  IF p_root_id IS NULL THEN RETURN; END IF;

  SELECT COUNT(*)::int INTO v_direct
  FROM public.profiles
  WHERE referred_by_id = p_root_id;

  SELECT COUNT(*)::int INTO v_team
  FROM public.get_downline_ids(p_root_id);

  UPDATE public.profiles
  SET personally_sponsored_count = v_direct,
      team_size = v_team,
      updated_at = now()
  WHERE id = p_root_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_bhrealtor_network_after_referral_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.referred_by_id IS DISTINCT FROM NEW.referred_by_id THEN
    PERFORM public.refresh_bhrealtor_network_counters(OLD.referred_by_id);
  END IF;

  PERFORM public.refresh_bhrealtor_network_counters(NEW.referred_by_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_bhrealtor_network_after_referral_change ON public.profiles;
CREATE TRIGGER trg_refresh_bhrealtor_network_after_referral_change
AFTER INSERT OR UPDATE OF referred_by_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.refresh_bhrealtor_network_after_referral_change();

-- Award property commissions only when an order is actually paid. This is
-- downstream of payment approval, so a pending/rejected payment earns nothing.
CREATE OR REPLACE FUNCTION public.award_bhrealtor_property_sale_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id uuid;
  v_level1_id uuid;
  v_level2_id uuid;
  v_seller_is_pbo boolean;
  v_level1_is_pbo boolean;
  v_level2_is_pbo boolean;
  v_seller_name text;
  v_item jsonb;
  v_property_price numeric;
  v_commission numeric;
  v_existing boolean;
BEGIN
  IF NEW.payment_status <> 'paid' OR OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- The purchaser's referred_by_id is the realtor who made/referred the sale.
  SELECT p.id, p.referred_by_id, p.is_pbo, p.first_name
  INTO v_seller_id, v_level1_id, v_seller_is_pbo, v_seller_name
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF v_seller_id IS NULL OR COALESCE(v_seller_is_pbo, false) = false OR v_level1_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.referred_by_id, p.is_pbo
  INTO v_level2_id, v_level1_is_pbo
  FROM public.profiles p
  WHERE p.id = v_level1_id;

  v_level2_is_pbo := COALESCE(v_level2_is_pbo, false);

  -- Only estate-land/listing items qualify. Documentation, Agrovest and
  -- subscription/promo products never enter this commission engine.
  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) LOOP
    IF COALESCE(v_item->>'property_type', '') = 'Agrovest'
       OR COALESCE(v_item->>'property_type', '') ILIKE 'Documentation%'
       OR COALESCE(v_item->>'property_type', '') ILIKE '%subscription%'
       OR COALESCE(v_item->>'property_type', '') ILIKE '%promo%' THEN
      CONTINUE;
    END IF;

    v_property_price := COALESCE((v_item->>'price')::numeric, 0)
      * GREATEST(1, COALESCE((v_item->>'quantity')::numeric, 1));

    IF v_property_price <= 0 THEN
      CONTINUE;
    END IF;

    -- Seller: exactly 15%.
    v_commission := ROUND(v_property_price * 0.15, 2);
    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NULL, NEW.id, 'property_sale',
      v_seller_id, 1, 15, v_commission,
      'available', '15% estate-land sale commission for the selling realtor'
    ) ON CONFLICT (source_order_id, beneficiary_id, sponsor_level) DO NOTHING;

    IF FOUND THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
          total_commissions = COALESCE(total_commissions, 0) + v_commission,
          total_personal_volume = COALESCE(total_personal_volume, 0) + v_property_price,
          updated_at = now()
      WHERE id = v_seller_id;
    END IF;

    -- Seller's first-level referrer: exactly 5%. There is intentionally NO
    -- recursive loop beyond this one upline.
    IF v_level1_id IS NOT NULL AND v_level1_is_pbo THEN
      v_commission := ROUND(v_property_price * 0.05, 2);
      INSERT INTO public.mlm_commissions (
        source_purchase_id, source_order_id, commission_source,
        beneficiary_id, sponsor_level, commission_rate, commission_amount,
        status, description
      ) VALUES (
        NULL, NEW.id, 'property_sale',
        v_level1_id, 2, 5, v_commission,
        'available', '5% first-level referrer commission for an estate-land sale'
      ) ON CONFLICT (source_order_id, beneficiary_id, sponsor_level) DO NOTHING;

      IF FOUND THEN
        UPDATE public.profiles
        SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
            total_commissions = COALESCE(total_commissions, 0) + v_commission,
            updated_at = now()
        WHERE id = v_level1_id;
      END IF;
    END IF;

    -- Deliberately stop here. v_level2_id is not paid. It is only retained in
    -- the relationship graph so the tree can display the network correctly.
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_bhrealtor_property_sale_commission ON public.orders;
CREATE TRIGGER trg_award_bhrealtor_property_sale_commission
AFTER UPDATE OF payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_bhrealtor_property_sale_commission();

-- Useful indexes for the network/commission screens.
CREATE INDEX IF NOT EXISTS idx_profiles_is_pbo_referred_by ON public.profiles(is_pbo, referred_by_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_beneficiary_source ON public.mlm_commissions(beneficiary_id, commission_source, created_at DESC);

COMMENT ON FUNCTION public.award_bhrealtor_property_sale_commission() IS
  'BHRealtors property-sale commission: seller 15%, seller first-level referrer 5%, no level 3+ commission. Membership purchases are excluded.';
