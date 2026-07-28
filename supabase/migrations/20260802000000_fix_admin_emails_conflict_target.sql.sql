-- Fixes a bug in 20260730000000_email_center_multi_provider.sql: that
-- migration created idx_admin_emails_source_external_ref as a PARTIAL
-- unique index (WHERE external_ref IS NOT NULL). Postgres requires an
-- ON CONFLICT target to exactly match a unique index/constraint, including
-- its WHERE clause — and Supabase's .upsert({ onConflict: 'source,external_ref' })
-- generates a plain ON CONFLICT (source, external_ref) with no WHERE clause,
-- which a partial index can never satisfy. Every gmail-sync-to-db upsert
-- failed with "there is no unique or exclusion constraint matching the ON
-- CONFLICT specification" as a result.
--
-- The partial index was solving a problem that doesn't actually exist:
-- Postgres unique constraints already treat NULL as distinct from every
-- other NULL, so a plain (non-partial) UNIQUE constraint on
-- (source, external_ref) already allows unlimited rows with
-- external_ref = NULL per source without conflicting — no WHERE clause
-- needed at all.

DROP INDEX IF EXISTS idx_admin_emails_source_external_ref;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_emails_source_external_ref_key'
  ) THEN
    ALTER TABLE public.admin_emails
      ADD CONSTRAINT admin_emails_source_external_ref_key UNIQUE (source, external_ref);
  END IF;
END
$$;