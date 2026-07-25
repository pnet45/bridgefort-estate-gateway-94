-- The Admin Console's "Users" tab (UserManagementTab.tsx) already queries
-- public.profiles, public.users, and public.user_roles to build the
-- registered-users list. profiles and user_roles already have an
-- "admin can view all" policy, but public.users never got one — so admins
-- could see everything except each user's email (users.email is what
-- UserManagementTab joins in to display it), which made the tab look empty
-- or broken. This closes that gap.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Preserve each user's ability to see their own row (in case no such policy
-- exists yet); harmless no-op if it's already covered elsewhere.
DROP POLICY IF EXISTS "Users can view their own user row" ON public.users;
CREATE POLICY "Users can view their own user row"
ON public.users
FOR SELECT
USING (auth.uid() = id);
