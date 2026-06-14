
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE public.user_roles ADD CONSTRAINT valid_role
  CHECK (role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'manager'::text, 'team_leader'::text, 'associate'::text]));

INSERT INTO public.user_roles(user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'admin@pwanbridgefort.ng'
ON CONFLICT (user_id, role) DO NOTHING;
