-- Add MLM referral relationship fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_id uuid,
  ADD COLUMN IF NOT EXISTS referred_by_code text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_referred_by_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_referred_by_id_fkey FOREIGN KEY (referred_by_id) REFERENCES public.profiles(id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_id ON public.profiles (referred_by_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_code ON public.profiles (referred_by_code) WHERE referred_by_code IS NOT NULL;
