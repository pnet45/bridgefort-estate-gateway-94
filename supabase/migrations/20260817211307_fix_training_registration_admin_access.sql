drop policy if exists "Admins can view all training registrations" on public.training_registrations;
create policy "Admins can view all training registrations"
on public.training_registrations
for select
to public
using (public.is_admin(auth.uid()));
