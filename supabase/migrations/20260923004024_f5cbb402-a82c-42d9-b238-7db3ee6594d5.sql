DROP FUNCTION IF EXISTS public.capture_property_inquiry(uuid,text,text,text,text);
CREATE OR REPLACE FUNCTION public.capture_property_inquiry(
  _listing_id uuid,
  _action_type text,
  _name text DEFAULT NULL,
  _email text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _authenticated_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_lead_id uuid;
  v_fingerprint uuid;
BEGIN
  IF _action_type NOT IN ('call','email','whatsapp','information_request') THEN RAISE EXCEPTION 'Invalid inquiry action'; END IF;
  SELECT * INTO v_listing FROM public.listings WHERE id = _listing_id AND status = 'approved';
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing unavailable'; END IF;
  IF _authenticated_user_id IS NOT NULL THEN SELECT * INTO v_profile FROM public.profiles WHERE id = _authenticated_user_id; END IF;
  IF _authenticated_user_id IS NULL AND coalesce(nullif(btrim(_email),''), nullif(btrim(_phone),'')) IS NULL THEN RAISE EXCEPTION 'Email or phone is required'; END IF;
  v_fingerprint := md5(_listing_id::text || ':' || _action_type || ':' || coalesce(_authenticated_user_id::text, lower(coalesce(_email,'')), regexp_replace(coalesce(_phone,''),'\D','','g')) || ':' || current_date::text)::uuid;
  INSERT INTO public.crm_leads(name,email,phone,source,status,listing_id,customer_id,estate_interest,source_record_type,source_record_id,priority)
  VALUES (
    coalesce(nullif(btrim(concat_ws(' ',v_profile.first_name,v_profile.last_name)),''),nullif(btrim(_name),''),'Property prospect'),
    coalesce(v_profile.email,_email), coalesce(v_profile.phone,_phone), _action_type, 'new', _listing_id, _authenticated_user_id, v_listing.title,
    'listing_action', v_fingerprint, CASE WHEN _action_type IN ('call','information_request') THEN 'high' ELSE 'medium' END
  )
  ON CONFLICT (source_record_type, source_record_id) WHERE source_record_type IS NOT NULL AND source_record_id IS NOT NULL
  DO UPDATE SET updated_at = now()
  RETURNING id INTO v_lead_id;
  INSERT INTO public.crm_lead_activities(lead_id,activity_type,description,created_by)
  VALUES(v_lead_id,_action_type,'Customer used the ' || replace(_action_type,'_',' ') || ' action for ' || v_listing.title,_authenticated_user_id);
  RETURN v_lead_id;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text,uuid) TO service_role;
COMMENT ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text,uuid) IS 'Internal property inquiry capture routine. The Edge Function derives the optional customer identity from a verified bearer token.';