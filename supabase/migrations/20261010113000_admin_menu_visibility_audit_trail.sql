-- Immutable audit trail for administrator menu-visibility changes.
CREATE TABLE IF NOT EXISTS public.admin_menu_visibility_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  target_user_id uuid NOT NULL,
  tab_key text NOT NULL,
  old_is_visible boolean,
  new_is_visible boolean,
  actor_user_id uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  operation text NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE'))
);

ALTER TABLE public.admin_menu_visibility_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_menu_visibility_audit FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_menu_visibility_audit TO authenticated;

DROP POLICY IF EXISTS admin_menu_visibility_audit_read_global ON public.admin_menu_visibility_audit;
CREATE POLICY admin_menu_visibility_audit_read_global
ON public.admin_menu_visibility_audit
FOR SELECT TO authenticated
USING (public.is_global_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.audit_admin_menu_visibility_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_menu_visibility_audit
      (target_user_id, tab_key, old_is_visible, new_is_visible, actor_user_id, operation)
    VALUES
      (NEW.user_id, NEW.tab_key, NULL, NEW.is_visible, auth.uid(), 'INSERT');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_visible IS DISTINCT FROM NEW.is_visible OR OLD.user_id IS DISTINCT FROM NEW.user_id OR OLD.tab_key IS DISTINCT FROM NEW.tab_key THEN
      INSERT INTO public.admin_menu_visibility_audit
        (target_user_id, tab_key, old_is_visible, new_is_visible, actor_user_id, operation)
      VALUES
        (NEW.user_id, NEW.tab_key, OLD.is_visible, NEW.is_visible, auth.uid(), 'UPDATE');
    END IF;
    RETURN NEW;
  ELSE
    INSERT INTO public.admin_menu_visibility_audit
      (target_user_id, tab_key, old_is_visible, new_is_visible, actor_user_id, operation)
    VALUES
      (OLD.user_id, OLD.tab_key, OLD.is_visible, NULL, auth.uid(), 'DELETE');
    RETURN OLD;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.audit_admin_menu_visibility_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_audit_admin_menu_visibility_change ON public.admin_menu_visibility;
CREATE TRIGGER trg_audit_admin_menu_visibility_change
AFTER INSERT OR UPDATE OR DELETE ON public.admin_menu_visibility
FOR EACH ROW EXECUTE FUNCTION public.audit_admin_menu_visibility_change();

COMMENT ON TABLE public.admin_menu_visibility_audit IS
'Append-only audit trail of administrator menu visibility changes. Readable only by Global Admins.';
