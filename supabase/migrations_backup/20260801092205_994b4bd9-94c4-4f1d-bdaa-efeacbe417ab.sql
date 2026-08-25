-- 1. MLM tables: enable RLS + owner/admin scoped policies
ALTER TABLE public.mlm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlm_membership_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlm_commissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.mlm_packages TO anon, authenticated;
GRANT SELECT ON public.mlm_membership_purchases TO authenticated;
GRANT SELECT ON public.mlm_commissions TO authenticated;
GRANT ALL ON public.mlm_packages TO service_role;
GRANT ALL ON public.mlm_membership_purchases TO service_role;
GRANT ALL ON public.mlm_commissions TO service_role;

DROP POLICY IF EXISTS "mlm_packages_read" ON public.mlm_packages;
CREATE POLICY "mlm_packages_read" ON public.mlm_packages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mlm_packages_admin_write" ON public.mlm_packages;
CREATE POLICY "mlm_packages_admin_write" ON public.mlm_packages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "mlm_purchases_select_own" ON public.mlm_membership_purchases;
CREATE POLICY "mlm_purchases_select_own" ON public.mlm_membership_purchases
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "mlm_commissions_select_own" ON public.mlm_commissions;
CREATE POLICY "mlm_commissions_select_own" ON public.mlm_commissions
  FOR SELECT TO authenticated
  USING (beneficiary_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 2. Protect financial columns on profiles from self-service edits
CREATE OR REPLACE FUNCTION public.protect_profile_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- service_role / server-side calls have no auth.uid(); admins are trusted too
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.wallet_balance := OLD.wallet_balance;
  NEW.total_commissions := OLD.total_commissions;
  NEW.current_package := OLD.current_package;
  NEW.current_rank := OLD.current_rank;
  NEW.total_personal_volume := OLD.total_personal_volume;
  NEW.is_active := OLD.is_active;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_financial_fields ON public.profiles;
CREATE TRIGGER protect_profile_financial_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_financial_fields();

-- 3. Posts: remove the role-check-bypassing insert policy
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;

-- 4. user_uploads bucket: enforce per-user folder ownership on insert
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
CREATE POLICY "user_uploads owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
