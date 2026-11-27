-- Bound BHRealtor network-tree results before aggregation.
-- The previous LIMIT applied to the single aggregate row, so it did not
-- limit the number of profiles processed or serialized.
CREATE OR REPLACE FUNCTION public.get_my_bhrealtor_network_tree(_limit integer DEFAULT 200)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN '[]'::jsonb
    ELSE COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', member.id,
          'name', trim(concat_ws(' ', member.first_name, member.last_name)),
          'package', member.current_package,
          'rank', member.current_rank,
          'is_active', member.is_active,
          'joined_at', member.created_at
        )
        ORDER BY member.created_at DESC
      )
      FROM (
        SELECT p.id, p.first_name, p.last_name, p.current_package,
               p.current_rank, p.is_active, p.created_at
        FROM public.profiles p
        WHERE p.referred_by_id = auth.uid()
        ORDER BY p.created_at DESC
        LIMIT LEAST(GREATEST(COALESCE(_limit, 200), 1), 500)
      ) AS member
    ), '[]'::jsonb)
  END;
$function$;
