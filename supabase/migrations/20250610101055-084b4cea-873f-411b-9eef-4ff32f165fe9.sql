
-- First, let's create storage buckets for pictures and media
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Create policies for the profile-pictures bucket
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for the media-files bucket
CREATE POLICY "Users can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-files');

CREATE POLICY "Users can update their own media files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Modify the profiles table to include all the new fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spouse_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state_of_origin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS local_government TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_residence TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employer_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employer_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_of_kin_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create a table for contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_submissions
CREATE POLICY "Users can view their own submissions"
ON public.contact_submissions FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create contact submissions"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

-- Create a table for newsletter subscriptions if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on newsletter_subscriptions
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_subscriptions
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view active subscriptions"
ON public.newsletter_subscriptions FOR SELECT
USING (is_active = true);
