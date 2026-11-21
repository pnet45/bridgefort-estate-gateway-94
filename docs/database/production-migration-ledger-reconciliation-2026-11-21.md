# Production Supabase migration ledger reconciliation

**Audit date:** 2026-11-21  
**Supabase project:** `xyvspvtdaacqfmfocvhw` (Bridgefort, eu-west-2)  
**Audited code base:** production merge `4b4c2024038ad236669944821eb51e0b843160ac`  
**Scope:** read-only production inspection plus source-control filename reconciliation. No production schema or migration-ledger writes were made for this audit.

## Executive result

The production ledger contains **322** migration records. The repository contains **310** SQL migration files after the two recovered files were restored.

Nine local migration files were matched to existing production ledger versions after checking their SQL intent against the deployed schema state. Their filenames were aligned to the production versions in this branch; SQL bodies were preserved unchanged.

After the initial source-control corrections and two additional historical-source recoveries:

- **19** production ledger versions still have no exact local version file.
- **7** local migration files still have versions not present in the production ledger.
- Two production ledger records share the same migration name: `20261016020017` and `20261016020023`, both named `20261015215000_grant_manager_documentation_management`.

This branch does **not** claim the migration history is fully reconciled. The remaining historical SQL has not been recovered, and Supabase Preview may continue to report missing local migration versions until the outstanding records are resolved.

## Verified filename/version alignments

The following local migration files were renamed to the version recorded in production. The SQL content was copied without modification; old filenames were removed from this branch.

| Previous local filename | Production ledger version/name |
|---|---|
| `20261007170000_leo_crm_conversation_links.sql` | `20261007161616_leo_crm_conversation_links` |
| `20261007173000_inspection_booking_service_journey_link.sql` | `20261007163039_inspection_booking_service_journey_link` |
| `20261007195500_leo_knowledge_source_monitor.sql` | `20261007185825_20261007195500_leo_knowledge_source_monitor` |
| `20261007195600_leo_knowledge_source_monitor_cron.sql` | `20261007185839_20261007195600_leo_knowledge_source_monitor_auth` |
| `20261007196500_lock_leo_version_snapshot_function.sql` | `20261007190217_20261007196500_lock_leo_version_snapshot_function` |
| `20261106193000_allow_inactive_bhrealtor_referral_attribution.sql` | `20261108214507_allow_inactive_bhrealtor_referral_attribution` |
| `20261108220000_enable_hero_slides_realtime.sql` | `20261108214842_enable_hero_slides_realtime` |
| `20261108221500_travel_enquiry_security_and_permissions.sql` | `20261108215242_travel_enquiry_security_and_permissions` |
| `20261113131000_create_private_career_resumes_bucket.sql` | `20261113121122_create_private_career_resumes_bucket` |

Read-only production evidence checked for these mappings included:

- Leo conversation and inspection-booking linkage columns and indexes exist; the inspection CRM trigger/function is installed.
- Leo source-sync table/index and the scheduled source-monitor job exist.
- Leo version-snapshot function is not executable by `anon` or `authenticated`, and is executable by `service_role`.
- BH-Realtor referral lookup/sponsor functions are installed with anonymous lookup execution denied.
- `hero_slides` is in the Supabase Realtime publication.
- Travel enquiry rate limiting exists; anonymous INSERT/SELECT/UPDATE/DELETE privileges on `travel_bookings` are false and the old permissive public insert policy is absent.
- The `resumes` bucket is private and the two expected upload/reviewer policies exist.

These checks establish that the corresponding features are present in production. They do not reconstruct the exact historical SQL text that originally created every object.

## Remaining production ledger versions without exact local files

The following **19** versions remain unmatched:

- `20261007164836 leo_knowledge_base_rag`
- `20261007164939 leo_knowledge_source_unique`
- `20261007164959 leo_knowledge_source_constraint`
- `20261007165248 leo_public_chat_and_kb_roles`
- `20261007165714 leo_kb_search_or_terms`
- `20261008043732 leo_knowledge_reconciliation_20261008050000`
- `20261008045426 bh_realtor_promotions_glassmorphism_20261008`
- `20261008115443 promo_public_home_seed_20261008`
- `20261008135304 email_campaign_rich_content_and_attachments`
- `20261009095237 admin_menu_visibility_overrides`
- `20261010101105 admin_menu_visibility_audit_trail`
- `20261010181827 enable_manager_admin_workspace_permissions`
- `20261010222819 revoke_client_execute_welcome_email_trigger`
- `20261010223058 bound_bhrealtor_network_tree_results`
- `20261011152647 remove_promo_emojis`
- `20261016020017 20261015215000_grant_manager_documentation_management`
- `20261016020023 20261015215000_grant_manager_documentation_management`
- `20261027041852 production_repair_hr_admin_it_workspace_20261027`
- `20261027041927 tighten_hr_workspace_table_grants_20261027`

