CREATE TABLE IF NOT EXISTS public.admin_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  role_name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_departments_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT admin_departments_role_format CHECK (role_name ~ '^admin_[a-z0-9_]+$'),
  CONSTRAINT admin_departments_not_global_role CHECK (role_name NOT IN ('admin_dir','super_admin'))
);

CREATE INDEX IF NOT EXISTS idx_admin_departments_active ON public.admin_departments(is_active);

INSERT INTO public.admin_departments (name, slug, role_name, description)
VALUES
 ('Administration','administration','admin_adm','Administration department'),
 ('Accounts','accounts','admin_acct','Accounts and finance'),
 ('Sales','sales','admin_sales','Sales and property sales'),
 ('Customer Service','customer-service','admin_cs','Customer service and client support'),
 ('Legal','legal','admin_legal','Legal department'),
 ('IT','it','admin_it','Information technology and systems'),
 ('Travels','travels','admin_travels','Travel operations'),
 ('Agro','agro','admin_agro','Agricultural business operations'),
 ('Human Resources','hr','admin_hr','Human resources')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.can_manage_departments(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.admin_roles ar
        WHERE ar.user_id = _user_id
          AND ar.role_name = 'admin_it'
          AND (ar.expires_at IS NULL OR ar.expires_at > now())
      );
$function$;

REVOKE ALL ON FUNCTION public.can_manage_departments(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_departments(uuid) TO authenticated, service_role;

ALTER TABLE public.admin_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_departments_global_manage ON public.admin_departments;
CREATE POLICY admin_departments_global_manage ON public.admin_departments
FOR ALL TO authenticated
USING (public.can_manage_departments(auth.uid()))
WITH CHECK (public.can_manage_departments(auth.uid()));

DROP POLICY IF EXISTS admin_departments_authenticated_read ON public.admin_departments;
CREATE POLICY admin_departments_authenticated_read ON public.admin_departments
FOR SELECT TO authenticated
USING (is_active = true OR public.can_manage_departments(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_admin_departments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_admin_departments_updated_at ON public.admin_departments;
CREATE TRIGGER trg_admin_departments_updated_at
BEFORE UPDATE ON public.admin_departments
FOR EACH ROW EXECUTE FUNCTION public.touch_admin_departments_updated_at();

REVOKE ALL ON TABLE public.admin_departments FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_departments TO authenticated, service_role;
