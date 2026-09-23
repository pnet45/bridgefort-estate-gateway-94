ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estate(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_record_type text,
  ADD COLUMN IF NOT EXISTS source_record_id uuid,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS conversion_outcome text,
  ADD COLUMN IF NOT EXISTS conversion_value numeric(14,2),
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_reason text,
  ADD COLUMN IF NOT EXISTS closing_notes text,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL;

ALTER TABLE public.crm_follow_ups
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS completion_notes text;

CREATE UNIQUE INDEX IF NOT EXISTS crm_leads_source_record_unique
  ON public.crm_leads(source_record_type, source_record_id)
  WHERE source_record_type IS NOT NULL AND source_record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS crm_leads_estate_idx ON public.crm_leads(estate_id);
CREATE INDEX IF NOT EXISTS crm_leads_listing_idx ON public.crm_leads(listing_id);
CREATE INDEX IF NOT EXISTS crm_leads_assigned_status_idx ON public.crm_leads(assigned_to, status);
CREATE INDEX IF NOT EXISTS crm_leads_priority_idx ON public.crm_leads(priority);
CREATE INDEX IF NOT EXISTS crm_leads_closed_at_idx ON public.crm_leads(closed_at);
CREATE INDEX IF NOT EXISTS crm_follow_ups_pending_idx ON public.crm_follow_ups(scheduled_at) WHERE completed_at IS NULL AND cancelled_at IS NULL;

CREATE OR REPLACE FUNCTION public.validate_crm_lead_pipeline()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('new','contacted','qualified','proposal','won','lost') THEN
    RAISE EXCEPTION 'Invalid lead status';
  END IF;
  IF NEW.priority NOT IN ('low','medium','high','urgent') THEN
    RAISE EXCEPTION 'Invalid lead priority';
  END IF;
  IF NEW.estate_id IS NOT NULL AND NEW.listing_id IS NOT NULL THEN
    RAISE EXCEPTION 'A lead can reference an estate or a listing, not both';
  END IF;
  IF NEW.assigned_to IS NOT NULL AND NOT (
    public.has_role(NEW.assigned_to, 'admin') OR public.has_role(NEW.assigned_to, 'staff')
  ) THEN
    RAISE EXCEPTION 'Leads may only be assigned to admins or staff';
  END IF;
  IF NEW.status = 'won' THEN
    IF NEW.conversion_value IS NULL OR NEW.conversion_value < 0 OR NEW.closed_at IS NULL OR coalesce(btrim(NEW.outcome_reason),'') = '' THEN
      RAISE EXCEPTION 'Won leads require value, close date, and outcome reason';
    END IF;
    NEW.conversion_outcome := 'won';
  ELSIF NEW.status = 'lost' THEN
    IF NEW.closed_at IS NULL OR coalesce(btrim(NEW.outcome_reason),'') = '' THEN
      RAISE EXCEPTION 'Lost leads require close date and outcome reason';
    END IF;
    NEW.conversion_outcome := 'lost';
  ELSE
    NEW.conversion_outcome := NULL;
    NEW.closed_at := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_crm_lead_pipeline() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_crm_lead_pipeline() TO service_role;

DROP TRIGGER IF EXISTS validate_crm_lead_pipeline_trigger ON public.crm_leads;
CREATE TRIGGER validate_crm_lead_pipeline_trigger
BEFORE INSERT OR UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION public.validate_crm_lead_pipeline();

CREATE OR REPLACE FUNCTION public.is_crm_operator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'staff')
$$;
REVOKE ALL ON FUNCTION public.is_crm_operator(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_crm_operator(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can manage leads" ON public.crm_leads;
DROP POLICY IF EXISTS "super_admin_all_select" ON public.crm_leads;
DROP POLICY IF EXISTS "super_admin_all_insert" ON public.crm_leads;
DROP POLICY IF EXISTS "super_admin_all_update" ON public.crm_leads;
DROP POLICY IF EXISTS "super_admin_all_delete" ON public.crm_leads;
CREATE POLICY "CRM operators can view leads" ON public.crm_leads FOR SELECT TO authenticated USING (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can create leads" ON public.crm_leads FOR INSERT TO authenticated WITH CHECK (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can update leads" ON public.crm_leads FOR UPDATE TO authenticated USING (public.is_crm_operator(auth.uid())) WITH CHECK (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can delete leads" ON public.crm_leads FOR DELETE TO authenticated USING (public.is_crm_operator(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage follow-ups" ON public.crm_follow_ups;
DROP POLICY IF EXISTS "super_admin_all_select" ON public.crm_follow_ups;
DROP POLICY IF EXISTS "super_admin_all_insert" ON public.crm_follow_ups;
DROP POLICY IF EXISTS "super_admin_all_update" ON public.crm_follow_ups;
DROP POLICY IF EXISTS "super_admin_all_delete" ON public.crm_follow_ups;
CREATE POLICY "CRM operators can view follow ups" ON public.crm_follow_ups FOR SELECT TO authenticated USING (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can create follow ups" ON public.crm_follow_ups FOR INSERT TO authenticated WITH CHECK (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can update follow ups" ON public.crm_follow_ups FOR UPDATE TO authenticated USING (public.is_crm_operator(auth.uid())) WITH CHECK (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can delete follow ups" ON public.crm_follow_ups FOR DELETE TO authenticated USING (public.is_crm_operator(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage lead activities" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "super_admin_all_select" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "super_admin_all_insert" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "super_admin_all_update" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "super_admin_all_delete" ON public.crm_lead_activities;
CREATE POLICY "CRM operators can view activities" ON public.crm_lead_activities FOR SELECT TO authenticated USING (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can create activities" ON public.crm_lead_activities FOR INSERT TO authenticated WITH CHECK (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can update activities" ON public.crm_lead_activities FOR UPDATE TO authenticated USING (public.is_crm_operator(auth.uid())) WITH CHECK (public.is_crm_operator(auth.uid()));
CREATE POLICY "CRM operators can delete activities" ON public.crm_lead_activities FOR DELETE TO authenticated USING (public.is_crm_operator(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_leads TO authenticated;
GRANT ALL ON public.crm_leads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_follow_ups TO authenticated;
GRANT ALL ON public.crm_follow_ups TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_lead_activities TO authenticated;
GRANT ALL ON public.crm_lead_activities TO service_role;

CREATE OR REPLACE FUNCTION public.capture_inspection_crm_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_estate_id uuid;
  v_name text;
  v_phone text;
BEGIN
  SELECT id INTO v_estate_id FROM public.estate WHERE lower(name) = lower(NEW.estate_name) ORDER BY created_at DESC NULLS LAST LIMIT 1;
  SELECT nullif(btrim(concat_ws(' ', first_name, last_name)), ''), phone INTO v_name, v_phone FROM public.profiles WHERE id = NEW.user_id;
  INSERT INTO public.crm_leads(name,email,phone,source,status,estate_interest,estate_id,customer_id,source_record_type,source_record_id,priority,notes)
  VALUES (coalesce(v_name, NEW.email, 'Inspection customer'), NEW.email, v_phone, 'inspection', 'new', NEW.estate_name, v_estate_id, NEW.user_id, 'inspection_booking', NEW.id, 'high', NEW.message)
  ON CONFLICT (source_record_type, source_record_id) WHERE source_record_type IS NOT NULL AND source_record_id IS NOT NULL DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_inspection_crm_lead() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.capture_inspection_crm_lead() TO service_role;
DROP TRIGGER IF EXISTS capture_inspection_crm_lead_trigger ON public.inspection_bookings;
CREATE TRIGGER capture_inspection_crm_lead_trigger AFTER INSERT ON public.inspection_bookings FOR EACH ROW EXECUTE FUNCTION public.capture_inspection_crm_lead();

CREATE OR REPLACE FUNCTION public.capture_contact_crm_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_estate_id uuid;
BEGIN
  IF lower(NEW.subject || ' ' || NEW.message) !~ '(property|estate|land|house|apartment|inspection|listing|plot|home)' THEN
    RETURN NEW;
  END IF;
  SELECT id INTO v_estate_id FROM public.estate WHERE lower(NEW.subject || ' ' || NEW.message) LIKE '%' || lower(name) || '%' ORDER BY length(name) DESC LIMIT 1;
  INSERT INTO public.crm_leads(name,email,phone,source,status,estate_interest,estate_id,source_record_type,source_record_id,priority,notes)
  VALUES (NEW.name, NEW.email, NEW.phone, 'contact_form', 'new', NEW.subject, v_estate_id, 'contact_message', NEW.id, 'medium', NEW.message)
  ON CONFLICT (source_record_type, source_record_id) WHERE source_record_type IS NOT NULL AND source_record_id IS NOT NULL DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_contact_crm_lead() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.capture_contact_crm_lead() TO service_role;
DROP TRIGGER IF EXISTS capture_contact_crm_lead_trigger ON public.contact_messages;
CREATE TRIGGER capture_contact_crm_lead_trigger AFTER INSERT ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.capture_contact_crm_lead();

CREATE OR REPLACE FUNCTION public.capture_property_inquiry(
  _listing_id uuid,
  _action_type text,
  _name text DEFAULT NULL,
  _email text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_uid uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_lead_id uuid;
  v_fingerprint uuid;
BEGIN
  IF _action_type NOT IN ('call','email','whatsapp','information_request') THEN RAISE EXCEPTION 'Invalid inquiry action'; END IF;
  SELECT * INTO v_listing FROM public.listings WHERE id = _listing_id AND status = 'approved';
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing unavailable'; END IF;
  IF v_uid IS NOT NULL THEN SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid; END IF;
  IF v_uid IS NULL AND coalesce(nullif(btrim(_email),''), nullif(btrim(_phone),'')) IS NULL THEN RAISE EXCEPTION 'Email or phone is required'; END IF;
  v_fingerprint := md5(_listing_id::text || ':' || _action_type || ':' || coalesce(v_uid::text, lower(coalesce(_email,'')), regexp_replace(coalesce(_phone,''),'\D','','g')) || ':' || current_date::text)::uuid;
  INSERT INTO public.crm_leads(name,email,phone,source,status,listing_id,customer_id,estate_interest,source_record_type,source_record_id,priority)
  VALUES (
    coalesce(nullif(btrim(concat_ws(' ',v_profile.first_name,v_profile.last_name)),''),nullif(btrim(_name),''),'Property prospect'),
    coalesce(v_profile.email,_email), coalesce(v_profile.phone,_phone), _action_type, 'new', _listing_id, v_uid, v_listing.title,
    'listing_action', v_fingerprint, CASE WHEN _action_type IN ('call','information_request') THEN 'high' ELSE 'medium' END
  )
  ON CONFLICT (source_record_type, source_record_id) WHERE source_record_type IS NOT NULL AND source_record_id IS NOT NULL
  DO UPDATE SET updated_at = now()
  RETURNING id INTO v_lead_id;
  INSERT INTO public.crm_lead_activities(lead_id,activity_type,description,created_by)
  VALUES(v_lead_id,_action_type,'Customer used the ' || replace(_action_type,'_',' ') || ' action for ' || v_listing.title,v_uid);
  RETURN v_lead_id;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text) TO anon, authenticated, service_role;