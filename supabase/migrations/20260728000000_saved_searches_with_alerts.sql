-- Feature: saved searches with alerts.
--
-- Users save a set of search criteria; whenever a new estate listing is
-- inserted that matches a saved search, that user gets a notification (via
-- the existing `notifications` table / NotificationBell — see
-- src/lib/notifications/notify.ts). This runs as a plain AFTER INSERT
-- trigger on public.estate, so it needs no scheduled job or edge function —
-- matching happens the moment a listing is created.

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  location text,
  property_category text,
  type text,
  min_price numeric,
  max_price numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own saved searches" ON public.saved_searches;
CREATE POLICY "Users manage their own saved searches"
ON public.saved_searches
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches (user_id);

-- Match + notify. SECURITY DEFINER because it needs to insert into
-- notifications on behalf of the saved-search owner (not the person who
-- happened to trigger the estate insert).
CREATE OR REPLACE FUNCTION public.notify_saved_search_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  search RECORD;
  match_price numeric := COALESCE(NEW.promo_price, NEW.actual_price, NEW.prelaunch_price);
BEGIN
  FOR search IN
    SELECT * FROM public.saved_searches s
    WHERE (s.location IS NULL OR s.location = '' OR NEW.location ILIKE '%' || s.location || '%')
      AND (s.property_category IS NULL OR NEW.property_category = s.property_category)
      AND (s.type IS NULL OR NEW.type = s.type)
      AND (s.min_price IS NULL OR match_price IS NULL OR match_price >= s.min_price)
      AND (s.max_price IS NULL OR match_price IS NULL OR match_price <= s.max_price)
  LOOP
    INSERT INTO public.notifications (user_id, audience, type, title, message, link)
    VALUES (
      search.user_id,
      'user',
      'saved_search_match',
      'New listing matches "' || search.label || '"',
      COALESCE(NEW.name, NEW.title, 'A new listing') || COALESCE(' in ' || NEW.location, ''),
      '/properties'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_saved_search_matches ON public.estate;
CREATE TRIGGER trg_notify_saved_search_matches
AFTER INSERT ON public.estate
FOR EACH ROW
EXECUTE FUNCTION public.notify_saved_search_matches();
