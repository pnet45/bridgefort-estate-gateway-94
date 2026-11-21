# Production Supabase migration ledger reconciliation

**Audit date:** 2026-11-21  
**Supabase project:** `xyvspvtdaacqfmfocvhw` (Bridgefort, eu-west-2)  
**Audited code base:** production merge `4b4c2024038ad236669944821eb51e0b843160ac`  
**Scope:** read-only production inspection plus source-control filename reconciliation. No production schema or migration-ledger writes were made for this audit.

## Executive result

The production ledger contains **322** migration records. The active migration directory contains **317** SQL migration files after historical source recovery, two forward-only repairs, and archival of seven unmatched local migration artifacts.

Nine local migration files were matched to existing production ledger versions after checking their SQL intent against the deployed schema state. Their filenames were aligned to the production versions in this branch; SQL bodies were preserved unchanged.

After the initial nine filename alignments and fourteen historical-source recoveries:

- **7** production ledger versions still have no exact local version file.
- **0** stale local-only migration versions remain in the active migration directory. The seven original artifacts are preserved under `docs/database/unmatched-local-migrations/` and are not candidates for automatic replay.
- Two production ledger records share the same migration name: `20261016020017` and `20261016020023`, both named `20261015215000_grant_manager_documentation_management`.

This branch does **not** claim the production migration history is fully reconciled. Seven production ledger versions still lack their exact historical SQL. Two new forward-only migrations are staged in the active directory and are expected to be pending until separately reviewed and applied.

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

The following **7** versions remain unmatched:

- `20261007164836 leo_knowledge_base_rag`
- `20261007164939 leo_knowledge_source_unique`
- `20261007164959 leo_knowledge_source_constraint`
- `20261007165248 leo_public_chat_and_kb_roles`
- `20261007165714 leo_kb_search_or_terms`
- `20261027041852 production_repair_hr_admin_it_workspace_20261027`
- `20261027041927 tighten_hr_workspace_table_grants_20261027`

Read-only state checks show several corresponding objects/features currently exist: Leo knowledge tables and source constraints, BH-Realtor promotions, rich email campaign columns, admin menu visibility/audit tables, downline/network functions, HR workspace tables, and the welcome-email trigger's execute permission is denied to both `anon` and `authenticated`. The exact SQL provenance for these 7 records is not present in the current migration directory and has not been reconstructed from database state.

Fourteen migration files have now been restored from historical Git source and aligned to production ledger versions. This includes the five recovered from original commit diffs: `20261010100741_manager_admin_menu_visibility_controls.sql` (commit `88daa0594920c4cc0e789893aeaaaf5ba2f8c31c`), `20261010101105_admin_menu_visibility_audit_trail.sql` (commit `9efdb6cf87229da27e2753c0ad563af60ca1dd21`), `20261010181827_enable_manager_admin_workspace_permissions.sql` (commit `86254270957551a5cc3e80fbd15d83e20958146e`), `20261010223058_bound_bhrealtor_network_tree_results.sql` (commit `7accfdfca1d75b7bb71ab8124bb83eb9f0970b37`), and `20261011152023_bound_downline_ids_recursion.sql` (commit `799211b9faeed6e1fb8b7315db2668d222f2acaf`).

Six further exact scripts were recovered from historical repository trees and matched to their production versions: Leo knowledge reconciliation (`20261008043732`, source file from commit `9efdb6cf87229da27e2753c0ad563af60ca1dd21`); BH-Realtor promotions (`20261008045426`); public promo seed (`20261008115443`); email campaign rich content/attachments (`20261008135304`); admin menu visibility base table (`20261009095237`); and welcome-email trigger execute hardening (`20261010222819`, source commit `7accfdfca1d75b7bb71ab8124bb83eb9f0970b37`). Their SQL was copied from the historical files and checked against current production objects/data/privileges.

