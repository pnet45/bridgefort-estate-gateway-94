-- Allow admins to upload/update/delete estate assets in the 'public' bucket
DROP POLICY IF EXISTS "Admins manage estate assets in public bucket" ON storage.objects;
CREATE POLICY "Admins manage estate assets in public bucket"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'public'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'public'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow anyone to read files from the 'public' bucket (needed for image display)
DROP POLICY IF EXISTS "Public read for public bucket" ON storage.objects;
CREATE POLICY "Public read for public bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'public');
