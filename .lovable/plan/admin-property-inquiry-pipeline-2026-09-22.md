# Admin Property Inquiry Pipeline

## Goal
Create one secure admin pipeline that captures property interest from inspections, contact forms, listing email/WhatsApp actions, and other property actions; assigns each inquiry to an admin or staff member; schedules follow-ups; and records complete won/lost conversion outcomes.

## What will change

### 1. Secure inquiry data model
- Extend the existing CRM lead records with direct links to an estate or marketplace listing, the originating customer/profile, source record, assignee, priority, and conversion fields.
- Store conversion outcome, close date, amount, won/lost reason, and optional linked order/payment.
- Prevent duplicate automatic leads from the same source action.
- Add database validation, indexes, timestamps, grants, and row-level access so only authorized admins/staff can manage the pipeline.
- Preserve all existing CRM lead and follow-up data.

### 2. Automatic lead capture
- Turn successful inspection bookings and property-related contact submissions into CRM leads automatically.
- Add a secure inquiry capture function for listing email, WhatsApp, phone, and information-request actions.
- Record the exact property, source channel, customer identity when signed in, and useful context without exposing private listing-owner data.
- Log every captured action in the lead activity timeline.

### 3. Admin pipeline experience
- Upgrade the existing CRM area into a property-focused pipeline with status columns and a compact list view.
- Support statuses: New, Contacted, Qualified, Proposal, Won, and Lost.
- Add filters for status, assignee, property, source, priority, date, and overdue follow-ups, plus search and CSV export.
- Let admins assign leads only to admin or staff accounts.
- Show property details, contact details, source, owner, next action, overdue state, and full activity history.

### 4. Follow-ups and outcomes
- Create, edit, complete, and cancel follow-ups for calls, email, WhatsApp, meetings, and site visits.
- Record notes and contact activity in a chronological audit trail.
- Require complete outcome details when marking a lead Won or Lost.
- For Won leads, capture property, value, close date, and optional order/payment link; for Lost leads, capture reason and closing notes.

### 5. Reporting and notifications
- Add pipeline totals, overdue follow-ups, win rate, conversion value, and breakdowns by property, source, and assignee.
- Surface new inquiries and overdue work in the admin experience using the existing notification patterns.
- Keep conversion reporting linked to the existing property analytics without creating duplicate sales records.

### 6. Validation
- Verify the public inquiry actions create or update the correct lead.
- Verify admin/staff assignment, status transitions, follow-up completion, and won/lost outcomes.
- Confirm unauthorized users cannot read or change CRM data.
- Run type checks and confirm the preview build is successful.

## Technical details
- Use the existing `crm_leads`, `crm_follow_ups`, and `crm_lead_activities` tables rather than creating a parallel CRM.
- Apply schema changes through a Supabase migration and keep explicit Data API grants before RLS policies.
- Use server-side functions/triggers for automatic capture and deduplication, with `public.has_role()`/approved permission helpers for authorization.
- Keep `estate` and `listings` references separate to preserve the existing property architecture.
- Use the existing Admin Console CRM permission and design system.
