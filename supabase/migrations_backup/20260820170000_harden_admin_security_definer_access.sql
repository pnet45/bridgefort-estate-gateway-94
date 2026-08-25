-- Phase 1 security hardening.
-- Keep SECURITY DEFINER functions where they are required to read protected
-- RBAC data, but prevent signed-in callers from inspecting another user's
-- authorization state unless they are a global administrator/service role.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL
      AND auth.uid() <> _user_id
      AND NOT public.is_global_admin(auth.uid())
    THEN false
    ELSE
      EXISTS (
        SELECT 1
        FROM public.admin_roles ar
        WHERE ar.user_id = _user_id
          AND (ar.expires_at IS NULL OR ar.expires_at > now())
          AND (
            ar.role_name = _role
            OR (_role = 'admin' AND ar.role_name IN (
              'super_admin','admin','admin_dir','admin_adm','admin_acct',
              'admin_sales','admin_cs','admin_legal','admin_it',
              'manager','team_leader','associate','staff'
            ))
          )
      )
      OR EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = _user_id
          AND (
            ur.role = _role
            OR (_role = 'admin' AND ur.role IN (
              'super_admin','admin','admin_dir','admin_adm','admin_acct',
              'admin_sales','admin_cs','admin_legal','admin_it',
              'manager','team_leader','associate','staff'
            ))
          )
      )
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_global_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL
      AND auth.uid() <> _user_id
    THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.admin_roles ar
      WHERE ar.user_id = _user_id
        AND ar.role_name IN ('admin_dir','super_admin')
        AND (ar.expires_at IS NULL OR ar.expires_at > now())
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL
      AND auth.uid() <> _user_id
      AND NOT public.is_global_admin(auth.uid())
    THEN false
    ELSE public.is_global_admin(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.admin_roles ar
        WHERE ar.user_id = _user_id
          AND (ar.expires_at IS NULL OR ar.expires_at > now())
      )
  END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL
      AND auth.uid() <> _user_id
      AND NOT public.is_global_admin(auth.uid())
    THEN false
    ELSE public.is_global_admin(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.admin_permissions ap
        WHERE ap.user_id = _user_id
          AND ap.permission_key = _permission_key
          AND (ap.expires_at IS NULL OR ap.expires_at > now())
      )
      OR EXISTS (
        SELECT 1
        FROM public.admin_roles ar
        JOIN public.role_permissions rp ON rp.role = ar.role_name AND rp.is_enabled IS NOT FALSE
        WHERE ar.user_id = _user_id
          AND (ar.expires_at IS NULL OR ar.expires_at > now())
          AND rp.permission_key = _permission_key
      )
  END;
$$;

CREATE OR REPLACE FUNCTION public.admin_has_permission(_permission text, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_global_admin(_user_id) OR public.user_has_permission(_user_id, _permission);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_admin_module(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:all')
      OR public.user_has_permission(_user_id, 'admin:manage_permissions');
$$;

CREATE OR REPLACE FUNCTION public.can_manage_departments(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:manage_departments');
$$;

CREATE OR REPLACE FUNCTION public.can_manage_mailboxes(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:manage_mailboxes');
$$;

CREATE OR REPLACE FUNCTION public.can_approve_financial_requests(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:approve_payments')
      OR EXISTS (
        SELECT 1 FROM public.admin_roles ar
        WHERE ar.user_id = _user_id
          AND ar.role_name = 'admin_acct'
          AND (ar.expires_at IS NULL OR ar.expires_at > now())
      );
$$;

-- These RPCs are used by authenticated application flows, but must never be
-- callable anonymously. Trigger-invoked functions do not require EXECUTE
-- privileges from anon/authenticated roles.
REVOKE EXECUTE ON FUNCTION public.admin_has_permission(text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_approve_financial_requests(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_admin_module(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_departments(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_mailboxes(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_global_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.user_has_permission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_downline_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_withdrawal_funnel_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_business_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_role_after_payment_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_role_after_profile_change() FROM anon;

-- Internal timestamp trigger function should have a fixed search_path too.
ALTER FUNCTION public.touch_admin_departments_updated_at()
  SET search_path = public;
