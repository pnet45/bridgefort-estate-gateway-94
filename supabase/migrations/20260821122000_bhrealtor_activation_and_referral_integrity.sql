-- BHRealtor activation/referral integrity.
--
-- The legacy signup UI may set is_pbo/current_package before payment. That must
-- NOT activate a Realtor. A profile becomes active only after a completed
-- membership purchase exists for that user. This keeps the database as the
-- final authority even if an old frontend path still writes is_pbo=true.

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
      SELECT 1
      FROM public.mlm_membership_purchases mp
      WHERE mp.user_id = NEW.id
        AND mp.status = 'completed'
    ) INTO v_has_completed_membership;

    -- Never let ordinary profile/signup writes activate a Realtor before
    -- successful membership payment. The payment verification flow updates
    -- the membership purchase first, then the profile.
    IF NOT v_has_completed_membership THEN
      NEW.is_active := false;
    ELSE
      NEW.is_active := true;
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
    -- A non-Realtor must not retain an active Realtor identity.
    NEW.is_active := false;
  END IF;

  -- Referral relationships may only point to an active, paid BHRealtor.
  -- Also prevent direct self-referral.
  IF NEW.referred_by_id IS NOT NULL THEN
    IF NEW.referred_by_id = NEW.id
       OR NOT EXISTS (
         SELECT 1
         FROM public.profiles sponsor
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
FOR EACH ROW
EXECUTE FUNCTION public.ensure_bhrealtor_identity();

-- Existing referrals are repaired so unpaid/inactive sponsors do not remain
-- eligible for future network commissions.
UPDATE public.profiles child
SET referred_by_id = NULL,
    referred_by_code = NULL
WHERE child.referred_by_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.profiles sponsor
    WHERE sponsor.id = child.referred_by_id
      AND COALESCE(sponsor.is_pbo, false) = true
      AND COALESCE(sponsor.is_active, false) = true
  );

-- The membership commission trigger must only pay an active Realtor.
-- Keep the existing commission calculation intact; this is an eligibility
-- guard so an unpaid/inactive profile cannot receive network income.
CREATE OR REPLACE FUNCTION public.process_membership_referral_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer public.profiles;
  v_referrer public.profiles;
  v_second_referrer public.profiles;
  v_package public.mlm_packages;
  v_amount numeric;
  v_rate numeric;
  v_level_two_rate numeric;
BEGIN
  IF NEW.status <> 'completed' OR COALESCE(OLD.status, '') = 'completed' THEN
    RETURN NEW;
  END IF;

  v_amount := COALESCE(NEW.amount, 0);
  IF v_amount <= 5000 THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_buyer
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NOT FOUND OR COALESCE(v_buyer.is_pbo, false) = false OR COALESCE(v_buyer.is_active, false) = false THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_package
  FROM public.mlm_packages
  WHERE package_code = NEW.package_code;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  v_rate := CASE NEW.package_code
    WHEN 'classic_gold' THEN 15
    WHEN 'gold' THEN 10
    ELSE 5
  END;

  v_level_two_rate := CASE NEW.package_code
    WHEN 'classic_gold' THEN 15
    WHEN 'gold' THEN 10
    ELSE 0
  END;

  IF v_buyer.referred_by_id IS NOT NULL THEN
    SELECT * INTO v_referrer
    FROM public.profiles
    WHERE id = v_buyer.referred_by_id
      AND COALESCE(is_pbo, false) = true
      AND COALESCE(is_active, false) = true;

    IF FOUND THEN
      INSERT INTO public.mlm_commissions (
        beneficiary_id, source_user_id, commission_source, sponsor_level,
        commission_rate, commission_amount, status, description, source_membership_purchase_id
      ) VALUES (
        v_referrer.id, v_buyer.id, 'membership', 1,
        v_rate, ROUND(v_amount * v_rate / 100, 2), 'available',
        'BHRealtor membership referral - Level 1', NEW.id
      ) ON CONFLICT DO NOTHING;

      IF v_referrer.referred_by_id IS NOT NULL AND v_level_two_rate > 0 THEN
        SELECT * INTO v_second_referrer
        FROM public.profiles
        WHERE id = v_referrer.referred_by_id
          AND COALESCE(is_pbo, false) = true
          AND COALESCE(is_active, false) = true;

        IF FOUND THEN
          INSERT INTO public.mlm_commissions (
            beneficiary_id, source_user_id, commission_source, sponsor_level,
            commission_rate, commission_amount, status, description, source_membership_purchase_id
          ) VALUES (
            v_second_referrer.id, v_buyer.id, 'membership', 2,
            v_level_two_rate, ROUND(v_amount * v_level_two_rate / 100, 2), 'available',
            'BHRealtor membership referral - Level 2', NEW.id
          ) ON CONFLICT DO NOTHING;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.ensure_bhrealtor_identity() IS
'Enforces payment-gated BHRealtor activation, stable identity/rank, and active-sponsor referral integrity.';
