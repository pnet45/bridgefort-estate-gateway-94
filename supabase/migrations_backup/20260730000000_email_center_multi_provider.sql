-- Unified email center: admin_emails already supports `source` and `folder`
-- (used by the Resend inbound webhook). This extends it so Gmail can be
-- synced into the same table on the same footing, and so both providers can
-- be deduplicated safely on repeated syncs.

-- Which actual mailbox a message belongs to (e.g. a specific Gmail address
-- or Resend sending domain) — nullable for now since this project currently
-- has one mailbox per provider, but this keeps multi-account support cheap
-- to add later without another migration.
ALTER TABLE public.admin_emails ADD COLUMN IF NOT EXISTS account_email text;

-- Dedup key for sync-based providers (Gmail): external_ref holds the
-- provider's own message id, so re-syncing the same message updates it in
-- place (e.g. read-state changes made directly in Gmail) instead of
-- duplicating it every sync run.
DROP INDEX IF EXISTS idx_admin_emails_source_external_ref;
CREATE UNIQUE INDEX idx_admin_emails_source_external_ref
  ON public.admin_emails (source, external_ref)
  WHERE external_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_emails_source_folder ON public.admin_emails (source, folder);
