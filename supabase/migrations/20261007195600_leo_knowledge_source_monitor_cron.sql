-- Leo official-source monitor cron.
-- Requires the Vault secret leo_knowledge_source_monitor_jwt to be configured
-- with a valid Supabase JWT before this job can invoke the protected function.
select cron.schedule(
  'leo-knowledge-source-monitor',
  '15 1 * * *',
  $$
    select net.http_post(
      url := 'https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/leo-knowledge-source-monitor',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'leo_knowledge_source_monitor_jwt'),
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'leo_knowledge_source_monitor_jwt')
      ),
      body := jsonb_build_object('trigger', 'scheduled', 'time', now())
    ) as request_id;
  $$
);
