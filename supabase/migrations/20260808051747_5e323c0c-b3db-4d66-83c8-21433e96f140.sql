INSERT INTO public.profiles (id)
SELECT u.id FROM public.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_profile_id_fkey;

ALTER TABLE public.users
  ADD CONSTRAINT users_profile_id_fkey
  FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;