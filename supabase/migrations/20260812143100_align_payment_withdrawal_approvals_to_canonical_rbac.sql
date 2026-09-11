CREATE OR REPLACE FUNCTION public.can_approve_financial_requests(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:approve_payments')
      OR EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = _user_id AND ar.role_name = 'admin_acct' AND (ar.expires_at IS NULL OR ar.expires_at > now()));
$function$;
REVOKE EXECUTE ON FUNCTION public.can_approve_financial_requests(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_approve_financial_requests(uuid) TO authenticated, service_role;
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;
CREATE POLICY "Financial admins can view payment requests" ON public.payment_requests FOR SELECT TO authenticated USING (public.can_approve_financial_requests(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Financial admins can update payment requests" ON public.payment_requests FOR UPDATE TO authenticated USING (public.can_approve_financial_requests(auth.uid()) OR user_id = auth.uid()) WITH CHECK (public.can_approve_financial_requests(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Financial admins can view withdrawal requests" ON public.withdrawal_requests FOR SELECT TO authenticated USING (public.can_approve_financial_requests(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Financial admins can update withdrawal requests" ON public.withdrawal_requests FOR UPDATE TO authenticated USING (public.can_approve_financial_requests(auth.uid()) OR user_id = auth.uid()) WITH CHECK (public.can_approve_financial_requests(auth.uid()) OR user_id = auth.uid());
