-- Rich email campaign content and attachments
ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS body_html TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.email_campaigns
SET body_html = CASE
  WHEN body_html IS NULL OR btrim(body_html) = '' THEN body
  ELSE body_html
END
WHERE body_html IS NULL OR btrim(body_html) = '';

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status_created_at
  ON public.email_campaigns(status, created_at DESC);
