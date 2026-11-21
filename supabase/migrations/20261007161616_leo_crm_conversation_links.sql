alter table public.leo_conversations
  add column if not exists crm_lead_id uuid references public.crm_leads(id) on delete set null,
  add column if not exists service_journey_id uuid references public.service_journeys(id) on delete set null,
  add column if not exists service_type text,
  add column if not exists last_intent text;

create index if not exists idx_leo_conversations_crm_lead_id
  on public.leo_conversations(crm_lead_id);

create index if not exists idx_leo_conversations_service_journey_id
  on public.leo_conversations(service_journey_id);

create index if not exists idx_leo_conversations_service_type
  on public.leo_conversations(service_type);
