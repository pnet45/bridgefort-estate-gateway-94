# Bridgefort Homes Upgrade — Phase 10 Inventory Integrity

Status: IMPLEMENTED

## Objective
Protect the existing estate inventory model from accepting new invalid plot counts without creating a competing inventory schema.

## Findings
- The existing public.estate table already provides the authoritative estate-level inventory fields: total_plots, sold_plots, and is_sold_out.
- public.bh_property_sales already provides a sales/plot reference path.
- One existing estate record currently has total_plots = 1 and sold_plots = 6.
- That existing record was not modified during this phase because correcting it requires confirming the underlying allocation/sales records with Bridgefort operations.

## Implemented
- Added public.validate_estate_inventory_counts().
- Added estate_inventory_counts_guard on public.estate.
- New inserts/updates are rejected when total_plots is negative, sold_plots is negative, or sold_plots exceeds total_plots.
- Existing inconsistent records remain untouched.
- Trigger test was executed against a real estate row and rolled back through the exception path; no production data was changed.
- Remote Supabase migration ledger contains phase_10_inventory_integrity_guard at version 20260929045451.
- Repository migration filename is synchronized to that exact remote version.

## Scope
This phase is intentionally a data-integrity guard only. It does not invent plot/unit tables, change allocation records, or alter historical sales.

## Acceptance
- [x] Existing inventory model inspected
- [x] Invalid existing record identified
- [x] Backend guard implemented
- [x] Guard verified
- [x] No production inventory data modified
- [x] Migration recorded remotely
- [x] Repository migration filename synchronized