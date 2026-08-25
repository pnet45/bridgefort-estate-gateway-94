-- Phase 3: CRM authorization hardening.
-- CRM visibility and CRM mutation are separate concerns. Sales/CS manage CRM;
-- global admins retain access; other admin departments must not mutate leads.

INSERT INTO public.permissions (key, label, category, description)
VALUES (
  'admin:manage_crm',
  'Manage CRM',
  'admin',
  'Create, update, delete and manage CRM leads, follow-ups and activities'
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_name, permission_key)
VALUES
  ('super_admin', 'admin:manage_crm'),
  ('admin_dir', 'admin:manage_crm'),
  ('admin_sales', 'admin:manage_crm'),
  ('admin_cs', 'admin:manage_crm')
ON CONFLICT (role_name, permission_key) DO NOTHING;

-- Replace the original broad "any admin" CRM policies. The frontend can still
-- render the CRM tab according to admin:view_crm, but database writes require
-- the stronger manage permission.
DROP POLICY IF EXISTS "Admins can manage leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Admins can manage follow-ups" ON public.crm_follow_ups;
DROP POLICY IF EXISTS "Admins can manage lead activities" ON public.crm_lead_activities;

CREATE POLICY "CRM managers can manage leads"
ON public.crm_leads
FOR ALL TO authenticated
USING (public.admin_has_permission('admin:manage_crm', auth.uid()))
WITH CHECK (public.admin_has_permission('admin:manage_crm', auth.uid()));

CREATE POLICY "CRM managers can manage follow-ups"
ON public.crm_follow_ups
FOR ALL TO authenticated
USING (public.admin_has_permission('admin:manage_crm', auth.uid()))
WITH CHECK (public.admin_has_permission('admin:manage_crm', auth.uid()));

CREATE POLICY "CRM managers can manage lead activities"
ON public.crm_lead_activities
FOR ALL TO authenticated
USING (public.admin_has_permission('admin:manage_crm', auth.uid()))
WITH CHECK (public.admin_has_permission('admin:manage_crm', auth.uid()));

-- Explicitly index the common CRM access paths used by the admin console.
CREATE INDEX IF NOT EXISTS idx_crm_follow_ups_lead_scheduled
  ON public.crm_follow_ups(lead_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_created
  ON public.crm_lead_activities(lead_id, created_at DESC);
