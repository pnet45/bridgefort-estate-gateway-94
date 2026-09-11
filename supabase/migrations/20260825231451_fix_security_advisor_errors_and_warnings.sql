-- ============================================================
-- ERROR: rls_disabled_in_public
-- ============================================================

-- Pure internal sequence table for next_estate_subscription_number().
-- No user_id/PII, no legitimate direct client access at all.
ALTER TABLE public.estate_subscription_counters ENABLE ROW LEVEL SECURITY;

-- estate_subscriptions had RLS disabled entirely — anyone could read every
-- subscriber's name, email and payment amounts directly via PostgREST.
-- All legitimate writes already go through SECURITY DEFINER functions
-- (create_estate_subscription, issue_estate_subscription_for_order, etc.)
-- which bypass RLS via ownership, so adding read-only policies here does
-- not affect those flows at all.
ALTER TABLE public.estate_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estate_subscriptions_select_own"
ON public.estate_subscriptions
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "estate_subscriptions_admin_select_all"
ON public.estate_subscriptions
FOR SELECT
TO authenticated
USING (
  public.user_has_permission(auth.uid(), 'admin:view_approvals')
  OR public.user_has_permission(auth.uid(), 'admin:all')
);

-- ============================================================
-- ERROR: security_definer_view
-- ============================================================

-- my_properties already filters by auth.uid() = o.user_id, and every
-- table it joins (orders, documentation_types, estate_documentation_payments,
-- and now estate_subscriptions) already has a matching "own row" SELECT
-- policy for authenticated users — safe to flip to invoker mode.
ALTER VIEW public.my_properties SET (security_invoker = true);

-- pbo_referral_leaderboard is intentionally public (first name + last
-- initial only — no PII) but aggregates across *other users'* profiles
-- rows, which plain RLS can't safely expose without opening the whole
-- profiles table to direct querying. Move the privileged aggregation into
-- a SECURITY DEFINER function (the correct pattern for this), then make
-- the view a thin security_invoker wrapper around it — same query
-- interface for the frontend, no behavior change.
CREATE OR REPLACE FUNCTION public.get_pbo_referral_leaderboard()
RETURNS TABLE(
  pbo_id uuid,
  first_name text,
  last_initial text,
  current_package text,
  current_rank text,
  downline_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id AS pbo_id,
    p.first_name,
    left(coalesce(p.last_name, ''), 1) AS last_initial,
    p.current_package,
    p.current_rank,
    count(d.id) AS downline_count
  FROM public.profiles p
  LEFT JOIN public.profiles d ON d.referred_by_id = p.id
  WHERE p.is_pbo = true
  GROUP BY p.id, p.first_name, p.last_name, p.current_package, p.current_rank
  HAVING count(d.id) > 0
  ORDER BY count(d.id) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_pbo_referral_leaderboard() TO anon, authenticated;

DROP VIEW public.pbo_referral_leaderboard;

CREATE VIEW public.pbo_referral_leaderboard
WITH (security_invoker = true) AS
SELECT * FROM public.get_pbo_referral_leaderboard();

GRANT SELECT ON public.pbo_referral_leaderboard TO anon, authenticated;

-- ============================================================
-- WARN: function_search_path_mutable
-- Metadata-only change — does not touch function logic/behavior.
-- ============================================================
ALTER FUNCTION public.estate_code_from_name(text) SET search_path TO 'public';
ALTER FUNCTION public.guard_withdrawal_transition() SET search_path TO 'public';
ALTER FUNCTION public.bhrealtor_package_rank(text) SET search_path TO 'public';
ALTER FUNCTION public.bhrealtor_package_can_withdraw(text) SET search_path TO 'public';

-- ============================================================
-- WARN: anon_security_definer_function_executable
-- These are unambiguous admin-only actions (approve/reject requests,
-- view subscriber financials) that already self-guard internally via
-- is_admin()/user_has_permission() — anon has no legitimate reason to
-- ever call them. Revoking EXECUTE is pure defense-in-depth hardening;
-- `authenticated` keeps its grant since real admins need it, and the
-- internal permission checks still gate actual authorization there.
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.admin_approve_admin_request(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_approve_payment_request(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_approve_withdrawal(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_estate_subscribers(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_get_subscriber_history(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_withdrawal_status(uuid, text, text) FROM anon;
