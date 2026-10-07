-- Historical duplicate of the retry scheduler migration.
-- The job is created idempotently so this migration is safe on fresh databases
-- and preserves the production migration history.
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'bridgefort-email-delivery-retries') then
    perform cron.schedule(
      'bridgefort-email-delivery-retries',
      '*/15 * * * *',
      $cron$
      select net.http_post(
        url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/retry-email-delivery',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-bridgefort-cron-token', (
            select decrypted_secret from vault.decrypted_secrets
            where name = 'inactive_account_reminders_cron_token'
          )
        ),
        body := jsonb_build_object('source', 'pg_cron', 'scheduled_at', now())
      );
      $cron$
    );
  end if;
end
$$;
