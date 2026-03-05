
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  subtitle text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Anyone can read active slides
CREATE POLICY "Anyone can view active hero slides"
  ON public.hero_slides FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage hero slides"
  ON public.hero_slides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed with existing hero images
INSERT INTO public.hero_slides (image_url, title, subtitle, display_order) VALUES
  ('/lovable-uploads/ikoyi link bridge.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 0),
  ('/lovable-uploads/Homeheroimage2222.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 1),
  ('/lovable-uploads/00f20cea-44fd-4566-bf5f-18091450610e.jpg', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 2),
  ('/lovable-uploads/Homeslider2.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 3),
  ('/lovable-uploads/Homeslider.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 4),
  ('/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 5),
  ('/lovable-uploads/Homeslider3.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 6),
  ('/lovable-uploads/PropertyHero.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 7),
  ('/lovable-uploads/Homeslider4.png', 'PWAN Bridgefort. ...Rebuilding the Future!', 'At PWAN Bridgefort, we''re not just selling properties—we''re building legacies.', 8);
