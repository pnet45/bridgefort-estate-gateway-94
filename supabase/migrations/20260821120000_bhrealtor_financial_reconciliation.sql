-- BHRealtors financial reconciliation.
-- The commission ledger is the source of truth for earned commissions. The
-- profile wallet is the withdrawable balance after pending/approved
-- withdrawals reserve funds. This audit never changes money; it reports drift
-- so an administrator can investigate safely.

CREATE OR REPLACE FUNCTION public.audit_bhrealtor_financials(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  user_id uuid,
  current_package text,
  wallet_balance numeric,
  ledger_total_commissions numeric,
  ledger_available numeric,
  ledger_locked numeric,
  ledger_withdrawn numeric,
  reserved_withdrawals numeric,
  expected_wallet numeric,
  wallet_variance numeric,
  total_commissions_variance numeric,
  is_reconciled boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_package text;
  v_wallet numeric := 0;
  v_total numeric := 0;
  v_available numeric := 0;
  v_locked numeric := 0;
  v_withdrawn numeric := 0;
  v_reserved numeric := 0;
  v_expected numeric := 0;
  v_profile_total numeric := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User is required';
  END IF;

  IF auth.uid() <> p_user_id AND NOT public.can_manage_bhrealtor_financials(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to audit this BHRealtor account';
  END IF;

  SELECT current_package, COALESCE(wallet_balance, 0), COALESCE(total_commissions, 0)
  INTO v_package, v_wallet, v_profile_total
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  SELECT
    COALESCE(SUM(commission_amount), 0),
    COALESCE(SUM(commission_amount) FILTER (WHERE status = 'available'), 0),
    COALESCE(SUM(commission_amount) FILTER (WHERE status = 'locked'), 0),
    COALESCE(SUM(commission_amount) FILTER (WHERE status = 'withdrawn'), 0)
  INTO v_total, v_available, v_locked, v_withdrawn
  FROM public.mlm_commissions
  WHERE beneficiary_id = p_user_id;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_reserved
  FROM public.withdrawal_requests
  WHERE user_id = p_user_id
    AND status IN ('pending', 'approved');

  v_expected := v_available - v_reserved;

  RETURN QUERY SELECT
    p_user_id,
    v_package,
    v_wallet,
    v_total,
    v_available,
    v_locked,
    v_withdrawn,
    v_reserved,
    v_expected,
    v_wallet - v_expected,
    v_profile_total - v_total,
    abs(v_wallet - v_expected) < 0.01 AND abs(v_profile_total - v_total) < 0.01;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_bhrealtor_financials(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_bhrealtor_financials(uuid) TO authenticated;

COMMENT ON FUNCTION public.audit_bhrealtor_financials(uuid) IS
'Read-only BHRealtor financial reconciliation. Compares commission ledger, profile totals, wallet balance and reserved withdrawals without modifying funds.';
