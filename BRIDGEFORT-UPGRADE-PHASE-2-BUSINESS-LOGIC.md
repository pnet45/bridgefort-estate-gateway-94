# Bridgefort Homes Platform Upgrade — Phase 2 Business Logic & Data Contract

Date: 25 September 2026
Repository: pnet45/bridgefort-estate-gateway-94
Supabase project: Bridgefort / xyvspvtdaacqfmfocvhw
Phase status: COMPLETE

## Purpose
This phase converts the Phase 1 audit into the canonical business rules that future database, backend, CRM, admin and UI work must follow. No frontend redesign is included in this phase.

## 1. Core principle
Bridgefort must have one authoritative business record for each customer journey. Public forms create or update a customer/service record; staff work from CRM; approvals change controlled states; downstream records retain the approved snapshot used at the time of the transaction.

Canonical flow:
Lead/Customer -> Service Journey -> Assignment -> Activity -> Approval when required -> Transaction/fulfilment -> Completion -> History

## 2. CRM contract
CRM is the operational centre for customer relationships.
Every lead/customer interaction from Contact, Property Inquiry, Site Inspection, Travel, Agrovest, Training, Wealth consultation and future AI channels must be traceable to a customer where identity is known.

Canonical lead lifecycle:
NEW -> CONTACTED -> QUALIFIED -> INTERESTED -> ACTION_REQUIRED -> IN_PROGRESS -> CONVERTED | LOST | CLOSED

Rules:
- A lead can exist without a registered account.
- A registered customer can have multiple service journeys/leads.
- Duplicate customer records should be merged/linked rather than creating parallel identities.
- Every meaningful staff action creates an activity.
- Follow-ups belong to a lead/service journey and have scheduled/completed/cancelled states.
- Conversion stores the outcome and value; it does not erase the original lead history.
- Assignment determines operational ownership; permission determines what the staff member may do.

## 3. Service journey contract
Each service request must identify service_type and source record. Initial service types:
- PROPERTY
- INSPECTION
- TRAVEL
- AGROVEST
- TRAINING
- WEALTH_CONSULTATION
- GENERAL_ENQUIRY

A service journey carries customer, owner/assignee, status, priority, source, related estate/listing/booking/order where applicable, timestamps and outcome.

## 4. Profile contract
One customer profile workflow must become authoritative.

Profile sections:
1. Identity
2. Contact and residence
3. Employment/business
4. Next of kin
5. Referral/PBO information
6. KYC
7. Organization/corporate information when applicable
8. Terms and declarations

Profile completion is a calculated percentage from required fields, not a hard-coded 100 on save.
Saving a profile is not the same as completing a profile.
Profile states:
DRAFT -> IN_PROGRESS -> COMPLETE -> KYC_PENDING -> KYC_VERIFIED | KYC_REQUIRES_CORRECTION

Only fields required for the current customer journey should block basic profile completion. Sensitive KYC fields must not unnecessarily block ordinary enquiries.

## 5. Estate/property contract
The public estate record represents the development/product. Future inventory must distinguish:
Estate -> Phase/Scheme -> Plot/Unit -> Availability -> Customer allocation

Plot/unit states:
AVAILABLE -> RESERVED -> PAYMENT_PENDING -> SOLD -> ALLOCATED -> DOCUMENTATION -> COMPLETED
Cancellation/expiry may return an eligible reservation to AVAILABLE according to business rules.

Estate data remains reusable for public marketing. Plot/unit data is operational inventory.

## 6. Pricing contract
The existing database already contains extensive pricing/payment integrity migrations, including authoritative live listing price/order snapshots and documentation price integrity. Phase 2 therefore does NOT introduce a competing price system.

Canonical rule:
Approved live price -> public display and new transaction calculation -> immutable transaction/order price snapshot.

Price change lifecycle:
DRAFT_CHANGE -> SUBMITTED -> PENDING_APPROVAL -> APPROVED -> EFFECTIVE
Rejected changes remain historical and do not alter the live price.

Price components must be distinguishable:
- Land/property price
- Development fee
- Documentation fee(s)
- Other approved charges
- Promotion/discount where applicable

Existing payment/order snapshots remain authoritative for historical transactions even after a later price change.

## 7. Admin approval contract
Approval is an action governed by permission, not by frontend role-name lists.

Generic approval lifecycle:
PENDING -> APPROVED | REJECTED | RETURNED_FOR_CORRECTION | CANCELLED

Approval record must preserve:
- request type
- source record
- submitted by
- submitted at
- decision by
- decision at
- decision reason/notes
- previous state
- resulting state

Rules:
- A user cannot approve an action they are not permitted to approve.
- Where separation of duties is required, the requester cannot approve their own request.
- Approval UI visibility must follow canonical permissions.
- Backend/RPC/RLS must enforce the same rule; hiding a button is never sufficient.

## 8. Canonical permission contract
Authorization model:
USER -> BUSINESS ROLE -> DEPARTMENT/SCOPE -> PERMISSION -> ACTION

