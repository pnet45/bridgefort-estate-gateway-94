-- Restore the owner email field used by the New Listing form.
-- The column is intentionally not exposed to anonymous/public readers.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS owner_email text;

REVOKE SELECT (owner_email) ON public.listings FROM anon;
REVOKE SELECT (owner_email) ON public.listings FROM PUBLIC;

COMMENT ON COLUMN public.listings.owner_email IS
  'Private contact email supplied by the listing owner; never exposed to anonymous/public readers.';
