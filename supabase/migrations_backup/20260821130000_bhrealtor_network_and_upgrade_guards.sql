-- BHRealtor network integrity: referrals must remain acyclic and package changes
-- can only move upward. Associate may upgrade directly to Gold OR Classic Gold.

CREATE OR REPLACE FUNCTION public.validate_bhrealtor_network_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cursor uuid;
  v_steps integer := 0;
BEGIN
  IF NEW.referred_by_id IS DISTINCT FROM OLD.referred_by_id
     AND NEW.referred_by_id IS NOT NULL THEN
    IF NEW.referred_by_id = NEW.id THEN
      RAISE EXCEPTION 'A Realtor cannot refer themselves';
    END IF;

    -- Walk upward from the proposed sponsor. If we reach this user, the
    -- proposed change would create a referral cycle.
    v_cursor := NEW.referred_by_id;
    WHILE v_cursor IS NOT NULL AND v_steps < 1000 LOOP
      IF v_cursor = NEW.id THEN
        RAISE EXCEPTION 'Referral relationship would create a network cycle';
      END IF;
      SELECT referred_by_id INTO v_cursor FROM public.profiles WHERE id = v_cursor;
      v_steps := v_steps + 1;
    END LOOP;
  END IF;

  IF NEW.current_package IS DISTINCT FROM OLD.current_package THEN
    IF public.bhrealtor_package_rank(NEW.current_package) < public.bhrealtor_package_rank(COALESCE(OLD.current_package, 'associate')) THEN
      RAISE EXCEPTION 'BHRealtor packages cannot be downgraded';
    END IF;

    IF NEW.current_package NOT IN ('associate', 'gold', 'classic_gold') THEN
      RAISE EXCEPTION 'Invalid BHRealtor package';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_bhrealtor_network_change ON public.profiles;
CREATE TRIGGER trg_validate_bhrealtor_network_change
BEFORE UPDATE OF referred_by_id, current_package ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_bhrealtor_network_change();

COMMENT ON FUNCTION public.validate_bhrealtor_network_change() IS
'Prevents BHRealtor referral cycles and package downgrades. Associate can upgrade directly to Gold or Classic Gold.';
