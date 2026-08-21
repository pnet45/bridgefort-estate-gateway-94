-- BHRealtors wallet/withdrawal hardening.
-- Keeps the commission ledger authoritative and makes withdrawal eligibility
-- match the package rules.

-- A membership purchase may create at most one commission per beneficiary
-- and sponsor level. This protects against repeated verification/webhook calls.
CREATE UNIQUE INDEX IF NOT EXISTS uq_mlm_membership_commission_once
ON public.mlm_commissions(source_purchase_id, beneficiary_id, sponsor_level)
WHERE commission_source = 'membership' AND source_purchase_id IS NOT NULL;

-- Realtors below Gold must never withdraw a wallet balance. Associate
-- commissions are intentionally locked until upgrade.
CREATE OR REPLACE FUNCTION public.submit_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text
)
RETURNS public.withdrawal_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet numeric;
  v_package text;
  v_request public.withdrawal_requests;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'You can only submit a withdrawal for your own account';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero';
  END IF;

  IF NULLIF(trim(p_bank_name), '') IS NULL
     OR NULLIF(trim(p_account_number), '') IS NULL
     OR NULLIF(trim(p_account_name), '') IS NULL THEN
    RAISE EXCEPTION 'Complete bank account details before requesting a withdrawal';
  END IF;

  SELECT current_package, COALESCE(wallet_balance, 0)
  INTO v_package, v_wallet
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF public.bhrealtor_package_rank(v_package) < 2 THEN
    RAISE EXCEPTION 'Associate commissions are locked until you upgrade to Gold or Classic Gold';
  END IF;

  IF p_amount > v_wallet THEN
    RAISE EXCEPTION 'Insufficient commission balance';
  END IF;

  UPDATE public.profiles
  SET wallet_balance = v_wallet - p_amount,
      updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.withdrawal_requests (
    user_id, amount, bank_name, account_number, account_name, status
  ) VALUES (
    p_user_id, p_amount, trim(p_bank_name), trim(p_account_number), trim(p_account_name), 'pending'
  ) RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_withdrawal_request(uuid, numeric, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_withdrawal_request(uuid, numeric, text, text, text) TO authenticated;

-- Admin status changes remain protected by the existing transition trigger,
-- while this RPC gives the admin console one server-side path for processing.
CREATE OR REPLACE FUNCTION public.admin_update_withdrawal_status(
  p_request_id uuid,
  p_status text,
  p_admin_notes text DEFAULT NULL
)
RETURNS public.withdrawal_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.withdrawal_requests;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only authorized admins can process withdrawals';
  END IF;

  IF p_status NOT IN ('approved', 'rejected', 'paid') THEN
    RAISE EXCEPTION 'Invalid withdrawal status';
  END IF;

  UPDATE public.withdrawal_requests
  SET status = p_status,
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      processed_by = auth.uid(),
      processed_at = now(),
      updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Withdrawal request not found';
  END IF;

  RETURN v_request;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_withdrawal_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_withdrawal_status(uuid, text, text) TO authenticated;
