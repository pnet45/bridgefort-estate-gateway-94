-- Create table to track failed login attempts
CREATE TABLE public.failed_login_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_attempted_at ON public.failed_login_attempts(attempted_at);

-- Enable RLS
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert/select (no public access)
CREATE POLICY "Service role can manage failed login attempts"
ON public.failed_login_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to check if account is locked
CREATE OR REPLACE FUNCTION public.is_account_locked(check_email TEXT, max_attempts INT DEFAULT 5, lockout_minutes INT DEFAULT 15)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    attempt_count INT;
BEGIN
    SELECT COUNT(*)
    INTO attempt_count
    FROM public.failed_login_attempts
    WHERE email = check_email
    AND attempted_at > (now() - (lockout_minutes || ' minutes')::interval);
    
    RETURN attempt_count >= max_attempts;
END;
$$;

-- Create function to record failed login attempt
CREATE OR REPLACE FUNCTION public.record_failed_login(attempt_email TEXT, attempt_ip TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.failed_login_attempts (email, ip_address)
    VALUES (attempt_email, attempt_ip);
END;
$$;

-- Create function to clear failed attempts after successful login
CREATE OR REPLACE FUNCTION public.clear_failed_logins(clear_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.failed_login_attempts
    WHERE email = clear_email;
END;
$$;

-- Create function to clean up old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.failed_login_attempts
    WHERE attempted_at < (now() - interval '24 hours');
END;
$$;