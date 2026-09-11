-- Keep business roles (user/client/pbo) in users.role, while admin RBAC remains in user_roles/admin_roles.
-- Add any department-created administrator roles to the canonical roles catalog so
-- they can be selected/displayed without granting permissions automatically.
INSERT INTO public.roles (name, display_name, description)
SELECT d.role_name,
       CASE
         WHEN lower(d.name) = 'human resources' THEN 'Admin-HR'
         WHEN lower(d.name) = 'property inspection' THEN 'Admin-Inspection'
         WHEN lower(d.name) = 'travels' THEN 'Admin-Travels'
         WHEN lower(d.name) = 'agro' THEN 'Admin-Agro'
         ELSE 'Admin-' || d.name
       END,
       COALESCE(d.description, d.name || ' department administrator')
FROM public.admin_departments d
WHERE d.role_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.roles r WHERE r.name = d.role_name);

-- Allow the User Management role control to manage business roles without
-- putting business roles into the administrator RBAC table. Admin department
-- roles remain managed through the Department workflow.
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user_id uuid, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  target_global boolean;
BEGIN
  IF caller IS NULL OR NOT (
    public.is_global_admin(caller)
    OR public.user_has_permission(caller, 'admin:manage_users')
    OR public.user_has_permission(caller, 'admin:all')
  ) THEN
    RAISE EXCEPTION 'Not authorized to manage user roles';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles ar
    WHERE ar.user_id = _target_user_id
      AND ar.role_name IN ('admin_dir','super_admin')
      AND (ar.expires_at IS NULL OR ar.expires_at > now())
  ) INTO target_global;

  IF target_global THEN
    RAISE EXCEPTION 'Admin-Dir and Super_Admin roles are protected';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.roles r WHERE r.name = _role) THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  IF _role IN ('admin_dir','super_admin') THEN
    RAISE EXCEPTION 'Global administrator roles cannot be assigned from User Management';
  END IF;

  IF _role IN ('admin_acct','admin_adm','admin_sales','admin_cs','admin_legal','admin_it')
     OR _role LIKE 'admin_%' THEN
    RAISE EXCEPTION 'This role is an administrator/department role and must be managed through the Department tab';
  END IF;

  IF _role IN ('user','client','pbo') THEN
    -- users.role is the authoritative business/account role. The trigger on
    -- users.role allows this controlled SECURITY DEFINER path via the same
    -- bridgefort.sync_role setting used by the automatic role synchronizer.
    PERFORM set_config('bridgefort.sync_role','1',true);
    UPDATE public.users
       SET role = _role,
           updated_at = now()
     WHERE id = _target_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Target user account not found';
    END IF;
    RETURN;
  END IF;

  IF _role NOT IN ('admin','manager','team_leader','associate','staff') THEN
    RAISE EXCEPTION 'Unsupported user role';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _target_user_id
    AND ur.role <> _role;
END;
$function$;
