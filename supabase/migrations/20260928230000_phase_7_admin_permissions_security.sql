-- Phase 7: Admin Permissions & Security
-- Harden high-risk RLS boundaries so administrative actions use the
-- canonical permission model rather than broad legacy role checks.

BEGIN;

DROP POLICY IF EXISTS "Only admins can manage role permissions" ON public.role_permissions;
CREATE POLICY role_permissions_manage_canonical
ON public.role_permissions
FOR ALL
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'admin:manage_permissions')
)
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'admin:manage_permissions')
);

DROP POLICY IF EXISTS "Admins can delete pending requests" ON public.pending_admin_requests;
DROP POLICY IF EXISTS "Admins can update pending requests" ON public.pending_admin_requests;
DROP POLICY IF EXISTS "Admins can view pending requests" ON public.pending_admin_requests;

CREATE POLICY pending_admin_requests_approver_select
ON public.pending_admin_requests
FOR SELECT
TO authenticated
USING (
  public.can_approve_admin_request((SELECT auth.uid()))
  OR public.is_global_admin((SELECT auth.uid()))
);

CREATE POLICY pending_admin_requests_approver_update
ON public.pending_admin_requests
FOR UPDATE
TO authenticated
USING (
  public.can_approve_admin_request((SELECT auth.uid()))
  OR public.is_global_admin((SELECT auth.uid()))
)
WITH CHECK (
  public.can_approve_admin_request((SELECT auth.uid()))
  OR public.is_global_admin((SELECT auth.uid()))
);

CREATE POLICY pending_admin_requests_global_delete
ON public.pending_admin_requests
FOR DELETE
TO authenticated
USING (
  public.is_global_admin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Admins can delete travel bookings" ON public.travel_bookings;
DROP POLICY IF EXISTS "Admins can update travel bookings" ON public.travel_bookings;
DROP POLICY IF EXISTS "Admins can view travel bookings" ON public.travel_bookings;

CREATE POLICY travel_bookings_staff_select
ON public.travel_bookings
FOR SELECT
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'booking.view')
  OR public.is_global_admin((SELECT auth.uid()))
);

CREATE POLICY travel_bookings_staff_update
ON public.travel_bookings
FOR UPDATE
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'booking.manage')
  OR public.is_global_admin((SELECT auth.uid()))
)
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'booking.manage')
  OR public.is_global_admin((SELECT auth.uid()))
);

CREATE POLICY travel_bookings_global_delete
ON public.travel_bookings
FOR DELETE
TO authenticated
USING (
  public.is_global_admin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS payments_admin_manage ON public.payments;
CREATE POLICY payments_approval_manage
ON public.payments
FOR ALL
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'payment.approve')
  OR public.is_global_admin((SELECT auth.uid()))
)
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'payment.approve')
  OR public.is_global_admin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Only admins can delete estate doc pricing" ON public.estate_doc_pricing;
DROP POLICY IF EXISTS "Only admins can insert estate doc pricing" ON public.estate_doc_pricing;
DROP POLICY IF EXISTS "Only admins can update estate doc pricing" ON public.estate_doc_pricing;

CREATE POLICY estate_doc_pricing_finance_manage
ON public.estate_doc_pricing
FOR ALL
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'payment.approve')
  OR public.is_global_admin((SELECT auth.uid()))
)
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'payment.approve')
  OR public.is_global_admin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Only admins can delete estate other payments" ON public.estate_other_payments;
DROP POLICY IF EXISTS "Only admins can insert estate other payments" ON public.estate_other_payments;
DROP POLICY IF EXISTS "Only admins can update estate other payments" ON public.estate_other_payments;

CREATE POLICY estate_other_payments_finance_manage
ON public.estate_other_payments
FOR ALL
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'payment.approve')
  OR public.is_global_admin((SELECT auth.uid()))
)
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'payment.approve')
  OR public.is_global_admin((SELECT auth.uid()))
);

COMMIT;
