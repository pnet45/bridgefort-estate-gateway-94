# BRIDGEFORT UPGRADE — PHASE 11
## Account & RBAC Reconciliation

**Status: COMPLETE**

### Objective
Reconcile existing user/admin account authorization without deleting accounts or guessing department ownership.

### Findings
- Auth/profile identity linkage is intact: no profiles without matching Auth users were found.
- No orphan legacy user_roles records were found.
- No duplicate (user_id, role) rows were found in the checked role tables.
- The main inconsistency was authorization: legacy admin existed in both admin_roles and user_roles, while the frontend still treated admin / super_admin as a blanket permission source.
- The live role_permissions matrix also contained 19 enabled permissions for the legacy admin role.

### Changes
1. Disabled all 19 legacy admin role-permission entries.
2. Preserved the legacy account/role rows for audit and future controlled migration.
3. Updated src/contexts/auth/AuthContext.tsx so:
   - canonical admin authorization comes from admin_roles and admin_permissions;
   - legacy user_roles are not allowed to grant blanket admin access;
   - disabled role-permission entries are excluded from frontend permission hydration;
   - legacy non-admin business roles remain readable for compatibility.
4. Did not delete, merge, rename, deactivate, or reassign any user account.

### Accounts requiring controlled business-role review
Several legacy admin accounts do not currently have a replacement department role. They were deliberately not auto-mapped because assigning a department or privileged role is a business decision. Existing inactive/legacy accounts remain preserved until management confirms their intended status.

### Verification
- Migration applied successfully in Supabase.
- role_permissions for legacy admin: 0 enabled / 19 total.
- Auth/profile reconciliation found no profile-only accounts.
- The canonical department/global roles remain intact.
- No production customer, payment, booking, or inventory records were modified.

### Release note
This phase removes the blanket legacy-admin authorization path. Existing accounts with canonical roles continue to derive access from those roles. Legacy admin-only accounts now require explicit canonical role assignment before receiving administrative permissions.

**Next phase must not begin until this phase is accepted as complete.**
