CREATE OR REPLACE FUNCTION public.admin_has_permission(_permission text, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, _permission);
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_has_permission(text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_has_permission(text, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs FOR INSERT TO public WITH CHECK (public.admin_has_permission('admin:view_activity'));
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs FOR SELECT TO public USING (public.admin_has_permission('admin:view_activity'));

DROP POLICY IF EXISTS "Admins can manage all calendar events" ON public.admin_calendar_events;
CREATE POLICY "Admins can manage all calendar events" ON public.admin_calendar_events FOR ALL TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Admins can manage chat messages" ON public.admin_chat_messages;
CREATE POLICY "Admins can manage chat messages" ON public.admin_chat_messages FOR ALL TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Admins can manage their own notes" ON public.admin_notes;
CREATE POLICY "Admins can manage their own notes" ON public.admin_notes FOR ALL TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Admins can manage all notices" ON public.admin_notices;
CREATE POLICY "Admins can manage all notices" ON public.admin_notices FOR ALL TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Admins can manage presence" ON public.admin_presence;
CREATE POLICY "Admins can manage presence" ON public.admin_presence FOR ALL TO public USING (public.admin_has_permission('admin:view_dashboard')) WITH CHECK (public.admin_has_permission('admin:view_dashboard'));
DROP POLICY IF EXISTS "Admins can manage all shared files" ON public.admin_shared_files;
CREATE POLICY "Admins can manage all shared files" ON public.admin_shared_files FOR ALL TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.admin_tasks;
CREATE POLICY "Admins can manage all tasks" ON public.admin_tasks FOR ALL TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));

DROP POLICY IF EXISTS "Only admins can view job applications" ON public.applications;
CREATE POLICY "Only admins can view job applications" ON public.applications FOR SELECT TO public USING (public.admin_has_permission('admin:view_approvals'));
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_log;
CREATE POLICY "Only admins can view audit logs" ON public.audit_log FOR SELECT TO public USING (public.admin_has_permission('admin:view_activity'));

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO public USING (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE TO public USING (public.admin_has_permission('admin:view_crm')) WITH CHECK (public.admin_has_permission('admin:view_crm'));
DROP POLICY IF EXISTS "Only admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can view contact messages" ON public.contact_messages FOR SELECT TO public USING (public.admin_has_permission('admin:view_crm'));

DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns FOR ALL TO public USING (public.admin_has_permission('admin:view_email_center')) WITH CHECK (public.admin_has_permission('admin:view_email_center'));
DROP POLICY IF EXISTS "Admins can delete email logs" ON public.email_logs;
CREATE POLICY "Admins can delete email logs" ON public.email_logs FOR DELETE TO public USING (public.admin_has_permission('admin:view_email_center'));
DROP POLICY IF EXISTS "Admins can insert email logs" ON public.email_logs;
CREATE POLICY "Admins can insert email logs" ON public.email_logs FOR INSERT TO public WITH CHECK (public.admin_has_permission('admin:view_email_center'));
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;
CREATE POLICY "Admins can view all email logs" ON public.email_logs FOR SELECT TO public USING (public.admin_has_permission('admin:view_email_center'));
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL TO public USING (public.admin_has_permission('admin:view_email_center')) WITH CHECK (public.admin_has_permission('admin:view_email_center'));

DROP POLICY IF EXISTS "Only admins can view newsletter subscriptions" ON public.newsletter_subscribers;
CREATE POLICY "Only admins can view newsletter subscriptions" ON public.newsletter_subscribers FOR SELECT TO public USING (public.admin_has_permission('admin:view_content'));
DROP POLICY IF EXISTS "Only admins can view newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Only admins can view newsletter subscriptions" ON public.newsletter_subscriptions FOR SELECT TO public USING (public.admin_has_permission('admin:view_content'));

DROP POLICY IF EXISTS "Staff and admin can create posts" ON public.posts;
CREATE POLICY "Staff and admin can create posts" ON public.posts FOR INSERT TO public WITH CHECK ((auth.uid() = author_id) AND (public.admin_has_permission('admin:view_content') OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ANY (ARRAY['manager'::text,'team_leader'::text]))));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO public USING (public.admin_has_permission('admin:view_users')) WITH CHECK (public.admin_has_permission('admin:view_users'));
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO public USING (public.admin_has_permission('admin:view_users'));
DROP POLICY IF EXISTS "Admins can view all property analytics" ON public.property_analytics;
CREATE POLICY "Admins can view all property analytics" ON public.property_analytics FOR SELECT TO public USING (public.admin_has_permission('admin:view_analytics'));

DROP POLICY IF EXISTS "Admins can manage attendance" ON public.training_attendance;
CREATE POLICY "Admins can manage attendance" ON public.training_attendance FOR ALL TO public USING (public.admin_has_permission('admin:view_content')) WITH CHECK (public.admin_has_permission('admin:view_content'));
DROP POLICY IF EXISTS "Only admins can delete training events" ON public.training_events;
CREATE POLICY "Only admins can delete training events" ON public.training_events FOR DELETE TO public USING (public.admin_has_permission('admin:view_content'));
DROP POLICY IF EXISTS "Only admins can insert training events" ON public.training_events;
CREATE POLICY "Only admins can insert training events" ON public.training_events FOR INSERT TO public WITH CHECK (public.admin_has_permission('admin:view_content'));
DROP POLICY IF EXISTS "Only admins can update training events" ON public.training_events;
CREATE POLICY "Only admins can update training events" ON public.training_events FOR UPDATE TO public USING (public.admin_has_permission('admin:view_content')) WITH CHECK (public.admin_has_permission('admin:view_content'));

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO public USING (public.admin_has_permission('admin:view_users'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO public USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
