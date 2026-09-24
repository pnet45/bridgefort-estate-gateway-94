CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user_id uuid, _role text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  target_global boolean;
BEGIN
  IF caller IS NULL OR NOT (public.is_global_admin(caller) OR public.user_has_permission(caller, 'admin:manage_users') OR public.user_has_permission(caller, 'admin:all')) THEN
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

  IF _role NOT IN ('super_admin','admin','manager','team_leader','associate') THEN
    RAISE EXCEPTION 'This role is an administrator/deparment role and must be managed through the Department tab';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = _target_user_id
    AND ur.role <> _role;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,text) TO authenticated, service_role;
