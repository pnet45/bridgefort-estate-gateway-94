-- Harden mailbox assignments and Gmail OAuth for the multi-provider mailbox model.
-- A single administrator may legitimately have the same company mailbox on
-- different providers (for example Resend + Gmail), so provider is part of
-- the assignment identity.

alter table public.admin_mailboxes
  drop constraint if exists admin_mailboxes_user_id_mailbox_email_key;

create unique index if not exists admin_mailboxes_user_mailbox_provider_uidx
  on public.admin_mailboxes (
    user_id,
    lower(mailbox_email),
    lower(coalesce(mailbox_provider, ''))
  );

alter table public.gmail_oauth_tokens
  add column if not exists mailbox_id uuid references public.admin_mailboxes(id) on delete cascade,
  add column if not exists google_account_email text,
  add column if not exists is_active boolean not null default true;

alter table public.gmail_oauth_state
  add column if not exists mailbox_email text;

update public.gmail_oauth_tokens t
set mailbox_id = m.id
from public.admin_mailboxes m
where t.mailbox_id is null
  and lower(m.mailbox_email) = lower(t.email)
  and lower(m.mailbox_provider) = 'gmail'
  and m.status = 'active';

alter table public.gmail_oauth_tokens
  drop constraint if exists gmail_oauth_tokens_email_key;

create unique index if not exists gmail_oauth_tokens_mailbox_google_uidx
  on public.gmail_oauth_tokens (mailbox_id, lower(google_account_email))
  where mailbox_id is not null and google_account_email is not null;

create index if not exists gmail_oauth_tokens_mailbox_idx
  on public.gmail_oauth_tokens (mailbox_id, is_active);

create index if not exists gmail_oauth_tokens_google_account_idx
  on public.gmail_oauth_tokens (lower(google_account_email));

create index if not exists gmail_oauth_state_mailbox_idx
  on public.gmail_oauth_state (mailbox_email, created_at desc);

-- Service-role Edge Functions do not have auth.uid(). Keep the caller check
-- only when a browser-authenticated user is actually present.
create or replace function public.user_mailbox_access(
  _user_id uuid,
  _mailbox_email text,
  _provider text default 'gmail'
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is not null
      and _user_id <> auth.uid()
      and not public.is_global_admin(auth.uid())
      and not public.user_has_permission(auth.uid(), 'admin:manage_permissions')
    then false
    when public.is_global_admin(_user_id)
      or public.has_role(_user_id, 'admin_dir')
      or public.user_has_permission(_user_id, 'admin:all')
    then true
    else exists (
      select 1
      from public.admin_mailboxes am
      where am.user_id = _user_id
        and lower(am.mailbox_email) = lower(_mailbox_email)
        and lower(coalesce(am.mailbox_provider, _provider)) = lower(_provider)
        and am.status = 'active'
    )
    or exists (
      select 1
      from public.admin_roles ar
      join public.admin_role_mailbox_access rma on rma.role_name = ar.role_name
      where ar.user_id = _user_id
        and (ar.expires_at is null or ar.expires_at > now())
        and lower(rma.mailbox_email) = lower(_mailbox_email)
    )
    or exists (
      select 1
      from public.admin_roles ar
      join public.role_default_mailboxes rdm on rdm.role_name = ar.role_name
      where ar.user_id = _user_id
        and (ar.expires_at is null or ar.expires_at > now())
        and lower(rdm.mailbox_email) = lower(_mailbox_email)
        and lower(rdm.mailbox_provider) = lower(_provider)
    )
  end;
$$;

revoke all on function public.user_mailbox_access(uuid, text, text) from public, anon;
grant execute on function public.user_mailbox_access(uuid, text, text) to authenticated, service_role;

create or replace function public.list_privileged_mailbox_managers()
returns table (id uuid, email text, legacy_role text, rbac_roles text[])
language sql
stable
security definer
set search_path = public
as $$
  select u.id,
    lower(coalesce(u.email, '')) as email,
    null::text as legacy_role,
    coalesce(array_agg(distinct ar.role_name) filter (where ar.role_name is not null), '{}'::text[]) as rbac_roles
  from auth.users u
  left join public.admin_roles ar on ar.user_id = u.id
  where public.user_has_permission(u.id, 'mailbox:write')
     or public.has_role(u.id, 'admin')
  group by u.id, u.email
  order by lower(coalesce(u.email, ''));
$$;

revoke all on function public.list_privileged_mailbox_managers() from public, anon;
grant execute on function public.list_privileged_mailbox_managers() to authenticated;

create or replace function public.get_available_mailboxes(_user_id uuid)
returns table (mailbox_email text, mailbox_provider text, is_connected boolean)
language sql
stable
security definer
set search_path = public
as $$
  select m.mailbox_email,
    m.mailbox_provider,
    case when lower(m.mailbox_provider) <> 'gmail' then true
      else exists (
        select 1
        from public.gmail_oauth_tokens t
        where t.mailbox_id = m.mailbox_id
          and t.is_active = true
          and exists (
            select 1
            from public.admin_mailboxes a
            cross join lateral regexp_split_to_table(coalesce(a.provider_account_id, ''), '[,;[:space:]]+') assigned(account)
            where a.id = m.mailbox_id
              and a.status = 'active'
              and lower(a.mailbox_provider) = 'gmail'
              and lower(trim(assigned.account)) = lower(t.google_account_email)
          )
      )
    end as is_connected
  from (
    select distinct am.id as mailbox_id, am.mailbox_email, am.mailbox_provider
    from public.admin_mailboxes am
    where am.user_id = _user_id and am.status = 'active'
    union
    select distinct am.id as mailbox_id, am.mailbox_email, am.mailbox_provider
    from public.admin_mailboxes am
    where am.status = 'active' and public.user_has_permission(_user_id, 'admin:all')
  ) m
  where _user_id = auth.uid() or public.user_has_permission(auth.uid(), 'admin:manage_permissions')
  order by m.mailbox_email, m.mailbox_provider;
$$;

revoke all on function public.get_available_mailboxes(uuid) from public, anon;
grant execute on function public.get_available_mailboxes(uuid) to authenticated;
