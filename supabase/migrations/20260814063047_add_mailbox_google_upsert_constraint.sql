do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname='gmail_oauth_tokens_mailbox_google_unique'
      and conrelid='public.gmail_oauth_tokens'::regclass
  ) then
    alter table public.gmail_oauth_tokens
      add constraint gmail_oauth_tokens_mailbox_google_unique unique (mailbox_id, google_account_email);
  end if;
end $$;
