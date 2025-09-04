-- Fix applications table security vulnerability
-- Add comprehensive RLS policies for better data protection

-- Allow authenticated users to view their own applications 
-- (currently users can't see applications they submitted)
CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Allow authenticated users to update their own applications
-- (useful for updating application status or correcting information)
CREATE POLICY "Users can update their own applications" 
ON public.applications 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
))
WITH CHECK (auth.uid() IS NOT NULL AND email = (
  SELECT email FROM auth.users WHERE id = auth.users WHERE id = auth.uid()
));

-- Allow authenticated users to delete their own applications
-- (GDPR compliance - users should be able to delete their personal data)
CREATE POLICY "Users can delete their own applications" 
ON public.applications 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Add audit trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_applications_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log sensitive data access attempts
  INSERT INTO audit_log (
    table_name, 
    operation, 
    user_id, 
    timestamp, 
    data_accessed
  ) VALUES (
    'applications',
    TG_OP,
    auth.uid(),
    NOW(),
    jsonb_build_object(
      'application_id', COALESCE(NEW.id, OLD.id),
      'email', COALESCE(NEW.email, OLD.email)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_accessed JSONB
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Create the audit trigger
CREATE TRIGGER applications_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.audit_applications_access();