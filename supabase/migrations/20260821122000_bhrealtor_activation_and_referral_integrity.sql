-- BHRealtor activation/referral integrity.
-- The legacy signup UI may set is_pbo/current_package before payment. That must
-- NOT activate a Realtor. A profile becomes active only after a completed
-- membership purchase exists for that user.

CREATE OR REPLACE FUNCTION public.ensure_bhrealtor_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_completed_membership boolean := false;
BEGIN
  IF COALESCE(NEW.is_pbo, false) THEN
    SELECT EXISTS (
      SELECT 1 FROM public.mlm_membership_purchases mp
      WHERE mp.user_id = NEW.id AND mp.status = 'completed'
    ) INTO v_has_completed_membership;

    IF NOT v_has_completed_membership THEN NEW.is_active := false;
    ELSE NEW.is_active := true;
    END IF;

    IF NULLIF(trim(COALESCE(NEW.pbo_referral_code, '')), '') IS NULL THEN
      NEW.pbo_referral_code := 'BH' || upper(substr(md5(NEW.id::text), 1, 8));
    END IF;

    NEW.current_rank := CASE COALESCE(NEW.current_package, 'associate')
      WHEN 'classic_gold' THEN 'Classic Gold'
      WHEN 'gold' THEN 'Gold'
      ELSE 'Associate'
    END;
  ELSE
    NEW.is_active := false;
  END IF;

  IF NEW.referred_by_id IS NOT NULL THEN
    IF NEW.referred_by_id = NEW.id
       OR NOT EXISTS (
         SELECT 1 FROM public.profiles sponsor
         WHERE sponsor.id = NEW.referred_by_id
           AND COALESCE(sponsor.is_pbo, false) = true
           AND COALESCE(sponsor.is_active, false) = true
       ) THEN
      NEW.referred_by_id := NULL;
      NEW.referred_by_code := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_bhrealtor_identity ON public.profiles;
CREATE TRIGGER trg_ensure_bhrealtor_identity
BEFORE INSERT OR UPDATE OF is_pbo, is_active, current_package, pbo_referral_code, referred_by_id, referred_by_code
ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_bhrealtor_identity();

UPDATE public.profiles p
SET is_active = EXISTS (
  SELECT 1 FROM public.mlm_membership_purchases mp
  WHERE mp.user_id = p.id AND mp.status = 'completed'
)
WHERE p.is_pbo = true;

UPDATE public.profiles child
SET referred_by_id = NULL, referred_by_code = NULL
WHERE child.referred_by_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles sponsor
    WHERE sponsor.id = child.referred_by_id
      AND COALESCE(sponsor.is_pbo, false) = true
      AND COALESCE(sponsor.is_active, false) = true
  );

-- Replace the real membership commission function used by the existing
-- trigger. The buyer itself does not need to be active at trigger time:
-- payment verification marks the membership purchase completed first and then
-- activates the buyer profile. The sponsor(s), however, must already be active.
CREATE OR REPLACE FUNCTION public.award_bhrealtor_membership_commissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sponsor_id uuid;
  v_sponsor2_id uuid;
  v_buyer_is_pbo boolean;
  v_sponsor_is_active boolean;
  v_sponsor2_is_pbo boolean;
  v_sponsor2_is_active boolean;
  v_package public.mlm_packages;
  v_rate numeric;
  v_amount numeric;
  v_status text;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN RETURN NEW; END IF;
  IF COALESCE(NEW.amount, 0) <= 5000 THEN RETURN NEW; END IF;

  SELECT * INTO v_package FROM public.mlm_packages WHERE package_code = NEW.package_code;
  IF v_package IS NULL THEN RETURN NEW; END IF;

  SELECT p.referred_by_id, p.is_pbo
  INTO v_sponsor_id, v_buyer_is_pbo
  FROM public.profiles p WHERE p.id = NEW.user_id;

  IF NOT COALESCE(v_buyer_is_pbo, false) OR v_sponsor_id IS NULL THEN RETURN NEW; END IF;

  SELECT is_active INTO v_sponsor_is_active
  FROM public.profiles WHERE id = v_sponsor_id;
  IF NOT COALESCE(v_sponsor_is_active, false) THEN RETURN NEW; END IF;

  v_rate := COALESCE(v_package.direct_commission_pct, 0);
  IF v_rate > 0 THEN
    v_amount := ROUND(NEW.amount * v_rate / 100, 2);

    SELECT public.bhrealtor_package_can_withdraw(current_package)
    INTO v_sponsor2_is_active
    FROM public.profiles WHERE id = v_sponsor_id;

    v_status := CASE WHEN COALESCE(v_sponsor2_is_active, false) THEN 'available' ELSE 'locked' END;

    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NEW.id, NULL, 'membership', v_sponsor_id, 1, v_rate, v_amount,
      v_status, format('%s membership referral commission - first level', v_package.package_name)
    ) ON CONFLICT DO NOTHING;

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

  SELECT p.referred_by_id, p.is_pbo, p.is_active
  INTO v_sponsor2_id, v_sponsor2_is_pbo, v_sponsor2_is_active
  FROM public.profiles p WHERE p.id = v_sponsor_id;

  IF v_sponsor2_id IS NOT NULL
     AND COALESCE(v_sponsor2_is_pbo, false)
     AND COALESCE(v_sponsor2_is_active, false)
     AND COALESCE(v_package.indirect_commission_pct, 0) > 0 THEN
    v_rate := v_package.indirect_commission_pct;
    v_amount := ROUND(NEW.amount * v_rate / 100, 2);

    SELECT public.bhrealtor_package_can_withdraw(current_package)
    INTO v_sponsor2_is_active
    FROM public.profiles WHERE id = v_sponsor2_id;

    v_status := CASE WHEN COALESCE(v_sponsor2_is_active, false) THEN 'available' ELSE 'locked' END;

    INSERT INTO public.mlm_commissions (
      source_purchase_id, source_order_id, commission_source,
      beneficiary_id, sponsor_level, commission_rate, commission_amount,
      status, description
    ) VALUES (
      NEW.id, NULL, 'membership', v_sponsor2_id, 2, v_rate, v_amount,
      v_status, format('%s membership referral commission - second level', v_package.package_name)
    ) ON CONFLICT DO NOTHING;

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

COMMENT ON FUNCTION public.ensure_bhrealtor_identity() IS
'Enforces payment-gated BHRealtor activation, stable identity/rank, and active-sponsor referral integrity.';
