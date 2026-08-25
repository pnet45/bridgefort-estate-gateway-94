SELECT cron.unschedule('gmail-sync-every-10-minutes')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gmail-sync-every-10-minutes');

SELECT cron.schedule(
  'gmail-sync-every-120-seconds',
  '*/2 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/gmail-sync-to-db',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret
          FROM vault.decrypted_secrets
          WHERE name = 'gmail_sync_service_role_key'
        )
      ),
      body := jsonb_build_object('maxPerLabel', 25)
    );
  $$
);