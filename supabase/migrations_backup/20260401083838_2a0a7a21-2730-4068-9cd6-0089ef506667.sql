-- Property reviews and ratings
CREATE TABLE public.property_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  property_type text NOT NULL DEFAULT 'estate',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  parent_id uuid REFERENCES public.property_reviews(id) ON DELETE CASCADE,
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.review_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.property_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

CREATE TABLE public.property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  property_type text NOT NULL DEFAULT 'estate',
  viewer_id uuid REFERENCES auth.users(id),
  viewed_at timestamptz DEFAULT now(),
  ip_hash text
);

ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.property_reviews FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.property_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.property_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.property_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reactions" ON public.review_reactions FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can react" ON public.review_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON public.review_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.review_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON public.property_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view property views" ON public.property_views FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_property_reviews_property ON public.property_reviews(property_id, property_type);
CREATE INDEX idx_property_reviews_parent ON public.property_reviews(parent_id);
CREATE INDEX idx_review_reactions_review ON public.review_reactions(review_id);
CREATE INDEX idx_property_views_property ON public.property_views(property_id, property_type);