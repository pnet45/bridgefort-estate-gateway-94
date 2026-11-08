# Bridgefort Travels Stage 1.5 — live migration and security reconciliation

**Audit date:** 2026-11-08  
**Supabase project:** `xyvspvtdaacqfmfocvhw`  
**Repository:** `pnet45/bridgefort-estate-gateway-94`

## Migration inventory

A fresh comparison of the current `main` branch and the live Supabase migration ledger found:

- GitHub `main`: **297** timestamped SQL migration files.
- Live Supabase ledger: **312** entries.
- **20** ledger entries have no exact matching local version or migration filename/name.
- **6** local migration files have no exact matching ledger version/name.
- Two ledger versions (`20261016020017` and `20261016020023`) both refer to `20261015215000_grant_manager_documentation_management`; this duplicate-name mapping needs provenance review, not deletion or rewriting.

### Ledger entries without an exact local file/name match

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

### Local migration files without an exact ledger version/name match

- `20261007193000_leo_knowledge_role_filtered_search.sql`
- `20261007194500_leo_knowledge_version_history.sql`
- `20261007195600_leo_knowledge_source_monitor_cron.sql`
- `20261019160000_crm_admin_hr_it_workspace.sql`
- `20261020120000_guard_admin_tab_permission_changes.sql`
- `20261106190100_harden_supabase_admin_default_privileges.sql`

## HR reconciliation results

Read-only inspection of the live database confirms:

- `public.is_hr_manager(uuid)` now permits only Global Admin or `admin_acct` (Manager Admin), with the user-id check bound to `auth.uid()`.
- The four HR tables (`hr_staff_directory`, `hr_job_descriptions`, `hr_tasks`, `hr_daily_reports`) have RLS enabled.
- `anon` has no SELECT or INSERT table privilege on those four tables.
- Authenticated users retain table-level privileges, with RLS remaining the row-access boundary.
- The `guard_admin_tab_permission_changes()` function and its trigger are still absent. The local-only migration `20261020120000_guard_admin_tab_permission_changes.sql` remains a separate review item; it has not been replayed.

The two October 27 ledger entries remain unmatched to local source files. Their exact historical SQL/deployment provenance is still a record-reconciliation gap. Do not replay either repair based on its ledger name alone.

## Travels Stage 1.5 — live schema findings

The current production database was inspected directly:

- `public.travel_bookings` has RLS enabled, but `anon` still has explicit INSERT, SELECT, UPDATE and DELETE table privileges.
- The permissive policy `Anyone can submit a travel booking` still applies to both `anon` and `authenticated` for INSERT.
- Authenticated users retain table CRUD grants; their access is subject to RLS policies.
- The newer migration `20261106182053_harden_public_table_privileges_existing_postgres` revokes TRUNCATE, REFERENCES and TRIGGER capabilities; it does **not** revoke CRUD privileges. It therefore does not close the direct anonymous booking-insert path.
- `travel_enquiry_rate_limits` and `consume_travel_enquiry_rate_limit(text,integer,integer)` do not yet exist in production.
- The role permission `admin:manage_travels` for `admin_acct` does not yet exist.
- `public.user_has_permission(_user_id uuid, _permission_key text)` and `public.is_global_admin(_user_id uuid)` match the named arguments used by the Stage 1.5 Edge Function and UI changes.
- The existing `trg_sync_travel_booking_to_crm` BEFORE INSERT/UPDATE trigger calls `sync_travel_booking_to_crm()`, which creates/links the CRM lead and service journey and writes `customer_id`, `crm_lead_id` and `service_journey_id` onto the booking. Removing the duplicate Edge Function CRM writes therefore uses the existing authoritative trigger path.
- The manager-admin permission row is required before the new management permission checks can succeed for `admin_acct`.

## Migration version reconciliation

The earlier review-branch filename `20261030010000_travel_enquiry_security_and_permissions.sql` is absent from the live ledger, while later migrations are already applied. It must not be replayed under that historical version.

The reviewed corrective migration has therefore been re-versioned as:

`20261108221500_travel_enquiry_security_and_permissions.sql`

This is a new forward corrective migration, not a replay or rewrite of a historical ledger entry. It will:

1. Create the private rate-limit table and service-role-only rate-limit function.
2. Remove all direct `PUBLIC`/`anon` table privileges from `travel_bookings`.
3. Remove the permissive public INSERT policy and replace it with manager/global-admin staff policies.
4. Add the explicit `admin:manage_travels` permission for `admin_acct`.
5. Correct booking update and package-blackout management policies.

The existing CRM trigger and its customer/booking data are preserved. No customer or booking records are deleted or rewritten.

## Release gate

- Apply the new migration only after the revised PR passes GitHub Quality Gate, Deno security tests, documentation checks and Vercel preview.
- Verify anonymous CRUD privileges are false after application, the permissive public INSERT policy is absent, the rate-limit function is executable only by `service_role`, and the manager permission is present.
- Deploy the two reviewed Travel Edge Functions with the merged source and verify the public enquiry path end-to-end.
- Do not run `supabase db push`, insert/delete migration ledger rows, or replay unmatched historical SQL.
- Keep the separate `supabase_admin` default-ACL migration unapplied unless the executor has the required role authority and the change is independently reviewed.
