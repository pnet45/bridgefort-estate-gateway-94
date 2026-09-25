-- Allow every administrator with the approval permission to review requests.
drop policy if exists "pending_admin_requests_admin_read" on public.pending_admin_requests;
create policy "pending_admin_requests_admin_read"
  on public.pending_admin_requests
  for select
  to authenticated
  using (public.can_approve_admin_request(auth.uid()));

drop policy if exists "pending_admin_requests_admin_update" on public.pending_admin_requests;
create policy "pending_admin_requests_admin_update"
  on public.pending_admin_requests
  for update
  to authenticated
  using (public.can_approve_admin_request(auth.uid()))
  with check (public.can_approve_admin_request(auth.uid()));