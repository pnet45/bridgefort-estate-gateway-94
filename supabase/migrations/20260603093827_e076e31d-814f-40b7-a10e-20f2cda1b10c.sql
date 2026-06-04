
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'blog_post','service_section','training_event','past_training_event',
    'motivation_slide','announcement','page_section','training_article','services_article'
  )),
  page TEXT NOT NULL CHECK (page IN ('blog','services','training','home','about','generic')),
  slug TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  body TEXT,
  image_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  link_url TEXT,
  cta_label TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  event_date TIMESTAMPTZ,
  event_location TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published content"
  ON public.content_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all content"
  ON public.content_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert content"
  ON public.content_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content"
  ON public.content_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content"
  ON public.content_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_content_items_type_page ON public.content_items(content_type, page, display_order);
CREATE INDEX idx_content_items_published ON public.content_items(is_published, page);
CREATE INDEX idx_content_items_slug ON public.content_items(slug);

CREATE TRIGGER trg_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
