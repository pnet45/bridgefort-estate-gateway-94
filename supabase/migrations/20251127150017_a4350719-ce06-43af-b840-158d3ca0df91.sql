-- Fix Function Search Path Mutable warning
-- Add search_path to functions that don't have it set

-- 1. count_users function
CREATE OR REPLACE FUNCTION public.count_users()
RETURNS bigint
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
    user_count bigint;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    RETURN user_count;
END;
$function$;

-- 2. delete_user_profile function
CREATE OR REPLACE FUNCTION public.delete_user_profile(user_id bigint)
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    DELETE FROM public.profiles
    WHERE id = user_id;
END;
$function$;

-- 3. get_user_profile(user_id bigint) function
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id bigint)
RETURNS TABLE(id bigint, first_name text, last_name text, email text)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name, u.email
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.id = user_id;
END;
$function$;

-- 4. get_user_profile(p_user_id uuid) function
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id uuid)
RETURNS TABLE(profile jsonb)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $function$ 
SELECT * FROM private.get_user_profile(p_user_id); 
$function$;

-- 5. handle_new_user function (CRITICAL - SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  );
  
  -- Insert into users table
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  
  RETURN new;
END;
$function$;

-- 6. has_role(_user_id uuid, _role text) function (CRITICAL - SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- 7. list_all_users function
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE(id bigint, first_name text, last_name text, email text)
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.first_name, p.last_name, u.email
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id;
END;
$function$;

-- 8. update_training_events_updated_at function
CREATE OR REPLACE FUNCTION public.update_training_events_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 9. update_user_profile function
CREATE OR REPLACE FUNCTION public.update_user_profile(user_id bigint, first_name text, last_name text)
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    UPDATE public.profiles
    SET first_name = first_name, last_name = last_name
    WHERE id = user_id;
END;
$function$;