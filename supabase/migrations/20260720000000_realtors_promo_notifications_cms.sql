-- ═════════════════════════════════════════════════════════════════════
-- CONSOLIDATED CATCH-UP + NEW FEATURES MIGRATION
--
-- Every ALTER/CREATE below is written with IF NOT EXISTS / guards, so it
-- is safe to run even if some pieces were already applied — this exists
-- specifically to fix the "Could not find X column ... in the schema
-- cache" errors, which happen when either (a) a migration was never
-- actually deployed, or (b) it was deployed but PostgREST's schema cache
-- hasn't refreshed since. Running this once resolves both.
-- ═════════════════════════════════════════════════════════════════════

-- ── Re-affirm recent columns in case earlier migrations weren't deployed ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_package text DEFAULT 'associate';

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_plan_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_plan_type_check
  CHECK (plan_type IN ('outright', '1-3', '4-6', '7-12', 'daily', 'weekly', 'monthly'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS promo_estate_slug TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS promo_installment_amount NUMERIC;

ALTER TABLE public.admin_emails ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- ── BHRealtors registration: 1-year term tracking ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_date TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS renewal_reminder_sent_at TIMESTAMPTZ;

-- ── Birthday tracking (CRM) ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday_reminder_sent_year INT;

-- ── Account locking ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_locked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_locked_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_locked_at TIMESTAMPTZ;

-- ═════════════════════════════════════════════════════════════════════
-- Notifications — powers the renewal reminder, payment/withdrawal status
-- changes, birthday alerts to admins, and the user/admin notification bell.
-- ═════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null = broadcast to all admins
  audience TEXT NOT NULL DEFAULT 'user' CHECK (audience IN ('user', 'admin')),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (audience = 'user' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their own notifications read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications read"
  ON public.notifications FOR UPDATE
  USING (audience = 'user' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view admin notifications" ON public.notifications;
CREATE POLICY "Admins can view admin notifications"
  ON public.notifications FOR SELECT
  USING (audience = 'admin' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update admin notifications" ON public.notifications;
CREATE POLICY "Admins can update admin notifications"
  ON public.notifications FOR UPDATE
  USING (audience = 'admin' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_audience ON public.notifications(audience);

-- ═════════════════════════════════════════════════════════════════════
-- Payment requests — the admin-approval gate for real gateway payments
-- (starting a 5K Daily Promo plan, and future payment types).
-- ═════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT '5k_daily_promo',
  amount NUMERIC NOT NULL,
  reference TEXT,
  related_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
CREATE POLICY "Users can view their own payment requests"
  ON public.payment_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
CREATE POLICY "Users can create their own payment requests"
  ON public.payment_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
CREATE POLICY "Admins can view all payment requests"
  ON public.payment_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);

DROP TRIGGER IF EXISTS set_payment_requests_updated_at ON public.payment_requests;
CREATE TRIGGER set_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═════════════════════════════════════════════════════════════════════
-- CMS-managed auth page carousel slides (admin-editable via CMS Hub)
-- ═════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.auth_carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  link TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_carousel_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active carousel slides" ON public.auth_carousel_slides;
CREATE POLICY "Anyone can view active carousel slides"
  ON public.auth_carousel_slides FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage carousel slides" ON public.auth_carousel_slides;
CREATE POLICY "Admins can manage carousel slides"
  ON public.auth_carousel_slides FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_auth_carousel_slides_updated_at ON public.auth_carousel_slides;
CREATE TRIGGER set_auth_carousel_slides_updated_at
  BEFORE UPDATE ON public.auth_carousel_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with the current hardcoded slides, so the CMS starts populated.
INSERT INTO public.auth_carousel_slides (image_url, eyebrow, title, subtitle, sort_order)
SELECT * FROM (VALUES
  ('/lovable-uploads/PropertyHero.png', 'Estates', 'Own Your Dream Estate', 'Verified plots and homes across Nigeria, ready for allocation.', 1),
  ('/lovable-uploads/5k-daily-flyer.jpg', 'Promo', 'Become a Landlord with ₦5K Daily', 'Save daily, weekly or monthly toward any of 8 flagship estates.', 2),
  ('/lovable-uploads/travels-flyer.jpg', 'Travels', 'Travel & Work in Europe', '100% guaranteed visa assistance — salary €500 to €1500 monthly.', 3),
  ('/lovable-uploads/agrovest-hero-1.jpg', 'Agrovest', 'Grow Wealth Through Agriculture', 'Own a professionally managed farm plot from ₦800,000.', 4),
  ('/lovable-uploads/wealth-summit-2026-flyer.jpg', 'Wealth Summit', 'Bridgefort Wealth Summit', 'Insights, networking and opportunities for serious investors.', 5)
) AS seed(image_url, eyebrow, title, subtitle, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.auth_carousel_slides);

-- Force PostgREST to immediately pick up every change above, rather than
-- waiting for its next automatic cache refresh.
NOTIFY pgrst, 'reload schema';
