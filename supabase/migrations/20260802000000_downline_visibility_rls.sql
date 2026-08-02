-- Ensure the downline helper function exists (descendants only)
CREATE OR REPLACE FUNCTION public.get_downline_ids(root_id uuid)
RETURNS TABLE(id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE downline AS (
    SELECT p.id FROM public.profiles p WHERE p.referred_by_id = root_id
    UNION ALL
    SELECT p.id FROM public.profiles p
    JOIN downline d ON p.referred_by_id = d.id
  )
  SELECT id FROM downline;
$$;

REVOKE ALL ON FUNCTION public.get_downline_ids(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_downline_ids(uuid) TO authenticated;

-- Tighten RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Replace SELECT policy for downline visibility
DROP POLICY IF EXISTS "Users can view their own downline profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile and downline" ON public.profiles;

CREATE POLICY "Users can view own profile and downline"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR id IN (SELECT get_downline_ids(auth.uid()))
);

-- Prevent editing downline: only allow UPDATE on self
DROP POLICY IF EXISTS "Users can update only self profile" ON public.profiles;

CREATE POLICY "Users can update only self profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Block writes completely for INSERT/DELETE
DROP POLICY IF EXISTS "Profiles insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete self" ON public.profiles;

REVOKE INSERT, DELETE ON public.profiles FROM authenticated;

-- Keep UPDATE controlled by the policy above
REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
