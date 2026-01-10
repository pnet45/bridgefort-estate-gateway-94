-- Create pending admin requests table for approval workflow
CREATE TABLE public.pending_admin_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_admin_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage pending requests (using has_role function)
CREATE POLICY "Admins can view pending requests"
ON public.pending_admin_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending requests"
ON public.pending_admin_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending requests"
ON public.pending_admin_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow inserts from edge functions (service role)
CREATE POLICY "Allow insert from service role"
ON public.pending_admin_requests
FOR INSERT
WITH CHECK (true);