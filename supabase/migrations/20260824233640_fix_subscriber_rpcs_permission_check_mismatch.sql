-- Both admin_get_estate_subscribers() and admin_get_subscriber_history()
-- gated on is_admin(auth.uid()), which only recognizes admins who have a
-- row in admin_roles (or are a global admin). It never checks the
-- admin_permissions table at all. But the "Subscribers" tab in
-- AdminConsole.tsx is shown/hidden based on hasPermission('admin:view_approvals'),
-- which — per fetchUserAccess() in AuthContext — can also be satisfied by an
-- explicit admin_permissions grant with no admin_roles row involved at all.
--
-- Net effect: an admin who has 'admin:view_approvals' purely via an
-- admin_permissions row could see and click the Subscribers tab, but every
-- call into these RPCs then failed with "Admin access required" — the tab
-- opened to a silent load failure. Aligning the RPC check with the same
-- permission that actually gates the tab fixes this for every way an admin
-- can legitimately hold that permission (global admin, role-derived, or
-- explicit grant — user_has_permission() already covers all three).

CREATE OR REPLACE FUNCTION public.admin_get_estate_subscribers(_search text DEFAULT NULL::text, _estate_code text DEFAULT NULL::text)
 RETURNS TABLE(subscription_number text, subscriber_name text, estate_name text, estate_code text, client_id uuid, order_id uuid, subscription_status text, payment_plan text, subscription_amount numeric, subscribed_at timestamp with time zone, client_email text, plot_count integer, order_total numeric, amount_paid numeric, outstanding_balance numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin if not (public.user_has_permission(auth.uid(), 'admin:view_approvals') or public.user_has_permission(auth.uid(), 'admin:all')) then raise exception 'Admin access required'; end if; return query select es.subscription_number, coalesce(nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.full_name, 'Unnamed Subscriber')::text, es.estate_name, es.estate_code, es.user_id, es.order_id, es.subscription_status, es.payment_plan, es.amount, es.subscribed_at, coalesce(p.email,u.email)::text, greatest(1,coalesce((select sum(coalesce((x->>'quantity')::integer,1)) from jsonb_array_elements(coalesce(o.items,'[]'::jsonb)) x),1))::integer, o.total_amount, o.amount_paid, greatest(coalesce(o.total_amount,0)-coalesce(o.amount_paid,0),0) from public.estate_subscriptions es left join public.orders o on o.id=es.order_id left join public.profiles p on p.id=es.user_id left join auth.users u on u.id=es.user_id where (_search is null or _search='' or es.subscription_number ilike '%'||_search||'%' or es.estate_name ilike '%'||_search||'%' or coalesce(p.email,u.email) ilike '%'||_search||'%' or coalesce(p.full_name,concat_ws(' ',p.first_name,p.last_name)) ilike '%'||_search||'%') and (_estate_code is null or _estate_code='' or es.estate_code=_estate_code) order by es.created_at desc; end; $function$;

CREATE OR REPLACE FUNCTION public.admin_get_subscriber_history(_order_id uuid)
 RETURNS TABLE(payment_id uuid, payment_type text, amount numeric, reference text, status text, payment_date timestamp with time zone, description text, installment_number integer, installment_status text, installment_amount_paid numeric, installment_amount_due numeric, documentation_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin if not (public.user_has_permission(auth.uid(), 'admin:view_approvals') or public.user_has_permission(auth.uid(), 'admin:all')) then raise exception 'Admin access required'; end if; if not exists(select 1 from public.orders where id=_order_id) then raise exception 'Order not found'; end if; return query select pr.id,pr.type,pr.amount,pr.reference,pr.status,coalesce(pr.processed_at,pr.created_at),pr.description,oi.installment_number,oi.status,oi.amount_paid,oi.amount_due,case when lower(coalesce(pr.type,'')) like '%documentation%' then coalesce(pr.description,'Documentation Bundle') else null end from public.payment_requests pr left join public.order_installments oi on oi.payment_id=pr.related_payment_id and oi.order_id=_order_id where pr.user_id=(select user_id from public.orders where id=_order_id) and (pr.description ilike '%'||(select coalesce(customer_name,'') from public.orders where id=_order_id)||'%' or pr.related_payment_id in(select oi2.payment_id from public.order_installments oi2 where oi2.order_id=_order_id) or pr.reference=(select payment_reference from public.orders where id=_order_id)) order by coalesce(pr.processed_at,pr.created_at) desc; end; $function$;