Existing business roles observed in the database include client, pbo, user, associate, team_leader, manager, admin department roles, admin and super_admin.

Future permission keys should be domain/action based. Examples:
- crm.view
- crm.create
- crm.edit
- crm.assign
- crm.export
- property.view
- property.create
- property.edit
- property.publish
- property.price.propose
- property.price.approve
- inventory.view
- inventory.manage
- payment.view
- payment.verify
- payment.approve
- booking.view
- booking.manage
- booking.approve
- users.view
- users.manage
- roles.view
- roles.manage
- approvals.view
- approvals.decide
- reports.view
- reports.export

Existing permission keys must be mapped before renaming/removing them. No existing permission should be silently dropped during migration.

## 9. Department boundaries
Initial business boundaries:
- Directorate/Global Administration: organization-wide governance and high-level approvals.
- Admin/Operations: administrative workflow and controlled operational tasks.
- Accounts/Finance: financial records, payment verification and financial approvals assigned by policy.
- Sales/CRM: leads, customers, follow-ups, property enquiries and sales workflow.
- Customer Service: customer support, communication, requests and service follow-up.
- Inspection: inspections and field scheduling.
- Legal: legal/documentation workflow.
- IT: platform, technical administration, security and controlled system management.
- Agro: Agrovest service operations.
- Travels: travel booking and processing.
- Quality Control: quality/compliance tasks.

Department membership does not automatically grant every permission in that department. Permissions are explicit.

## 10. Travel booking contract
Travel booking is a service journey linked to CRM.

Booking lifecycle:
NEW -> REVIEWING -> QUOTATION -> CUSTOMER_CONFIRMATION -> PAYMENT_PENDING -> PROCESSING -> CONFIRMED -> COMPLETED
Alternative terminal states:
CANCELLED | DECLINED | EXPIRED

Booking must preserve:
- customer identity/contact
- destination
- departure/return
- travellers
- package
- notes/special requests
- assigned travel staff
- status history
- CRM/service-journey link
- payment/quotation references when introduced

Existing submit-travel-booking and manage-travel-booking Edge Functions remain the service boundary unless a later implementation proves a safer replacement is necessary.

## 11. Notification/activity contract
Notifications are not the system of record. They point users to the underlying CRM/service/approval record.

Every actionable notification should identify:
- recipient
- type
- source record
- action/state
- link/deep link
- read state
- created time.

## 12. Audit contract
Controlled business changes must be auditable.
Audit events should cover at minimum:
- role/permission changes
- approval decisions
- price changes
- estate/inventory changes
- payment decisions
- booking status changes
- profile/KYC decisions
- user account status changes.

Audit records are append-only from the application perspective.

## 13. Data integrity rules
- Foreign keys must be used where a stable relationship exists.
- Status values must be constrained or centrally validated.
- Money must be stored as numeric and accompanied by currency where the domain requires it.
- Historical financial/order records must retain immutable snapshots.
- Public/customer-facing queries must never depend on client-editable authorization metadata.
- Sensitive authorization must be enforced by Supabase RLS/RPC/backend controls.
- Existing security-definer functions must remain deliberately scoped and must not become an accidental public API.

## 14. Current database alignment
The live Supabase database already contains significant prior work for RBAC, payment integrity, authoritative order snapshots, documentation pricing, subscription integrity, approval guards and security hardening.

Important existing migration families include:
- canonical admin RBAC and department authorization
- admin payment/approval action guards
- authoritative live listing price/order snapshot
- authoritative documentation pricing/payment
- installment and subscription integrity
- admin approval role alignment
- recent admin request RLS alignment.

Therefore future implementation must extend these structures rather than creating parallel tables or conflicting authorization paths.

## 15. Phase 2 implementation gates
Before Phase 3 is allowed:
1. Every module must have a documented state machine.
2. Every approval action must map to a canonical permission.
3. Profile completion must have one authoritative definition.
4. Pricing must use the existing authoritative transaction snapshot architecture.
5. Travel bookings must have a defined CRM linkage.
6. Estate inventory must have an agreed Estate -> Phase -> Plot/Unit model.
7. Legacy permission names must have a migration map before removal.
8. Audit requirements must be defined for all controlled changes.

## 16. Security gate discovered during Phase 2 verification
Supabase security advisors currently report 42 authenticated-callable SECURITY DEFINER functions, plus an OTP expiry warning, leaked-password-protection warning and an available Postgres security patch.
This is not silently ignored. It is recorded as a required security workstream before the production-ready release. It should be handled deliberately because some functions are intentionally privileged and changing them blindly could break authorization.

## Phase 2 gate
STATUS: COMPLETE

Phase 2 has established the canonical business rules and data contracts for the requested CRM, approvals, profiles, estate/land inventory, pricing, travel booking, permissions, notifications and audit model.

Phase 3 may now begin. Phase 3 should implement the business/data foundation first and verify it before any major UI redesign.