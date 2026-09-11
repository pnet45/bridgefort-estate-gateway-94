drop policy if exists "Anyone can submit training registrations" on public.training_registrations;
create policy "Anyone can submit training registrations"
on public.training_registrations
for insert
to anon, authenticated
with check (email is not null and name is not null);
