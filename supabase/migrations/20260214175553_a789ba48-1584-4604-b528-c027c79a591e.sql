
-- Create admin_emails table for full email management with folders
CREATE TABLE public.admin_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id),
  from_email text NOT NULL,
  from_name text,
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  html text,
  folder text NOT NULL DEFAULT 'inbox',
  is_read boolean NOT NULL DEFAULT false,
  is_starred boolean NOT NULL DEFAULT false,
  parent_id uuid REFERENCES public.admin_emails(id),
  source text NOT NULL DEFAULT 'manual',
  external_ref text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all emails"
  ON public.admin_emails FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert emails"
  ON public.admin_emails FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update emails"
  ON public.admin_emails FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete emails"
  ON public.admin_emails FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for folder queries
CREATE INDEX idx_admin_emails_folder ON public.admin_emails(folder);
CREATE INDEX idx_admin_emails_created_at ON public.admin_emails(created_at DESC);

-- Create trigger to auto-copy contact_messages to admin_emails inbox
CREATE OR REPLACE FUNCTION public.copy_contact_to_admin_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_emails (from_email, from_name, to_email, subject, body, folder, source, external_ref)
  VALUES (NEW.email, NEW.name, 'admin@pwanbridgefort.ng', NEW.subject, NEW.message, 'inbox', 'contact_form', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contact_message_insert
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.copy_contact_to_admin_emails();
