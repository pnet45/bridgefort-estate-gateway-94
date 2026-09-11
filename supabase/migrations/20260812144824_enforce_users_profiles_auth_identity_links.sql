DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_auth_users_fk') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_auth_users_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='users_auth_users_fk') THEN
    ALTER TABLE public.users ADD CONSTRAINT users_auth_users_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END
$block$;
