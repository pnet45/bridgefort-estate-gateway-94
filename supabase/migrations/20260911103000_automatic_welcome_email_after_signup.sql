-- Automatic Bridgefort Homes welcome email after a new auth profile is created.
-- The database trigger is asynchronous: an email-provider failure must never
-- block or roll back successful account creation.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.welcome_email_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  resend_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT welcome_email_deliveries_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.welcome_email_deliveries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.welcome_email_deliveries FROM anon, authenticated;
GRANT ALL ON TABLE public.welcome_email_deliveries TO service_role;

CREATE INDEX IF NOT EXISTS idx_welcome_email_deliveries_status
  ON public.welcome_email_deliveries(status, created_at);

CREATE OR REPLACE FUNCTION public.trigger_welcome_email_after_profile_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_service_key text;
  v_request_id bigint;
BEGIN
  -- Do not ever let email delivery prevent the profile/auth transaction.
  BEGIN
    INSERT INTO public.welcome_email_deliveries (user_id, email, status)
    SELECT NEW.id, u.email, 'pending'
    FROM auth.users AS u
    WHERE u.id = NEW.id
    ON CONFLICT (user_id) DO NOTHING;

    -- The project already has the service-role credential stored in Vault for
    -- server-side Gmail integration. Reuse that encrypted secret for this
    -- internal service-to-service call; the value never enters source code.
    SELECT decrypted_secret
      INTO v_service_key
      FROM vault.decrypted_secrets
     WHERE name = 'gmail_sync_service_role_key'
     LIMIT 1;

    IF v_service_key IS NULL OR v_service_key = '' THEN
      RAISE WARNING 'Welcome email trigger: service key is not configured; account creation will continue without email';
      RETURN NEW;
    END IF;

    SELECT net.http_post(
      url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', v_service_key
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'profiles',
        'schema', 'public',
        'record', jsonb_build_object('id', NEW.id)
      )
    ) INTO v_request_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Welcome email trigger failed safely: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_welcome_email_after_profile_insert() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_welcome_email_after_profile_insert() TO service_role;

DROP TRIGGER IF EXISTS profiles_welcome_email_after_insert ON public.profiles;
CREATE TRIGGER profiles_welcome_email_after_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email_after_profile_insert();
