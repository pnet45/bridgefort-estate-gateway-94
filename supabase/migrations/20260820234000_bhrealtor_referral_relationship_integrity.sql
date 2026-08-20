-- Referral relationship integrity.
-- A referral sponsor is a business relationship, not an editable profile field.
-- Once established, it cannot be changed by the user before a sale.

CREATE OR REPLACE FUNCTION public.validate_bhrealtor_referral_relationship()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cursor uuid;
  v_guard int := 0;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.referred_by_id IS DISTINCT FROM NEW.referred_by_id THEN
    IF OLD.referred_by_id IS NOT NULL AND NEW.referred_by_id IS DISTINCT FROM OLD.referred_by_id THEN
      RAISE EXCEPTION 'Referral sponsor cannot be changed after it has been assigned';
    END IF;
  END IF;

  IF NEW.referred_by_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.referred_by_id = NEW.id THEN
    RAISE EXCEPTION 'A user cannot refer themselves';
  END IF;

  -- Walk upward from the proposed sponsor. If we encounter the new user's id,
  -- the relationship would create a circular referral tree.
  v_cursor := NEW.referred_by_id;
  WHILE v_cursor IS NOT NULL LOOP
    v_guard := v_guard + 1;
    IF v_guard > 1000 THEN
      RAISE EXCEPTION 'Referral tree is too deep or circular';
    END IF;

    IF v_cursor = NEW.id THEN
      RAISE EXCEPTION 'Referral relationship would create a circular network';
    END IF;

    SELECT p.referred_by_id INTO v_cursor
    FROM public.profiles p
    WHERE p.id = v_cursor;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_bhrealtor_referral_relationship ON public.profiles;
CREATE TRIGGER trg_validate_bhrealtor_referral_relationship
BEFORE INSERT OR UPDATE OF referred_by_id
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_bhrealtor_referral_relationship();

COMMENT ON FUNCTION public.validate_bhrealtor_referral_relationship() IS
  'Protects BHRealtors referral attribution from self-referrals, cycles and sponsor changes after assignment.';
