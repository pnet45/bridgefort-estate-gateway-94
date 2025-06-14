
-- 1. Create a storage bucket for KYC documents (public access not allowed)
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false);

-- 2. Policies for storage bucket (only user can access their own files)
create policy "Users can upload their KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own KYC docs"
  on storage.objects for update
  using (
    bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own KYC docs"
  on storage.objects for delete
  using (
    bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Add extended KYC fields to profiles table
alter table public.profiles add column if not exists id_type text;
alter table public.profiles add column if not exists id_number text;
alter table public.profiles add column if not exists id_expiry date;
alter table public.profiles add column if not exists kyc_docs jsonb;
alter table public.profiles add column if not exists employment_status text;
alter table public.profiles add column if not exists employer_country text;
alter table public.profiles add column if not exists source_of_income text;
alter table public.profiles add column if not exists monthly_income numeric;
alter table public.profiles add column if not exists banking_details text;
alter table public.profiles add column if not exists is_foreigner boolean default false;
alter table public.profiles add column if not exists residence_permit text;
alter table public.profiles add column if not exists visa_status text;
alter table public.profiles add column if not exists aml_risk_rating text;
alter table public.profiles add column if not exists aml_notes text;

