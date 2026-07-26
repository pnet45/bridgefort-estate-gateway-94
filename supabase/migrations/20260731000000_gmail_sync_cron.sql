-- Periodic Gmail auto-sync. pg_cron can only run SQL, not call an HTTP
-- endpoint directly — pg_net (also a Supabase-provided extension) is what
-- actually makes the HTTP call to the edge function; pg_cron just
-- schedules that SQL to run on a timer.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- The service-role key needs to live somewhere the cron job's SQL can read
-- it from. Storing it as a database setting keeps it out of the migration
-- history's plain text going forward (this file only *sets the mechanism*,
-- not the key) — replace <YOUR_SERVICE_ROLE_KEY> below with your project's
-- actual service role key (Project Settings -> API -> service_role) when
-- you run this migration, then this exact line never needs to be committed
-- with the real key in it again.
ALTER DATABASE postgres SET app.settings.service_role_key = '<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnNwdnRkYWFjcWZtZm9jdmh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQ0NDQxMiwiZXhwIjoyMDYzMDIwNDEyfQ.2CkfdICz7ZI_1P947jgdk_8EuR8jk1Z0edpB7tOQnHk>';
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://xyvspvtdaacqfmfocvhw.supabase.co';

-- Remove any previous schedule of the same name so this migration is safe
-- to re-run (e.g. to change the interval) without erroring on a duplicate.
SELECT cron.unschedule('gmail-sync-every-10-minutes')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gmail-sync-every-10-minutes');

SELECT cron.schedule(
  'gmail-sync-every-10-minutes',
  '*/10 * * * *', -- every 10 minutes; adjust the cron expression to change frequency
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/gmail-sync-to-db',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('maxPerLabel', 25)
  );
  $$
);
