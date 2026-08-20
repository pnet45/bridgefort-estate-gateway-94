-- BHRealtors identity/rank integrity.
-- Registration is free, but once a profile is registered as a PBO it must have
-- an active Realtor identity and a stable referral code.

CREATE OR REPLACE FUNCTION public.ensure_bhrealtor_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.is_pbo, false) THEN
    NEW.is_active := true;

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

DROP TRIGGER IF EXISTS trg_ensure_bhrealtor_identity ON public.profiles;
CREATE TRIGGER trg_ensure_bhrealtor_identity
BEFORE INSERT OR UPDATE OF is_pbo, current_package, pbo_referral_code
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_bhrealtor_identity();

-- Repair existing registered Realtors that predate this integrity rule.
UPDATE public.profiles
SET is_active = true,
    pbo_referral_code = COALESCE(NULLIF(trim(pbo_referral_code), ''), 'BH' || upper(substr(md5(id::text), 1, 8))),
    current_rank = CASE COALESCE(current_package, 'associate')
      WHEN 'classic_gold' THEN 'Classic Gold'
      WHEN 'gold' THEN 'Gold'
      ELSE 'Associate'
    END
WHERE is_pbo = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_pbo_referral_code
ON public.profiles(pbo_referral_code)
WHERE pbo_referral_code IS NOT NULL;

-- Keep the public leaderboard useful for rank analysis without exposing
-- contact details or financial balances.
CREATE OR REPLACE VIEW public.pbo_referral_leaderboard AS
SELECT
  p.id AS pbo_id,
  p.first_name,
  LEFT(COALESCE(p.last_name, ''), 1) AS last_initial,
  p.current_package,
  p.current_rank,
  COUNT(d.id) AS downline_count
FROM public.profiles p
LEFT JOIN public.profiles d ON d.referred_by_id = p.id
WHERE p.is_pbo = true
GROUP BY p.id, p.first_name, p.last_name, p.current_package, p.current_rank
HAVING COUNT(d.id) > 0
ORDER BY COUNT(d.id) DESC;

GRANT SELECT ON public.pbo_referral_leaderboard TO authenticated;
