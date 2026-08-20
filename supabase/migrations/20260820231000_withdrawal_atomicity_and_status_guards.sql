-- Withdrawal safety hardening.
-- A withdrawal request must reserve commission funds atomically with the
-- request creation. The previous browser flow deducted wallet_balance first
-- and inserted the request second, which could lose funds if the insert failed.

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

  -- Lock the profile row so two browser tabs cannot withdraw the same balance.
  SELECT COALESCE(wallet_balance, 0)
  INTO v_wallet
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
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
  )
  VALUES (
    p_user_id, p_amount, trim(p_bank_name), trim(p_account_number), trim(p_account_name), 'pending'
  )
  RETURNING * INTO v_request;

  RETURN v_request;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_withdrawal_request(uuid, numeric, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_withdrawal_request(uuid, numeric, text, text, text) TO authenticated;

-- Enforce a one-way workflow. A request cannot be approved again after it is
-- paid/rejected, and a rejected request cannot be paid accidentally.
CREATE OR REPLACE FUNCTION public.guard_withdrawal_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid withdrawal transition: pending -> %', NEW.status;
  END IF;

  IF OLD.status = 'approved' AND NEW.status NOT IN ('approved', 'paid') THEN
    RAISE EXCEPTION 'Invalid withdrawal transition: approved -> %', NEW.status;
  END IF;

  IF OLD.status IN ('paid', 'rejected') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Withdrawal request % has already been finalized', OLD.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_withdrawal_transition ON public.withdrawal_requests;
CREATE TRIGGER trg_guard_withdrawal_transition
BEFORE UPDATE OF status ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.guard_withdrawal_transition();

REVOKE ALL ON FUNCTION public.guard_withdrawal_transition() FROM PUBLIC;

-- If an approved request is later rejected before payout, return the reserved
-- commission to the realtor. Once paid, the funds remain deducted.
CREATE OR REPLACE FUNCTION public.refund_rejected_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IN ('pending', 'approved') AND NEW.status = 'rejected' THEN
    UPDATE public.profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + NEW.amount,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_rejected_withdrawal ON public.withdrawal_requests;
CREATE TRIGGER trg_refund_rejected_withdrawal
AFTER UPDATE OF status ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.refund_rejected_withdrawal();

REVOKE ALL ON FUNCTION public.refund_rejected_withdrawal() FROM PUBLIC;
