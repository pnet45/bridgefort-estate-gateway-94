-- Add scheduled_at column to email_campaigns table for email scheduling
ALTER TABLE public.email_campaigns 
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone DEFAULT NULL;

-- Add an index for faster queries on scheduled emails
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at 
ON public.email_campaigns(scheduled_at) 
WHERE scheduled_at IS NOT NULL AND status = 'scheduled';