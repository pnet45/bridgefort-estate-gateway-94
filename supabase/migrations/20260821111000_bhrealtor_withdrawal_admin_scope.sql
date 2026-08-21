-- Withdrawal processing is a financial operation. Do not use the broad
-- legacy has_role('admin') compatibility role here.
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
  IF NOT public.can_manage_bhrealtor_financials(auth.uid()) THEN
    RAISE EXCEPTION 'Only authorized BHRealtors financial administrators can process withdrawals';
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
