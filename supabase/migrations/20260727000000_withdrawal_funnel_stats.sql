-- Withdrawal funnel stats for the new Admin Console "MLM Funnel" tab.
-- Deliberately a SECURITY DEFINER function rather than a plain view: a view
-- would run with the *owner's* privileges and (if granted to authenticated)
-- hand every logged-in user aggregate payout totals. This function instead
-- checks the caller's own role internally and returns nothing for
-- non-admins, the same fail-safe shape used elsewhere in this project.
--
-- Note: this intentionally only reads public.withdrawal_requests, which is
-- confirmed live. public.mlm_commissions / mlm_membership_purchases (from
-- 20260520143000_add_mlm_structures.sql) are NOT yet deployed, so this
-- dashboard doesn't depend on them — commission totals can be added once
-- that migration is actually run.

CREATE OR REPLACE FUNCTION public.get_withdrawal_funnel_stats()
RETURNS TABLE (status text, request_count bigint, total_amount numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.status, COUNT(*) AS request_count, COALESCE(SUM(w.amount), 0) AS total_amount
  FROM public.withdrawal_requests w
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  GROUP BY w.status;
$$;

GRANT EXECUTE ON FUNCTION public.get_withdrawal_funnel_stats() TO authenticated;
