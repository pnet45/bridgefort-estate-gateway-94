alter table public.gmail_oauth_tokens
  add column if not exists encrypted_access_token text,
  add column if not exists encrypted_refresh_token text;
