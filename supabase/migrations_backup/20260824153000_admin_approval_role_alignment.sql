-- Align Admin approval permissions with the live authorization model.
-- Admin-IT may approve admin requests, but not payments or withdrawals.
insert into public.role_permissions(role, permission_key, is_enabled)
values
  ('admin','admin:approve_admin_requests',true),
  ('admin_dir','admin:approve_admin_requests',true),
  ('admin_acct','admin:approve_admin_requests',true),
  ('super_admin','admin:approve_admin_requests',true),
  ('admin_it','admin:approve_admin_requests',true)
on conflict(role,permission_key)
do update set is_enabled=true, updated_at=now();

create or replace function public.can_approve_admin_request(_user_id uuid default auth.uid())
returns boolean
language sql stable security definer set search_path=public
as $$
  select coalesce(
    public.user_has_permission(_user_id,'admin:approve_admin_requests')
    or public.user_has_permission(_user_id,'admin:manage_users')
    or public.user_has_permission(_user_id,'admin:manage_departments')
    or public.user_has_permission(_user_id,'admin:all'), false
  );
$$;

revoke all on function public.can_approve_admin_request(uuid) from public;
grant execute on function public.can_approve_admin_request(uuid) to authenticated;

create or replace function public.admin_approve_admin_request(_request_id uuid, _decision text, _rejection_reason text default null)
returns public.pending_admin_requests
language plpgsql security definer set search_path=public
as $$
declare v public.pending_admin_requests%rowtype; caller uuid:=auth.uid();
begin
  if caller is null or not (
    public.user_has_permission(caller,'admin:approve_admin_requests')
    or public.user_has_permission(caller,'admin:manage_users')
    or public.user_has_permission(caller,'admin:manage_departments')
    or public.user_has_permission(caller,'admin:all')
  ) then raise exception using errcode='42501',message='Not authorized to approve admin requests'; end if;
  if _decision not in ('approved','rejected') then raise exception 'Invalid admin request decision'; end if;
  select * into v from public.pending_admin_requests where id=_request_id for update;
  if not found then raise exception 'Admin request not found'; end if;
  if v.status <> 'pending' then raise exception 'Admin request is already finalized'; end if;
  if _decision='approved' then
    if v.user_id is null then raise exception 'Admin request has no user account'; end if;
    insert into public.admin_roles(user_id,role_name,granted_by,granted_at)
    values(v.user_id,v.requested_role,caller,now()) on conflict do nothing;
  end if;
  update public.pending_admin_requests
  set status=_decision, reviewed_at=now(), reviewed_by=caller,
      rejection_reason=case when _decision='rejected' then _rejection_reason else null end
  where id=_request_id returning * into v;
  insert into public.admin_activity_logs(admin_id,action_type,action_description,entity_type,entity_id,metadata)
  values(caller,'admin_request_approval',case when _decision='approved' then 'Approved admin access request' else 'Rejected admin access request' end,
         'pending_admin_request',v.id::text,jsonb_build_object('decision',_decision,'requested_role',v.requested_role,'user_id',v.user_id));
  return v;
end;
$$;

revoke all on function public.admin_approve_admin_request(uuid,text,text) from public;
grant execute on function public.admin_approve_admin_request(uuid,text,text) to authenticated;
