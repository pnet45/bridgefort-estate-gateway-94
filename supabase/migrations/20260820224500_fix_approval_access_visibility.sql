-- Fix approval visibility and backend access.
-- Root cause: the Approval Centre tab is gated by admin:view_approvals,
-- while the previous finance migration only changed can_approve_financial_requests.
-- Listing/finance data also needs SELECT/UPDATE RLS access for approvers.

-- Ensure the approval permissions exist.
INSERT INTO public.permissions (key, label, category, description)
VALUES
  ('admin:view_approvals', 'View approvals', 'admin', 'Access the approval centre'),
  ('admin:approve_payments', 'Approve payments', 'admin', 'Approve or reject financial payment requests'),
  ('admin:approve_listings', 'Approve listings', 'admin', 'Approve or reject user property listings')
ON CONFLICT (key) DO NOTHING;

-- Explicit role grants. These are intentionally role-based so a user's access
-- survives session refresh and does not depend on manually assigned permissions.
INSERT INTO public.role_permissions (role_name, permission_key)
SELECT v.role_name, v.permission_key
FROM (VALUES
  ('super_admin','admin:view_approvals'),
  ('super_admin','admin:approve_payments'),
  ('super_admin','admin:approve_listings'),
  ('admin_dir','admin:view_approvals'),
  ('admin_dir','admin:approve_payments'),
  ('admin_dir','admin:approve_listings'),
  ('admin_acct','admin:view_approvals'),
  ('admin_acct','admin:approve_payments'),
  ('admin_it','admin:view_approvals'),
  ('admin_it','admin:approve_listings')
) AS v(role_name, permission_key)
WHERE EXISTS (SELECT 1 FROM public.roles r WHERE r.name = v.role_name)
  AND EXISTS (SELECT 1 FROM public.permissions p WHERE p.key = v.permission_key)
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_name = v.role_name AND rp.permission_key = v.permission_key
  );

-- Listing approval queue must be readable by the same privileged approvers.
DROP POLICY IF EXISTS "Approval admins can view pending listings" ON public.listings;
CREATE POLICY "Approval admins can view pending listings"
ON public.listings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin_dir')
  OR public.has_role(auth.uid(), 'admin_it')
  OR public.user_has_permission(auth.uid(), 'admin:approve_listings')
  OR public.user_has_permission(auth.uid(), 'admin:all')
);

-- Payment approval queue must be readable and writable by the three financial
-- approver roles. The policy deliberately does not grant general payment CRUD.
DROP POLICY IF EXISTS "Payment approvers can view requests" ON public.payment_requests;
CREATE POLICY "Payment approvers can view requests"
ON public.payment_requests
FOR SELECT
TO authenticated
USING (public.can_approve_financial_requests(auth.uid()));

DROP POLICY IF EXISTS "Payment approvers can process requests" ON public.payment_requests;
CREATE POLICY "Payment approvers can process requests"
ON public.payment_requests
FOR UPDATE
TO authenticated
USING (public.can_approve_financial_requests(auth.uid()))
WITH CHECK (public.can_approve_financial_requests(auth.uid()));

-- The approval audit trail must accept the decision from the same approver set.
DROP POLICY IF EXISTS "Payment approvers can write audit entries" ON public.payment_request_audit_log;
CREATE POLICY "Payment approvers can write audit entries"
ON public.payment_request_audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.can_approve_financial_requests(auth.uid()));

-- Keep the backend function authoritative for financial decisions.
REVOKE ALL ON FUNCTION public.can_approve_financial_requests(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_approve_financial_requests(uuid) TO authenticated;
