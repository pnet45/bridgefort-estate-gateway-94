-- Store inbound email attachment metadata (filename, type, size, and the
-- path where the file lives in Supabase Storage) directly on admin_emails,
-- so the admin inbox can list/download attachments without depending on
-- Resend's short-lived (1 hour) signed download URLs after the fact.
ALTER TABLE public.admin_emails ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Storage bucket for inbound email attachments. Public so downloaded files
-- can be linked to directly; only the resend-inbound-webhook function
-- (service role) ever writes to it.
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-attachments', 'email-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view email attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-attachments');

CREATE POLICY "Admins can manage email attachments"
  ON storage.objects FOR ALL
  USING (bucket_id = 'email-attachments' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'email-attachments' AND public.has_role(auth.uid(), 'admin'));
