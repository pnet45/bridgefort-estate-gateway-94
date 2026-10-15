-- Prevent enabling legal-document email delivery before the matching template is approved.
-- Disabling a template or reintroducing unresolved legal placeholders automatically turns its delivery switch OFF.
create or replace function public.enforce_transaction_document_delivery_readiness()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  template_name text;
  template_body text;
  template_enabled boolean;
begin
  if not new.enabled then
    return new;
  end if;

  select name, body_html_template, enabled
    into template_name, template_body, template_enabled
  from public.transaction_document_templates
  where document_type = new.document_type;

  if not found
     or template_enabled is distinct from true
     or lower(coalesce(template_name, '')) like '%legal review required%'
     or coalesce(template_body, '') ~* '\\[(TO BE CONFIRMED|ESTATE-SPECIFIC|CURRENT APPROVED|VERIFY|INSERT AND VERIFY|SURVEY COORDINATES)' then
    raise exception using
      errcode = '23514',
      message = 'Cannot enable legal-document email delivery until the matching template is approved and all legal review placeholders are resolved.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_transaction_document_delivery_readiness() from public, anon, authenticated;

drop trigger if exists enforce_transaction_document_delivery_readiness on public.transaction_document_automation_controls;
create trigger enforce_transaction_document_delivery_readiness
before insert or update of enabled, document_type
on public.transaction_document_automation_controls
for each row execute function public.enforce_transaction_document_delivery_readiness();

create or replace function public.disable_unapproved_transaction_document_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.enabled is distinct from true
     or lower(coalesce(new.name, '')) like '%legal review required%'
     or coalesce(new.body_html_template, '') ~* '\\[(TO BE CONFIRMED|ESTATE-SPECIFIC|CURRENT APPROVED|VERIFY|INSERT AND VERIFY|SURVEY COORDINATES)' then
    update public.transaction_document_automation_controls
       set enabled = false, updated_at = now()
     where document_type = new.document_type
       and enabled = true;
  end if;
  return new;
end;
$$;

revoke all on function public.disable_unapproved_transaction_document_delivery() from public, anon, authenticated;

drop trigger if exists disable_unapproved_transaction_document_delivery on public.transaction_document_templates;
create trigger disable_unapproved_transaction_document_delivery
after insert or update of name, body_html_template, enabled, document_type
on public.transaction_document_templates
for each row execute function public.disable_unapproved_transaction_document_delivery();
