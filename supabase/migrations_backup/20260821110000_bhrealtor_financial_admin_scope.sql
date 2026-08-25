-- BHRealtors financial controls must not inherit the overly broad legacy
-- aggregate admin compatibility role. Only the central financial/admin roles
-- may view or change network financial data.

CREATE OR REPLACE FUNCTION public.can_manage_bhrealtor_financials(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.user_id = p_user_id
      AND (ar.expires_at IS NULL OR ar.expires_at > now())
      AND ar.role_name IN ('super_admin', 'admin', 'admin_dir', 'admin_acct')
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
      AND ur.role IN ('super_admin', 'admin', 'admin_dir', 'admin_acct')
  );
$$;

REVOKE ALL ON FUNCTION public.can_manage_bhrealtor_financials(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_bhrealtor_financials(uuid) TO authenticated;

-- Replace the generic admin policy on the commission ledger with the explicit
-- financial-admin scope. Realtors retain access only to their own records.
DROP POLICY IF EXISTS "mlm_commissions_select_own" ON public.mlm_commissions;
CREATE POLICY "mlm_commissions_select_own" ON public.mlm_commissions
FOR SELECT TO authenticated
USING (
  beneficiary_id = auth.uid()
  OR public.can_manage_bhrealtor_financials(auth.uid())
);

-- Package pricing is a financial control. Restrict updates to the same scope.
DROP POLICY IF EXISTS "Admins can update BHRealtor package prices" ON public.mlm_packages;
CREATE POLICY "Admins can update BHRealtor package prices" ON public.mlm_packages
FOR UPDATE TO authenticated
USING (public.can_manage_bhrealtor_financials(auth.uid()))
WITH CHECK (public.can_manage_bhrealtor_financials(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_bhrealtor_package_price(
  p_package_code text,
  p_price numeric
)
RETURNS public.mlm_packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_package public.mlm_packages;
BEGIN
  IF NOT public.can_manage_bhrealtor_financials(auth.uid()) THEN
    RAISE EXCEPTION 'Only authorized BHRealtors financial administrators can change package prices';
  END IF;

  IF p_package_code NOT IN ('associate', 'gold', 'classic_gold') THEN
    RAISE EXCEPTION 'Invalid BHRealtor package';
  END IF;

  IF p_price <= 0 OR p_price > 1000000000 THEN
    RAISE EXCEPTION 'Package price must be greater than zero and within the allowed range';
  END IF;

  UPDATE public.mlm_packages
  SET price = ROUND(p_price, 2)
  WHERE package_code = p_package_code
  RETURNING * INTO v_package;

  IF v_package IS NULL THEN
    RAISE EXCEPTION 'BHRealtor package not found';
  END IF;

  RETURN v_package;
END;
$$;

REVOKE ALL ON FUNCTION public.update_bhrealtor_package_price(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_bhrealtor_package_price(text, numeric) TO authenticated;

-- Document the intended scope for future maintenance.
COMMENT ON FUNCTION public.can_manage_bhrealtor_financials(uuid) IS
'Allows BHRealtors financial/admin operations only for super_admin, admin, admin_dir and admin_acct roles.';
