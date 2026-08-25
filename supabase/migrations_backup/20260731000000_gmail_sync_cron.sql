-- Periodic Gmail auto-sync. pg_cron can only run SQL, not call an HTTP
-- endpoint directly — pg_net (also a Supabase-provided extension) is what
-- actually makes the HTTP call to the edge function; pg_cron just
-- schedules that SQL to run on a timer.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- The service-role key has to live somewhere the cron job's SQL can read it
-- from at run time. `ALTER DATABASE ... SET` needs Postgres superuser,
-- which Supabase doesn't grant even to project owners through the SQL
-- Editor — Vault (a Supabase-provided extension, already enabled on every
-- project) is the supported way to store a secret that SQL can read back.
--
-- Replace <YOUR_SERVICE_ROLE_KEY> below with your real service role key
-- (Project Settings -> API -> service_role) before running this. If you
-- run this migration more than once, delete the old secret first:
--   select vault.create_secret(...) will error on a duplicate name, so this
--   uses a DO block to skip creation if it already exists.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'gmail_sync_service_role_key') THEN
    PERFORM vault.create_secret(
      '<YOUR_SERVICE_ROLE_KEY>',
      'gmail_sync_service_role_key',
      'Service role key used by the gmail-sync-to-db pg_cron job'
    );
  END IF;
END
$$;

-- Remove any previous schedule of the same name so this migration is safe
-- to re-run (e.g. to change the interval) without erroring on a duplicate.
SELECT cron.unschedule('gmail-sync-every-10-minutes')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gmail-sync-every-10-minutes');

SELECT cron.schedule(
  'gmail-sync-every-10-minutes',
  '*/10 * * * *', -- every 10 minutes; adjust the cron expression to change frequency
  $$
  SELECT net.http_post(
    url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/gmail-sync-to-db',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'gmail_sync_service_role_key'
      )
    ),
    body := jsonb_build_object('maxPerLabel', 25)
  );
  $$
);