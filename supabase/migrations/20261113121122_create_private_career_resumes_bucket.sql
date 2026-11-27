-- Store public career applicants' resumes in a private bucket.
-- Applicants may upload only into the dedicated prefix; only authorised career
-- reviewers may read objects. No public read policy is created.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public applicants can upload resumes" on storage.objects;
create policy "Public applicants can upload resumes"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = 'career-applications'
);

drop policy if exists "Career reviewers can read resumes" on storage.objects;
create policy "Career reviewers can read resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and admin_has_permission('admin:view_approvals'::text)
);
