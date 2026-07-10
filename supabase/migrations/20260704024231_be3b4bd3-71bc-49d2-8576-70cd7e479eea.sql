
DROP POLICY IF EXISTS "profile-pictures owner select" ON storage.objects;
DROP POLICY IF EXISTS "profile-pictures owner insert" ON storage.objects;
DROP POLICY IF EXISTS "profile-pictures owner update" ON storage.objects;
DROP POLICY IF EXISTS "profile-pictures owner delete" ON storage.objects;
CREATE POLICY "profile-pictures owner select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'profile-pictures' AND owner = auth.uid());
CREATE POLICY "profile-pictures owner insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND owner = auth.uid());
CREATE POLICY "profile-pictures owner update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profile-pictures' AND owner = auth.uid());
CREATE POLICY "profile-pictures owner delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profile-pictures' AND owner = auth.uid());

DROP POLICY IF EXISTS "Allow public to view uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "user_uploads owner select" ON storage.objects;
CREATE POLICY "user_uploads owner select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'user_uploads' AND owner = auth.uid());

DROP POLICY IF EXISTS "imagebucket public read" ON storage.objects;
DROP POLICY IF EXISTS "imagebucket auth insert" ON storage.objects;
DROP POLICY IF EXISTS "imagebucket owner update" ON storage.objects;
DROP POLICY IF EXISTS "imagebucket owner delete" ON storage.objects;
CREATE POLICY "imagebucket public read" ON storage.objects
FOR SELECT USING (bucket_id = 'imagebucket');
CREATE POLICY "imagebucket auth insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'imagebucket' AND owner = auth.uid());
CREATE POLICY "imagebucket owner update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'imagebucket' AND owner = auth.uid());
CREATE POLICY "imagebucket owner delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'imagebucket' AND owner = auth.uid());
