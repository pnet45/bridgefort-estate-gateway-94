
-- Create posts table for blog functionality
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  image_path TEXT,
  category TEXT NOT NULL DEFAULT 'Real Estate',
  published BOOLEAN NOT NULL DEFAULT false,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure proper access control
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to view published posts
CREATE POLICY "Anyone can view published posts" 
  ON public.posts 
  FOR SELECT 
  USING (published = true OR auth.uid() = author_id);

-- Create policy that allows staff/admin users to create posts
CREATE POLICY "Staff and admin can create posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = author_id AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'team_leader')
    )
  );

-- Create policy that allows authors to update their own posts
CREATE POLICY "Authors can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = author_id);

-- Create policy that allows authors to delete their own posts
CREATE POLICY "Authors can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- Create storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for blog images
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog');

CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own blog images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog' AND auth.uid()::text = (storage.foldername(name))[1]);
