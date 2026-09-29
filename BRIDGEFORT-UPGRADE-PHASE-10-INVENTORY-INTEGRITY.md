# Bridgefort Homes Upgrade — Phase 10 Inventory Integrity

Status: IMPLEMENTED

## Objective
Protect the existing estate inventory model from accepting new invalid plot counts without creating a competing inventory schema.

## Findings
- The existing `public.estate` table provides the authoritative estate-level inventory fields: `total_plots`, `sold_plots`, and `is_sold_out`.
- `public.bh_property_sales` provides an existing sales/plot reference path, but currently has no rows, so it cannot be used to reconstruct historical sold counts.
- One existing estate record has `total_plots = 1` and `sold_plots = 6`.
- Existing sold-out mismatches were also found, including a 72/72 estate marked `is_sold_out = false`.
- Existing inconsistent records were not modified because correcting historical inventory requires confirmation against Bridgefort allocation/sales records.

## Implemented
- Added `public.validate_estate_inventory_counts()`.
- Added `estate_inventory_counts_guard` on `public.estate`.
- New inserts/updates are rejected when:
  - `total_plots` is negative.
  - `sold_plots` is negative.
  - `sold_plots` exceeds `total_plots`.
- When both counts are present on a new/updated record, `is_sold_out` is automatically synchronized to `sold_plots >= total_plots`.
- Existing inconsistent records remain untouched.
- Trigger rejection was tested against a real estate row through an exception/rollback path; no production data was changed.
- Supabase migration ledger:
  - `20260929045451 — phase_10_inventory_integrity_guard`
  - `20260929045748 — phase_10_inventory_sold_out_consistency`
- Repository migration filenames are synchronized to the exact remote ledger versions.

## Scope
This phase is intentionally an inventory-integrity guard. It does not invent plot/unit tables, change historical allocations, or alter historical sales.

## Operational follow-up
The Fountain Springs 1/6 record and other sold-out mismatches should be reconciled by Operations/Accounts against allocation letters, payment records, and plot records before any historical correction is made.

## Acceptance
- [x] Existing inventory model inspected
- [x] Existing inventory exceptions identified
- [x] Backend count guard implemented
- [x] Sold-out consistency guard implemented
- [x] Guard verified
- [x] No production inventory data modified
- [x] Supabase migration ledger synchronized
- [x] Repository migration files synchronized
