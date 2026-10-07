do $$
begin
  if exists (select 1 from cron.job where jobname = 'bridgefort-client-engagement-automations') then
    perform cron.unschedule('bridgefort-client-engagement-automations');
  end if;
end $$;