-- Restore membership-registration commissions without changing the estate-land sale engine.
--
-- Membership rule:
--   * Successful membership payment <= N5,000: no membership commission.
--   * Successful membership payment > N5,000: pay the purchaser's package
--     referral rate to level 1 and level 2 only.
--   * Gold: 10% to level 1 + 10% to level 2.
--   * Classic Gold: 15% to level 1 + 15% to level 2.
--   * Associate is N5,000, therefore it produces no membership commission.
--   * There is deliberately no separate 5% membership/upline rate. The 5%
--     rate remains reserved for the estate-land first-level referrer rule.
--
-- This is separate from property-sale commission, which remains:
--   seller 15% + first-level referrer 5% and no level 3+.

ALTER TABLE public.mlm_commissions
  ADD COLUMN IF NOT EXISTS commission_source text NOT NULL DEFAULT 'membership';

CREATE INDEX IF NOT EXISTS idx_mlm_commissions_beneficiary_source_created
  ON public.mlm_commissions (beneficiary_id, commission_source, created_at DESC);

-- Allow one membership purchase to generate exactly one commission per
-- beneficiary/level. Existing property-sale rows are protected by the same
-- uniqueness rule on source_order_id.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mlm_membership_commission_per_purchase
  ON public.mlm_commissions (source_purchase_id, beneficiary_id, sponsor_level)
  WHERE source_purchase_id IS NOT NULL;

-- The previous commission-engine migration intentionally blocked membership
-- commission inserts. Remove that block before restoring the requested rule.
DROP TRIGGER IF EXISTS trg_block_membership_referral_commission ON public.mlm_commissions;
DROP FUNCTION IF EXISTS public.block_membership_referral_commission();

CREATE OR REPLACE FUNCTION public.award_bhrealtor_membership_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_second_level_id uuid;
  v_direct_rate numeric := 0;
  v_amount numeric := 0;
  v_commission numeric := 0;
  v_inserted boolean;
BEGIN
  -- Only the transition into completed is commissionable. Re-verifying the
  -- same Paystack reference must never pay the network twice.
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  v_amount := COALESCE(NEW.amount, 0);
  IF v_amount <= 5000 THEN
    RETURN NEW;
  END IF;

  SELECT p.referred_by_id
    INTO v_referrer_id
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF v_referrer_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.referred_by_id
    INTO v_second_level_id
  FROM public.profiles p
  WHERE p.id = v_referrer_id;

  -- Membership package rate is determined from the package purchased.
  -- The N5,000 Associate package is excluded by the amount gate above.
  SELECT CASE NEW.package_code
    WHEN 'gold' THEN 10
    WHEN 'classic_gold' THEN 15
    ELSE 0
  END
  INTO v_direct_rate;

  IF v_direct_rate <= 0 THEN
    RETURN NEW;
  END IF;

  -- Level 1: purchaser's direct referrer.
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_referrer_id AND COALESCE(is_pbo, false) = true
  ) THEN
    v_commission := ROUND(v_amount * v_direct_rate / 100, 2);

    INSERT INTO public.mlm_commissions (
      source_purchase_id,
      source_order_id,
      commission_source,
      beneficiary_id,
      sponsor_level,
      commission_rate,
      commission_amount,
      status,
      description
    ) VALUES (
      NEW.id,
      NULL,
      'membership',
      v_referrer_id,
      1,
      v_direct_rate,
      v_commission,
      'available',
      v_direct_rate || '% BHRealtor membership referral commission — level 1'
    )
    ON CONFLICT (source_purchase_id, beneficiary_id, sponsor_level) DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF v_inserted THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
          total_commissions = COALESCE(total_commissions, 0) + v_commission,
          updated_at = now()
      WHERE id = v_referrer_id;
    END IF;
  END IF;

  -- Level 2: first-level referrer's own referrer. No level 3 traversal.
  IF v_second_level_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_second_level_id AND COALESCE(is_pbo, false) = true
  ) THEN
    v_commission := ROUND(v_amount * v_direct_rate / 100, 2);

    INSERT INTO public.mlm_commissions (
      source_purchase_id,
      source_order_id,
      commission_source,
      beneficiary_id,
      sponsor_level,
      commission_rate,
      commission_amount,
      status,
      description
    ) VALUES (
      NEW.id,
      NULL,
      'membership',
      v_second_level_id,
      2,
      v_direct_rate,
      v_commission,
      'available',
      v_direct_rate || '% BHRealtor membership referral commission — level 2'
    )
    ON CONFLICT (source_purchase_id, beneficiary_id, sponsor_level) DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF v_inserted THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_commission,
          total_commissions = COALESCE(total_commissions, 0) + v_commission,
          updated_at = now()
      WHERE id = v_second_level_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_bhrealtor_membership_commission ON public.mlm_membership_purchases;
CREATE TRIGGER trg_award_bhrealtor_membership_commission
AFTER UPDATE OF status ON public.mlm_membership_purchases
FOR EACH ROW
EXECUTE FUNCTION public.award_bhrealtor_membership_commission();

COMMENT ON FUNCTION public.award_bhrealtor_membership_commission() IS
  'BHRealtor membership commission: only successful payments above N5,000 qualify; Gold pays 10% to levels 1 and 2, Classic Gold pays 15% to levels 1 and 2, no separate 5% membership rate and no level 3+.';
