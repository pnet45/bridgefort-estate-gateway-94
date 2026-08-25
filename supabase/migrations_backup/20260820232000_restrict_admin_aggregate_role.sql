-- Security correction: the aggregate `admin` role must not include ordinary
-- staff/associate/team-leader roles. The previous compatibility function did
-- that, which could make non-admin users pass policies written as
-- has_role(auth.uid(), 'admin'), including withdrawal management.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.user_id = _user_id
      AND (ar.expires_at IS NULL OR ar.expires_at > now())
      AND (
        ar.role_name = _role
        OR (
          _role = 'admin'
          AND ar.role_name IN (
            'super_admin',
            'admin',
            'admin_dir',
            'admin_adm',
            'admin_acct',
            'admin_sales',
            'admin_cs',
            'admin_legal',
            'admin_it'
          )
        )
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        ur.role = _role
        OR (
          _role = 'admin'
          AND ur.role IN (
            'super_admin',
            'admin',
            'admin_dir',
            'admin_adm',
            'admin_acct',
            'admin_sales',
            'admin_cs',
            'admin_legal',
            'admin_it'
          )
        )
      )
  );
$$;

COMMENT ON FUNCTION public.has_role(uuid, text) IS
  'Secure role compatibility helper. Aggregate admin access is limited to actual administrative roles; ordinary staff roles are not admins.';
