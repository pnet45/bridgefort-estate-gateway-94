# Bridgefort Supabase Migration Operations

## Source of truth

The `supabase/migrations/` directory in Git is the canonical migration source. The remote project's `supabase_migrations.schema_migrations` table is the record of what has actually been applied.

These two histories must remain aligned by timestamp before a production release.

## Required workflow

1. Create or modify migrations in Git only.
2. Pull and reconcile any legitimate remote schema changes before creating new migrations.
3. Verify local migration ordering and uniqueness.
4. Verify remote migration history with `supabase migration list --linked`.
5. Run `supabase db push --linked --dry-run` before any real migration deployment.
6. Test the complete migration chain locally with `supabase db reset` when a local Docker/Supabase environment is available.
7. Only deploy migrations after the application phase is complete and validated.
8. After deployment, run `supabase migration list --linked` again and record the final version.

## Drift repair

If a migration exists in Git but not in remote history, first determine whether its SQL was already applied. Do not blindly rerun it against production.

If the schema is already correct and only migration history is missing, use `supabase migration repair --status applied <timestamp>` for the exact migration after confirming the state. `migration repair` changes history only; it does not execute the migration SQL.

If remote schema changes were made outside migrations, capture them with `supabase db pull`, review the generated migration, and verify with a local reset before release.

## Bridgefort release rule

A production phase is not complete until:

- Git migration history reaches the same latest timestamp as remote.
- No local-only or remote-only migrations remain.
- `db push --dry-run` shows no unexpected migrations.
- The application build and tests pass.
- Payment, authentication, authorization, and critical business flows have been checked.

Never use `migration repair` to hide an unknown migration failure.
