-- Phase 5: Testing & Hardening
-- Align canonical permission aliases with the database authorization boundary
-- and prevent customers/assignees from mutating service-journey records directly.

CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    CASE
      WHEN auth.uid() IS NOT NULL
       AND auth.uid() <> _user_id
       AND NOT public.is_global_admin(auth.uid())
      THEN false
      ELSE
        public.is_global_admin(_user_id)
        OR EXISTS (
          SELECT 1
          FROM public.admin_permissions ap
          WHERE ap.user_id = _user_id
            AND ap.permission_key = CASE _permission_key
              WHEN 'crm.view' THEN 'admin:view_crm'
              WHEN 'crm.create' THEN 'admin:view_crm'
              WHEN 'crm.edit' THEN 'admin:view_crm'
              WHEN 'crm.assign' THEN 'admin:view_crm'
              WHEN 'crm.export' THEN 'admin:view_crm'
              WHEN 'property.view' THEN 'admin:view_properties'
              WHEN 'property.create' THEN 'admin:view_properties'
              WHEN 'property.edit' THEN 'admin:view_properties'
              WHEN 'property.publish' THEN 'admin:view_properties'
              WHEN 'payment.view' THEN 'admin:view_approvals'
              WHEN 'payment.verify' THEN 'admin:view_approvals'
              WHEN 'payment.approve' THEN 'admin:approve_payments'
              WHEN 'withdrawal.approve' THEN 'admin:approve_withdrawals'
              WHEN 'listing.approve' THEN 'admin:approve_listings'
              WHEN 'booking.view' THEN 'admin:view_travels'
              WHEN 'booking.manage' THEN 'admin:view_travels'
              WHEN 'approvals.view' THEN 'admin:view_approvals'
              WHEN 'approvals.decide' THEN 'admin:view_approvals'
              WHEN 'users.view' THEN 'admin:view_users'
              WHEN 'users.manage' THEN 'admin:view_users'
              WHEN 'roles.view' THEN 'admin:manage_permissions'
              WHEN 'roles.manage' THEN 'admin:manage_permissions'
              WHEN 'reports.view' THEN 'admin:view_analytics'
              WHEN 'reports.export' THEN 'admin:view_analytics'
              ELSE _permission_key
            END
            AND (ap.expires_at IS NULL OR ap.expires_at > now())
        )
        OR EXISTS (
          SELECT 1
          FROM public.admin_roles ar
          JOIN public.role_permissions rp
            ON rp.role = ar.role_name
           AND rp.is_enabled IS NOT FALSE
          WHERE ar.user_id = _user_id
            AND (ar.expires_at IS NULL OR ar.expires_at > now())
            AND rp.permission_key = CASE _permission_key
              WHEN 'crm.view' THEN 'admin:view_crm'
              WHEN 'crm.create' THEN 'admin:view_crm'
              WHEN 'crm.edit' THEN 'admin:view_crm'
              WHEN 'crm.assign' THEN 'admin:view_crm'
              WHEN 'crm.export' THEN 'admin:view_crm'
              WHEN 'property.view' THEN 'admin:view_properties'
              WHEN 'property.create' THEN 'admin:view_properties'
              WHEN 'property.edit' THEN 'admin:view_properties'
              WHEN 'property.publish' THEN 'admin:view_properties'
              WHEN 'payment.view' THEN 'admin:view_approvals'
              WHEN 'payment.verify' THEN 'admin:view_approvals'
              WHEN 'payment.approve' THEN 'admin:approve_payments'
              WHEN 'withdrawal.approve' THEN 'admin:approve_withdrawals'
              WHEN 'listing.approve' THEN 'admin:approve_listings'
              WHEN 'booking.view' THEN 'admin:view_travels'
              WHEN 'booking.manage' THEN 'admin:view_travels'
              WHEN 'approvals.view' THEN 'admin:view_approvals'
              WHEN 'approvals.decide' THEN 'admin:view_approvals'
              WHEN 'users.view' THEN 'admin:view_users'
              WHEN 'users.manage' THEN 'admin:view_users'
              WHEN 'roles.view' THEN 'admin:manage_permissions'
              WHEN 'roles.manage' THEN 'admin:manage_permissions'
              WHEN 'reports.view' THEN 'admin:view_analytics'
              WHEN 'reports.export' THEN 'admin:view_analytics'
              ELSE _permission_key
            END
        )
    END;
$function$;

DROP POLICY IF EXISTS service_journeys_authenticated_read ON public.service_journeys;
DROP POLICY IF EXISTS service_journeys_staff_write ON public.service_journeys;

CREATE POLICY service_journeys_authenticated_read
ON public.service_journeys
FOR SELECT
TO authenticated
USING (
  customer_id = (SELECT auth.uid())
  OR assigned_to = (SELECT auth.uid())
  OR public.user_has_permission((SELECT auth.uid()), 'crm.view')
  OR public.user_has_permission((SELECT auth.uid()), 'admin:view_crm')
);

CREATE POLICY service_journeys_staff_insert
ON public.service_journeys
FOR INSERT
TO authenticated
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'crm.create')
  OR public.user_has_permission((SELECT auth.uid()), 'admin:all')
);

CREATE POLICY service_journeys_staff_update
ON public.service_journeys
FOR UPDATE
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'crm.edit')
  OR public.user_has_permission((SELECT auth.uid()), 'admin:all')
)
WITH CHECK (
  public.user_has_permission((SELECT auth.uid()), 'crm.edit')
  OR public.user_has_permission((SELECT auth.uid()), 'admin:all')
);

CREATE POLICY service_journeys_staff_delete
ON public.service_journeys
FOR DELETE
TO authenticated
USING (
  public.user_has_permission((SELECT auth.uid()), 'crm.edit')
  OR public.user_has_permission((SELECT auth.uid()), 'admin:all')
);
