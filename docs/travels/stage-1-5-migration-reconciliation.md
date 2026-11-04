# Bridgefort Travels Stage 1.5 — Supabase migration reconciliation

**Scope:** read-only comparison of GitHub `main` migration files with the live Supabase migration ledger for project `xyvspvtdaacqfmfocvhw`.

**Observed inventory**
- GitHub `main`: 286 timestamped SQL migration files.
- Live Supabase ledger: 301 entries.
- 281 ledger entries map to a local migration file by exact version or exact migration name.
- 20 ledger entries have no exact matching filename/name in the repository inventory.
- 6 local migration files have no exact matching ledger version/name.
- Two ledger versions (`20261016020017` and `20261016020023`) both refer to `20261015215000_grant_manager_documentation_management.sql`; this is a duplicate-name mapping that needs provenance review, not an instruction to delete or rewrite ledger rows.

## Ledger entries without an exact local file/name match

- `20261007164836 leo_knowledge_base_rag`
- `20261007164939 leo_knowledge_source_unique`
- `20261007164959 leo_knowledge_source_constraint`
- `20261007165248 leo_public_chat_and_kb_roles`
- `20261007165714 leo_kb_search_or_terms`
- `20261007185839 20261007195600_leo_knowledge_source_monitor_auth`
- `20261008043732 leo_knowledge_reconciliation_20261008050000`
- `20261008045426 bh_realtor_promotions_glassmorphism_20261008`
- `20261008115443 promo_public_home_seed_20261008`
- `20261008135304 email_campaign_rich_content_and_attachments`
- `20261009095237 admin_menu_visibility_overrides`
- `20261010100741 manager_admin_menu_visibility_controls`
- `20261010101105 admin_menu_visibility_audit_trail`
- `20261010181827 enable_manager_admin_workspace_permissions`
- `20261010222819 revoke_client_execute_welcome_email_trigger`
- `20261010223058 bound_bhrealtor_network_tree_results`
- `20261011152023 bound_downline_ids_recursion`
- `20261011152647 remove_promo_emojis`
- `20261027041852 production_repair_hr_admin_it_workspace_20261027`
- `20261027041927 tighten_hr_workspace_table_grants_20261027`

## Local migration files without an exact ledger version/name match

- `20261007193000_leo_knowledge_role_filtered_search.sql`
- `20261007194500_leo_knowledge_version_history.sql`
- `20261007195600_leo_knowledge_source_monitor_cron.sql`
- `20261019160000_crm_admin_hr_it_workspace.sql`
- `20261020120000_guard_admin_tab_permission_changes.sql`
- `20261029090000_restrict_hr_management_to_global_and_manager_admin.sql`

## Interpretation and release gate

A version-only diff overstates the mismatch because some ledger entries were recorded under a different version while retaining the original migration name. Matching by exact migration name resolves several apparent version differences. The remaining 20/6 inventory is not enough to infer whether the SQL effects are absent, manually applied, represented by a differently named migration, or superseded.

**Do not run `supabase db push`, insert/delete migration ledger rows, replay historical SQL, or apply the Stage 1.5 migration until each unmatched item has been reconciled against the live schema/function/policy state and its original SQL source.** The two October 27 HR entries require their source migration SQL and explicit comparison to the local HR workspace migration before any release decision.

## Live schema spot-checks (read-only)

The following catalog checks were run against the live Supabase project after the filename/name inventory:

- The HR tables `hr_staff_directory`, `hr_job_descriptions`, `hr_tasks`, and `hr_daily_reports` exist.
- The live `public.is_hr_manager(uuid)` definition currently authorises global admins and the roles `super_admin`, `admin_dir`, `admin_acct`, `admin_adm`, `admin_it`, and `admin`. The local-only migration `20261029090000_restrict_hr_management_to_global_and_manager_admin.sql` narrows this to global admins and `admin_acct` (Manager Admin). That intended narrowing is not reflected in the live function. Do not assume the local migration has been applied.
- The `guard_admin_tab_permission_changes` function and trigger are absent from the live catalog, although the local-only migration `20261020120000_guard_admin_tab_permission_changes.sql` defines them. Existing RLS policies on `role_permissions` remain in place; the missing trigger is a missing additional database guard, not proof that all users can write permissions.
- `leo_knowledge_versions` and `leo_knowledge_source_sync` exist; the live version increment/snapshot triggers are present, and the `leo-knowledge-source-monitor` cron job is active. These effects are present despite several timestamp/name mismatches in the repository inventory. Do not replay related migrations based on timestamp differences alone.
- The HR tables show table-level privileges for `anon`, but the inspected HR RLS policy set contains no `anon` policies. RLS currently remains the row-access boundary; the broader grants should still be reviewed for least privilege and reconciled against the original `20261027041927` SQL.

These checks show why migration reconciliation must compare source SQL, ledger names, live function definitions, triggers, policies and grants. A filename mismatch alone does not prove a migration is missing, and a ledger entry alone does not prove the intended security state is present.