The promo emoji cleanup migration (`20261011152647`) was recovered from historical commit `36c74298c213b516a7370ed853ce3509f1735c20`. The two duplicate manager-documentation ledger records (`20261016020017` and `20261016020023`) were both restored from the same original migration file in commit `e698034834787b49b6f6e044c4746f225b75282b`; the recovered SQL is an idempotent permission-row update. Neither copy has been replayed against production.

The two manager-documentation entries are duplicate-name ledger records. Their original SQL source is now recovered from the historical PR #48 commit and copied under both production ledger versions. Preserve both records; do not delete either entry.

## Local-only migration disposition and forward repairs

The seven original local-only migration files were preserved verbatim under `docs/database/unmatched-local-migrations/` and removed from the active migration directory so a future migration push cannot blindly replay them:

| Archived artifact | Evidence and disposition |
|---|---|
| `20261007193000_leo_knowledge_role_filtered_search.sql` | The live `search_leo_knowledge_v2` definition matches the role/audience/review/expiry search behavior and is executable only by `service_role`. Exact original ledger provenance remains unproven; archived. |
| `20261007194500_leo_knowledge_version_history.sql` | Live version table and snapshot/increment triggers exist; snapshot execution is restricted to `service_role`. Exact applied version remains unproven; archived. |
| `20261015215000_grant_manager_documentation_management.sql` | Original local-only filename archived; exact historical SQL was recovered and restored under both production ledger versions `20261016020017` and `20261016020023`. |
| `20261019160000_crm_admin_hr_it_workspace.sql` | HR tables, RLS policies, and trigger functions exist; subsequent October 27 repair/tightening and November 2 access migrations are recorded. Archived to prevent replay over later policy changes. |
| `20261020120000_guard_admin_tab_permission_changes.sql` | Guard function/trigger absent. Original retained in archive; replaced in active migrations by forward-only `20261121150000_guard_admin_tab_permission_changes_forward.sql`. |
| `20261106190100_harden_supabase_admin_default_privileges.sql` | Not applied; current migration executor is `postgres` and is not a member of `supabase_admin`. Archived until an appropriately authorized executor can perform a reviewed privilege change. |
| `20261108215900_enable_auth_and_mlm_realtime.sql` | Production already publishes `mlm_packages`; `auth_carousel_slides` is RLS-enabled with a public active-row SELECT policy but is not published. Original retained in archive; forward-only `20261121150100_enable_auth_carousel_realtime_forward.sql` stages only the missing publication. |

The HR tables currently grant authenticated CRUD privileges, but their RLS policies restrict row access and no anonymous grants were found. The manager policies use `FOR ALL`, so broad revocation was not applied without role-specific regression testing. No blanket HR grant revocation was added because the manager policies intentionally support HR administration and a safe role-by-role behavior test is still required.

The two forward migrations are source-control changes only. They have **not** been applied to production. Their versions are newer than the current production ledger maximum and avoid reusing the old timestamps.

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

1. Recover the exact original SQL for the 7 unmatched production records from trusted historical source control, deployment artifacts, or an authorized database migration archive.
2. Compare recovered SQL to the live schema and migration ledger; preserve duplicate records and original ordering.
3. Continue source recovery for the seven remaining production-only ledger records. Preserve archived local artifacts and leave the `supabase_admin` default-privilege change blocked until an authorized executor is available.
4. For genuinely unapplied changes, review and create a new forward-only migration with a fresh version; never reuse an old timestamp. Two such forward repairs are staged for the absent admin-tab guard and missing auth-carousel Realtime publication.
5. Validate the complete local migration directory against production in a disposable PostgreSQL environment.
6. Recheck Supabase Preview after source recovery. Do not use no-op placeholder files, delete migration-ledger rows, run old migrations again, or apply a blanket `migration repair` merely to silence the warning.

**No production migrations were executed, no production ledger rows were changed, and no client/CRM/referral data was modified during this reconciliation work.**
