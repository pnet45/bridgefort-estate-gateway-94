-- BHRealtor network integrity and analytics.
-- IMPORTANT: being marked as a PBO is not by itself proof of paid activation.
-- Membership completion/activation remains the payment flow's responsibility.

-- Replace the earlier identity trigger which could activate an unpaid PBO.
CREATE OR REPLACE FUNCTION public.ensure_bhrealtor_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.is_pbo, false) THEN
    -- Do not force is_active here. Successful membership payment is the
    -- authoritative activation event.
    IF NULLIF(trim(COALESCE(NEW.pbo_referral_code, '')), '') IS NULL THEN
      NEW.pbo_referral_code := 'BH' || upper(substr(md5(NEW.id::text), 1, 8));
    END IF;

    NEW.current_rank := CASE COALESCE(NEW.current_package, 'associate')
      WHEN 'classic_gold' THEN 'Classic Gold'
      WHEN 'gold' THEN 'Gold'
      ELSE 'Associate'
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Prevent self-referral and direct referral cycles at the row level.
CREATE OR REPLACE FUNCTION public.validate_bhrealtor_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cursor uuid;
  v_depth integer := 0;
BEGIN
  IF NEW.referred_by_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.referred_by_id = NEW.id THEN
    RAISE EXCEPTION 'A BHRealtor cannot refer themselves';
  END IF;

  SELECT id INTO v_cursor
  FROM public.profiles
  WHERE id = NEW.referred_by_id
    AND COALESCE(is_pbo, false) = true
    AND COALESCE(is_active, false) = true;

  IF v_cursor IS NULL THEN
    RAISE EXCEPTION 'Referral sponsor must be an active BHRealtor';
  END IF;

  -- Walk upward through the sponsor chain and reject any cycle.
  WHILE v_cursor IS NOT NULL AND v_depth < 100 DO
    IF v_cursor = NEW.id THEN
      RAISE EXCEPTION 'Referral relationship would create a circular network';
    END IF;
    SELECT referred_by_id INTO v_cursor
    FROM public.profiles
    WHERE id = v_cursor;
    v_depth := v_depth + 1;
  END LOOP;

  IF v_depth >= 100 AND v_cursor IS NOT NULL THEN
    RAISE EXCEPTION 'Referral network depth validation exceeded safe limit';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_bhrealtor_referral ON public.profiles;
CREATE TRIGGER trg_validate_bhrealtor_referral
BEFORE INSERT OR UPDATE OF referred_by_id
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_bhrealtor_referral();

-- Only active paid Realtors should appear in network leaderboard analytics.
DROP VIEW IF EXISTS public.pbo_referral_leaderboard;
CREATE VIEW public.pbo_referral_leaderboard AS
SELECT
  p.id AS pbo_id,
  p.first_name,
  LEFT(COALESCE(p.last_name, ''), 1) AS last_initial,
  p.current_package,
  p.current_rank,
  COUNT(d.id) AS downline_count
FROM public.profiles p
LEFT JOIN public.profiles d
  ON d.referred_by_id = p.id
 AND COALESCE(d.is_pbo, false) = true
 AND COALESCE(d.is_active, false) = true
WHERE COALESCE(p.is_pbo, false) = true
  AND COALESCE(p.is_active, false) = true
GROUP BY p.id, p.first_name, p.last_name, p.current_package, p.current_rank
HAVING COUNT(d.id) > 0
ORDER BY COUNT(d.id) DESC, p.first_name ASC;

GRANT SELECT ON public.pbo_referral_leaderboard TO authenticated;

-- Dashboard-friendly network summary. This does not expose financial ledger rows.
CREATE OR REPLACE VIEW public.bhrealtor_network_summary AS
SELECT
  p.id AS realtor_id,
  p.current_package,
  p.current_rank,
  COUNT(d.id) FILTER (WHERE d.is_pbo = true AND d.is_active = true) AS direct_active_realtors,
  COUNT(d.id) FILTER (WHERE d.is_pbo = true) AS direct_registered_realtors
FROM public.profiles p
LEFT JOIN public.profiles d ON d.referred_by_id = p.id
WHERE p.is_pbo = true
  AND p.is_active = true
GROUP BY p.id, p.current_package, p.current_rank;

GRANT SELECT ON public.bhrealtor_network_summary TO authenticated;
