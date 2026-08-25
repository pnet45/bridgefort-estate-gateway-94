-- Phase 3: turn public customer contact into an actual CRM workflow.
-- New contact messages become CRM leads automatically. Existing leads are reused
-- when the same normalized email or phone already exists.

CREATE OR REPLACE FUNCTION public.create_crm_lead_from_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_lead_id uuid;
BEGIN
  -- Prefer email identity, then phone identity. Never expose this helper to
  -- client callers; it runs only from the database trigger.
  SELECT id
    INTO existing_lead_id
  FROM public.crm_leads
  WHERE (
    NEW.email IS NOT NULL
    AND lower(trim(email)) = lower(trim(NEW.email))
  )
  OR (
    NEW.phone IS NOT NULL
    AND length(regexp_replace(phone, '[^0-9+]', '', 'g')) > 6
    AND regexp_replace(phone, '[^0-9+]', '', 'g') = regexp_replace(NEW.phone, '[^0-9+]', '', 'g')
  )
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_lead_id IS NOT NULL THEN
    UPDATE public.crm_leads
    SET
      name = COALESCE(NULLIF(trim(NEW.name), ''), name),
      email = COALESCE(NULLIF(trim(NEW.email), ''), email),
      phone = COALESCE(NULLIF(trim(NEW.phone), ''), phone),
      notes = CASE
        WHEN NULLIF(trim(NEW.message), '') IS NULL THEN notes
        WHEN NULLIF(trim(notes), '') IS NULL THEN NEW.message
        ELSE notes || E'\n\n[New contact message]\n' || NEW.message
      END,
      last_contacted_at = now(),
      updated_at = now()
    WHERE id = existing_lead_id;
  ELSE
    INSERT INTO public.crm_leads (
      name,
      email,
      phone,
      source,
      status,
      notes,
      last_contacted_at
    ) VALUES (
      COALESCE(NULLIF(trim(NEW.name), ''), 'Website Contact'),
      NULLIF(trim(NEW.email), ''),
      NULLIF(trim(NEW.phone), ''),
      'website',
      'new',
      CASE
        WHEN NULLIF(trim(NEW.subject), '') IS NULL THEN NEW.message
        ELSE 'Subject: ' || NEW.subject || E'\n\n' || NEW.message
      END,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contact_message_to_crm ON public.contact_messages;

CREATE TRIGGER trg_contact_message_to_crm
AFTER INSERT ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.create_crm_lead_from_contact_message();

REVOKE EXECUTE ON FUNCTION public.create_crm_lead_from_contact_message() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_crm_lead_from_contact_message() TO service_role;
