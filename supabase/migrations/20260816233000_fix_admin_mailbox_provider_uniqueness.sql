-- A company mailbox may legitimately be configured for more than one provider.
-- Example: sales@bridgeforthomes.com can have both a Resend route and a Gmail route
-- for the same administrator. The old constraint blocked that by enforcing only
-- (user_id, mailbox_email).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_mailboxes_user_id_mailbox_email_key'
  ) THEN
    ALTER TABLE public.admin_mailboxes
      DROP CONSTRAINT admin_mailboxes_user_id_mailbox_email_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS admin_mailboxes_user_id_mailbox_email_provider_key
  ON public.admin_mailboxes (user_id, mailbox_email, mailbox_provider);
