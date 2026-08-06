-- Circular Gallery media collection (Gallery page, section 2)
-- Admins upload images/videos here; the Gallery page reads published items in order.

CREATE TABLE public.gallery_media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  poster_url TEXT, -- thumbnail shown in the 3D gallery + grid card; required for video, mirrors media_url for images
  caption TEXT,
  event_description TEXT, -- short description shown on the grid card
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_media_items TO authenticated;
GRANT ALL ON public.gallery_media_items TO service_role;

ALTER TABLE public.gallery_media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published gallery media"
  ON public.gallery_media_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all gallery media"
  ON public.gallery_media_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gallery media"
  ON public.gallery_media_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery media"
  ON public.gallery_media_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery media"
  ON public.gallery_media_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_gallery_media_items_published ON public.gallery_media_items(is_published, display_order);

CREATE TRIGGER trg_gallery_media_items_updated_at
  BEFORE UPDATE ON public.gallery_media_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
