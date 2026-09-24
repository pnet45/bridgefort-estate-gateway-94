-- Drop the anon-facing broad SELECT policy that enabled listing
DROP POLICY IF EXISTS "Public read for public bucket" ON storage.objects;
