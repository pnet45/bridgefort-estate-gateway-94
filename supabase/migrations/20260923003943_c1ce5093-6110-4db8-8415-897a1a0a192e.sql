ALTER FUNCTION public.is_crm_operator(uuid) SECURITY INVOKER;

REVOKE EXECUTE ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text) TO service_role;
COMMENT ON FUNCTION public.capture_property_inquiry(uuid,text,text,text,text) IS 'Internal property inquiry capture routine. Browser callers must use the capture-property-inquiry Edge Function.';