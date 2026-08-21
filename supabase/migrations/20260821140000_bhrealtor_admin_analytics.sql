CREATE OR REPLACE FUNCTION public.get_bhrealtor_admin_analytics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.can_manage_bhrealtor_financials(auth.uid()) THEN
    RAISE EXCEPTION 'Only authorized BHRealtors administrators can view financial analytics';
  END IF;

  SELECT jsonb_build_object(
    'members', (SELECT count(*) FROM public.profiles WHERE is_pbo = true),
    'active_realtors', (SELECT count(*) FROM public.profiles WHERE is_pbo = true AND is_active = true),
    'inactive_realtors', (SELECT count(*) FROM public.profiles WHERE is_pbo = true AND COALESCE(is_active, false) = false),
    'packages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'package_code', x.package_code,
        'package_name', x.package_name,
        'count', x.member_count
      ) ORDER BY x.package_code)
      FROM (
        SELECT mp.package_code, mp.package_name, count(p.id)::int AS member_count
        FROM public.mlm_packages mp
        LEFT JOIN public.profiles p
          ON p.is_pbo = true
         AND p.is_active = true
         AND p.current_package = mp.package_code
        GROUP BY mp.package_code, mp.package_name
      ) x
    ), '[]'::jsonb),
    'commissions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'status', x.status,
        'amount', x.amount,
        'count', x.row_count
      ) ORDER BY x.status)
      FROM (
        SELECT COALESCE(mc.status, 'unknown') AS status,
               COALESCE(sum(mc.commission_amount), 0)::numeric AS amount,
               count(*)::int AS row_count
        FROM public.mlm_commissions mc
        GROUP BY mc.status
      ) x
    ), '[]'::jsonb),
    'withdrawals', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'status', x.status,
        'amount', x.amount,
        'count', x.row_count
      ) ORDER BY x.status)
      FROM (
        SELECT COALESCE(w.status, 'unknown') AS status,
               COALESCE(sum(w.amount), 0)::numeric AS amount,
               count(*)::int AS row_count
        FROM public.withdrawal_requests w
        GROUP BY w.status
      ) x
    ), '[]'::jsonb),
    'generated_at', now()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_bhrealtor_admin_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_bhrealtor_admin_analytics() TO authenticated;

COMMENT ON FUNCTION public.get_bhrealtor_admin_analytics() IS
'Centralized BHRealtors admin analytics. Financial data is visible only to super_admin, admin, admin_dir and admin_acct.';
