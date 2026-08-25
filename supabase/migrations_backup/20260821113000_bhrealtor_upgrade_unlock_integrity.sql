-- Associate estate-land commissions are locked. When the Realtor upgrades to
-- Gold or Classic Gold, release all previously locked commissions exactly once.
-- Membership commissions are governed by their own package/ledger status.

CREATE OR REPLACE FUNCTION public.unlock_bhrealtor_commissions_on_upgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locked numeric := 0;
BEGIN
  IF NOT COALESCE(NEW.is_pbo, false) THEN
    RETURN NEW;
  END IF;

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

  IF v_locked <= 0 THEN
    RETURN NEW;
  END IF;

  UPDATE public.mlm_commissions
  SET status = 'available', updated_at = now()
  WHERE beneficiary_id = NEW.id
    AND status = 'locked';

  UPDATE public.profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + v_locked,
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unlock_bhrealtor_commissions_on_upgrade ON public.profiles;
CREATE TRIGGER trg_unlock_bhrealtor_commissions_on_upgrade
AFTER UPDATE OF current_package ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.unlock_bhrealtor_commissions_on_upgrade();

COMMENT ON FUNCTION public.unlock_bhrealtor_commissions_on_upgrade() IS
  'When a BHRealtor advances from Associate to Gold/Classic Gold, converts existing locked commission ledger entries to available and credits the wallet once.';
