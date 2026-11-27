-- Add spouse and joint-purchase details to the existing user profile.
-- Existing AML/CFT declarations remain in profiles and are not moved or removed.
alter table public.profiles
  add column if not exists spouse_phone text,
  add column if not exists spouse_email text,
  add column if not exists spouse_address text,
  add column if not exists is_joint_purchase boolean not null default false,
  add column if not exists joint_purchaser_name text,
  add column if not exists joint_purchaser_phone text,
  add column if not exists joint_purchaser_email text,
  add column if not exists joint_purchaser_relationship text;

comment on column public.profiles.is_joint_purchase is
  'Whether the customer intends a property subscription or purchase to be jointly owned.';
comment on column public.profiles.joint_purchaser_name is
  'Full name of the additional joint purchaser, where applicable.';
comment on column public.profiles.spouse_phone is
  'Spouse contact phone supplied voluntarily by the customer.';
comment on column public.profiles.spouse_email is
  'Spouse contact email supplied voluntarily by the customer.';
comment on column public.profiles.spouse_address is
  'Spouse address supplied voluntarily by the customer.';
