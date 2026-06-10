-- service_role bypasses RLS already; drop redundant true policies to silence linter
DROP POLICY IF EXISTS "Service role manages roles - insert" ON public.user_roles;
DROP POLICY IF EXISTS "Service role manages roles - update" ON public.user_roles;
DROP POLICY IF EXISTS "Service role manages roles - delete" ON public.user_roles;