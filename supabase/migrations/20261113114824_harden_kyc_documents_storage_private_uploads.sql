-- Keep KYC identity documents private and enforce the same upload constraints
-- at the Storage layer as the profile upload component.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'kyc-documents') THEN
    RAISE EXCEPTION 'Required Storage bucket kyc-documents does not exist';
  END IF;
END;
$$;

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 4194304,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]::text[]
WHERE id = 'kyc-documents';

-- These policies were previously granted to PUBLIC, although auth.uid()
-- restricted access in practice. Scope them explicitly to signed-in users.
ALTER POLICY "Users can upload their KYC docs"
  ON storage.objects
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

ALTER POLICY "Users can view their own KYC docs"
  ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

ALTER POLICY "Users can update their own KYC docs"
  ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

ALTER POLICY "Users can delete their own KYC docs"
  ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );