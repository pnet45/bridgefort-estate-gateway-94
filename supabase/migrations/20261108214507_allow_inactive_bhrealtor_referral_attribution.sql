-- Allow inactive BHRealtors members to share referral links and receive
-- referral attribution. Commission functions intentionally retain their
-- active-sponsor checks; inactive members do not earn commissions while inactive.
CREATE OR REPLACE FUNCTION public.lookup_bhrealtor_referral(_code text)
RETURNS TABLE (realtor_id uuid, first_name text, last_initial text, package text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
  SELECT
    p.id,
    COALESCE(p.first_name, ''),
    CASE
      WHEN NULLIF(TRIM(p.last_name), '') IS NULL THEN ''
      ELSE LEFT(TRIM(p.last_name), 1)
    END,
    COALESCE(p.current_package, 'associate')
  FROM public.profiles p
  WHERE LOWER(TRIM(p.pbo_referral_code)) = LOWER(TRIM(_code))
    AND COALESCE(p.is_pbo, FALSE) = TRUE
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.lookup_bhrealtor_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_bhrealtor_referral(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_bhrealtor_sponsor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sponsor_is_pbo boolean;
BEGIN
  IF NEW.referred_by_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.referred_by_id IS NOT DISTINCT FROM OLD.referred_by_id THEN
    RETURN NEW;
  END IF;

  IF NEW.referred_by_id = NEW.id THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'A Realtor cannot refer themselves.';
  END IF;

  SELECT p.is_pbo
  INTO sponsor_is_pbo
  FROM public.profiles p
  WHERE p.id = NEW.referred_by_id;

  IF NOT COALESCE(sponsor_is_pbo, FALSE) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'The referral sponsor must be a BHRealtors member.';
  END IF;

  RETURN NEW;
END;
$$;

-- Do not loosen commission eligibility: the membership and property-sale
-- commission triggers continue to require an active sponsor.
