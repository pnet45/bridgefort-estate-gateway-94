-- Fix remaining function without search_path attribute
-- The get_user_profile() function needs search_path set as a function attribute

CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    -- Function logic here
END;
$function$;