-- Listing moderation + financial approval hardening.
-- Admin Acct, Admin-Dir and Super Admin must be able to approve financial requests.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

CREATE OR REPLACE FUNCTION public.can_approve_financial_requests(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _user_id IS NOT NULL
    AND (
      public.has_role(_user_id, 'super_admin')
      OR public.has_role(_user_id, 'admin_dir')
      OR public.has_role(_user_id, 'admin_acct')
      OR public.has_role(_user_id, 'admin')
      OR public.has_role(_user_id, 'admin:all')
      OR public.user_has_permission(_user_id, 'admin:approve_payments')
    );
$$;

REVOKE ALL ON FUNCTION public.can_approve_financial_requests(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_approve_financial_requests(uuid) TO authenticated;

-- Only privileged administrators can change moderation state or publish a listing.
DROP POLICY IF EXISTS "Admins can moderate listings" ON public.listings;
CREATE POLICY "Admins can moderate listings"
ON public.listings
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin_dir')
  OR public.has_role(auth.uid(), 'admin_it')
  OR public.has_role(auth.uid(), 'admin')
  OR public.user_has_permission(auth.uid(), 'admin:approve_listings')
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin_dir')
  OR public.has_role(auth.uid(), 'admin_it')
  OR public.has_role(auth.uid(), 'admin')
  OR public.user_has_permission(auth.uid(), 'admin:approve_listings')
);
