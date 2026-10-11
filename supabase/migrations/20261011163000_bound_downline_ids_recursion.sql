-- Avoid traversing unrelated referral trees for non-owners.
-- Preserve access for a user to their own downline and for global admins to audit any tree.
CREATE OR REPLACE FUNCTION public.get_downline_ids(root_id uuid)
RETURNS TABLE(id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH RECURSIVE downline AS (
    SELECT p.id
    FROM public.profiles p
    WHERE p.referred_by_id = root_id
      AND (
        root_id = (SELECT auth.uid())
        OR public.is_global_admin((SELECT auth.uid()))
      )
    UNION ALL
    SELECT p.id
    FROM public.profiles p
    JOIN downline d ON p.referred_by_id = d.id
  )
  SELECT id FROM downline;
$function$;
