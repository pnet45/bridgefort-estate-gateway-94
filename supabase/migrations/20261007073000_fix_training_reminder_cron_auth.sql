-- Replace the initial training reminder cron invocation.
-- The previous job used the wrong Vault secret as a bearer token. The
-- worker now validates the existing hashed Bridgefort cron token instead.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'bridgefort-training-reminders') then
    perform cron.unschedule('bridgefort-training-reminders');
  end if;

  perform cron.schedule(
    'bridgefort-training-reminders',
    '0 * * * *',
    $cron$
    select net.http_post(
      url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/send-training-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-bridgefort-cron-token', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'inactive_account_reminders_cron_token'
        )
      ),
      body := jsonb_build_object('source', 'pg_cron', 'scheduled_at', now())
    );
    $cron$
  );
end
$$;