Read-only state checks show several corresponding objects/features currently exist: Leo knowledge tables and source constraints, BH-Realtor promotions, rich email campaign columns, admin menu visibility/audit tables, downline/network functions, HR workspace tables, and the welcome-email trigger's execute permission is denied to both `anon` and `authenticated`. The exact SQL provenance for these 19 records is not present in the current migration directory and has not been reconstructed from database state.

Two additional migrations have now been recovered from original Git commit diffs and restored with their production ledger versions: `20261010100741_manager_admin_menu_visibility_controls.sql` (commit `88daa0594920c4cc0e789893aeaaaf5ba2f8c31c`) and `20261011152023_bound_downline_ids_recursion.sql` (commit `799211b9faeed6e1fb8b7315db2668d222f2acaf`). Their SQL was transcribed from the original commit diffs; they have not been replayed against production.

The two manager-documentation entries are duplicate-name ledger records. Do not delete either record or invent two replacement SQL files without recovering their provenance.

## Remaining local files without matching production ledger versions

These **7** local files remain unaligned:

| Local migration | Current evidence / disposition |
|---|---|
| `20261007193000_leo_knowledge_role_filtered_search.sql` | `search_leo_knowledge_v2` exists in production, but its exact historical ledger provenance is not established. |
| `20261007194500_leo_knowledge_version_history.sql` | Version table and snapshot triggers exist in production; original applied version is not established. |
| `20261015215000_grant_manager_documentation_management.sql` | Manager permission row exists; two duplicate-name production records need provenance review. |
| `20261019160000_crm_admin_hr_it_workspace.sql` | HR workspace tables/policies exist; later October 27 repair/tightening records are also present. Do not replay the original file. |
| `20261020120000_guard_admin_tab_permission_changes.sql` | Guard function/trigger is absent in production; treat as unapplied and review separately before any forward migration. |
| `20261106190100_harden_supabase_admin_default_privileges.sql` | Not recorded as applied; requires elevated `supabase_admin` authority and separate security review. Do not replay through an executor lacking that authority. |
| `20261108215900_enable_auth_and_mlm_realtime.sql` | `mlm_packages` is published but `auth_carousel_slides` is not. The migration is not confirmed as applied as a whole. |

## Production security observations

The audit confirmed:

- `travel_bookings` has no direct anonymous CRUD privileges and no old public INSERT policy.
- `consume_travel_enquiry_rate_limit` is a security-definer function; the rate-limit table is protected by RLS and restricted grants.
- `handle_new_user()` cannot be executed by `anon` or `authenticated`.
- HR tables have RLS enabled and no anonymous SELECT/INSERT table grants.
- The HR manager predicate and policies are present.
- The manager `admin:manage_travels` and `admin:manage_documentation` permission rows are present.
- The BMC migration versions remain present in the production ledger and their tables/triggers/RLS remain installed.

## Safe completion plan

1. Recover the exact original SQL for the 19 unmatched production records from trusted historical source control, deployment artifacts, or an authorized database migration archive.
2. Compare recovered SQL to the live schema and migration ledger; preserve duplicate records and original ordering.
3. Determine whether each of the seven local-only migrations was applied out-of-band, superseded, or never applied.
4. For genuinely unapplied changes, review and create a new forward-only migration with a fresh version; never reuse an old timestamp.
5. Validate the complete local migration directory against production in a disposable PostgreSQL environment.
6. Recheck Supabase Preview after source recovery. Do not use no-op placeholder files, delete migration-ledger rows, run old migrations again, or apply a blanket `migration repair` merely to silence the warning.

**No production migrations were executed, no production ledger rows were changed, and no client/CRM/referral data was modified during this reconciliation work.**
