-- Bridgefort CRM: administration, HR and IT operating workspace.
-- Additive only: preserves the existing customer CRM and role model.

CREATE TABLE IF NOT EXISTS public.hr_staff_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_code text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  department text NOT NULL DEFAULT 'Administration',
  job_title text NOT NULL,
  role_name text,
  reports_to uuid REFERENCES public.hr_staff_directory(id) ON DELETE SET NULL,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  start_date date,
  employment_status text NOT NULL DEFAULT 'active'
    CHECK (employment_status IN ('active','probation','leave','suspended','exited')),
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_job_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  role_name text NOT NULL,
  purpose text,
  responsibilities text[] NOT NULL DEFAULT '{}',
  monthly_deliverables text[] NOT NULL DEFAULT '{}',
  performance_measures text[] NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  department text NOT NULL DEFAULT 'Administration',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','blocked','completed','cancelled')),
  due_date date,
  completion_notes text,
  blocker text,
  evidence_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT current_date,
  tasks_completed text NOT NULL DEFAULT '',
  challenges text NOT NULL DEFAULT '',
  support_required text NOT NULL DEFAULT '',
  next_actions text NOT NULL DEFAULT '',
  evidence_url text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_user_id, report_date)
);

CREATE INDEX IF NOT EXISTS hr_staff_directory_department_idx ON public.hr_staff_directory(department, employment_status);
CREATE INDEX IF NOT EXISTS hr_staff_directory_manager_idx ON public.hr_staff_directory(reports_to);
CREATE INDEX IF NOT EXISTS hr_tasks_assignee_status_idx ON public.hr_tasks(assigned_to, status, due_date);
CREATE INDEX IF NOT EXISTS hr_tasks_due_date_idx ON public.hr_tasks(due_date) WHERE status NOT IN ('completed','cancelled');
CREATE INDEX IF NOT EXISTS hr_daily_reports_date_idx ON public.hr_daily_reports(report_date DESC);

CREATE OR REPLACE FUNCTION public.is_hr_manager(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    public.is_global_admin(_user_id)
    OR public.has_role(_user_id, 'super_admin')
    OR public.has_role(_user_id, 'admin_dir')
    OR public.has_role(_user_id, 'admin_acct')
    OR public.has_role(_user_id, 'admin_adm')
    OR public.has_role(_user_id, 'admin_it')
    OR public.has_role(_user_id, 'admin'),
    false
  );
$$;
REVOKE ALL ON FUNCTION public.is_hr_manager(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_hr_manager(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.protect_hr_task_staff_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_hr_manager(auth.uid()) THEN
    IF OLD.assigned_to IS DISTINCT FROM auth.uid()
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.department IS DISTINCT FROM OLD.department
       OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
       OR NEW.priority IS DISTINCT FROM OLD.priority
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.created_by IS DISTINCT FROM OLD.created_by
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Staff may only update the execution fields of tasks assigned to them';
    END IF;
  END IF;
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    NEW.completed_at := now();
  ELSIF NEW.status <> 'completed' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_hr_task_staff_updates() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS protect_hr_task_staff_updates_trigger ON public.hr_tasks;
CREATE TRIGGER protect_hr_task_staff_updates_trigger
BEFORE UPDATE ON public.hr_tasks
FOR EACH ROW EXECUTE FUNCTION public.protect_hr_task_staff_updates();

ALTER TABLE public.hr_staff_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_daily_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hr_staff_manager_all ON public.hr_staff_directory;
CREATE POLICY hr_staff_manager_all ON public.hr_staff_directory
  FOR ALL TO authenticated
  USING (public.is_hr_manager(auth.uid()))
  WITH CHECK (public.is_hr_manager(auth.uid()));
DROP POLICY IF EXISTS hr_staff_read_self ON public.hr_staff_directory;
CREATE POLICY hr_staff_read_self ON public.hr_staff_directory
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS hr_job_descriptions_manager_all ON public.hr_job_descriptions;
CREATE POLICY hr_job_descriptions_manager_all ON public.hr_job_descriptions
  FOR ALL TO authenticated
  USING (public.is_hr_manager(auth.uid()))
  WITH CHECK (public.is_hr_manager(auth.uid()));
DROP POLICY IF EXISTS hr_job_descriptions_staff_read ON public.hr_job_descriptions;
CREATE POLICY hr_job_descriptions_staff_read ON public.hr_job_descriptions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS hr_tasks_manager_all ON public.hr_tasks;
CREATE POLICY hr_tasks_manager_all ON public.hr_tasks
  FOR ALL TO authenticated
  USING (public.is_hr_manager(auth.uid()))
  WITH CHECK (public.is_hr_manager(auth.uid()));
DROP POLICY IF EXISTS hr_tasks_assigned_read ON public.hr_tasks;
CREATE POLICY hr_tasks_assigned_read ON public.hr_tasks
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());
DROP POLICY IF EXISTS hr_tasks_assigned_update ON public.hr_tasks;
CREATE POLICY hr_tasks_assigned_update ON public.hr_tasks
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

DROP POLICY IF EXISTS hr_daily_reports_manager_read ON public.hr_daily_reports;
CREATE POLICY hr_daily_reports_manager_read ON public.hr_daily_reports
  FOR SELECT TO authenticated
  USING (public.is_hr_manager(auth.uid()));
DROP POLICY IF EXISTS hr_daily_reports_self_select ON public.hr_daily_reports;
CREATE POLICY hr_daily_reports_self_select ON public.hr_daily_reports
  FOR SELECT TO authenticated
  USING (staff_user_id = auth.uid());
DROP POLICY IF EXISTS hr_daily_reports_self_insert ON public.hr_daily_reports;
CREATE POLICY hr_daily_reports_self_insert ON public.hr_daily_reports
  FOR INSERT TO authenticated
  WITH CHECK (staff_user_id = auth.uid());
DROP POLICY IF EXISTS hr_daily_reports_self_update ON public.hr_daily_reports;
CREATE POLICY hr_daily_reports_self_update ON public.hr_daily_reports
  FOR UPDATE TO authenticated
  USING (staff_user_id = auth.uid())
  WITH CHECK (staff_user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_staff_directory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_job_descriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.hr_daily_reports TO authenticated;
GRANT ALL ON public.hr_staff_directory, public.hr_job_descriptions, public.hr_tasks, public.hr_daily_reports TO service_role;
