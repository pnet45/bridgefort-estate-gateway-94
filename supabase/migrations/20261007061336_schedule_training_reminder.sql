-- Schedule the training reminder worker hourly.
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'bridgefort-training-reminders') then
    perform cron.schedule(
      'bridgefort-training-reminders',
      '0 * * * *',
      $cron$
      select net.http_post(
        url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/send-training-reminder',
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
