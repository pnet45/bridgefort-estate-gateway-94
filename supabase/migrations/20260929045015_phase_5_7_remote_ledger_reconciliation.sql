-- Remote migration-ledger reconciliation for Phase 5/7 security hardening.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_journeys' AND policyname='service_journeys_staff_update' AND cmd='UPDATE') THEN
    RAISE EXCEPTION 'Phase 5 service journey update policy is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='role_permissions' AND policyname='role_permissions_manage_canonical' AND cmd='ALL') THEN
    RAISE EXCEPTION 'Phase 7 role permission policy is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='travel_bookings' AND policyname='travel_bookings_staff_update' AND cmd='UPDATE') THEN
    RAISE EXCEPTION 'Phase 7 travel booking update policy is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='payments_approval_manage' AND cmd='ALL') THEN
    RAISE EXCEPTION 'Phase 7 payment approval policy is missing';
  END IF;
END $$;