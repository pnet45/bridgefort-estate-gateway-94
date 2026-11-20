# BMC Partner Programme — Legal, Privacy and Management Review Checklist

**Company:** Bridgefort Homes Development Ltd  
**Programme:** Bridgefort Multi-Business Consultants (BMC)  
**Status:** Internal review handoff — not legal approval  
**Review date:** 20 November 2026

This checklist accompanies the BMC Partner Agreement and BMC Privacy Notice. It does not replace legal advice, a Data Protection Impact Assessment where required, or management approval. The documents must remain drafts until the authorised reviewers record their decisions.

## 1. Nigerian legal counsel — Partner Agreement

- Confirm the correct contracting entity, registered company details, notice addresses and authority of signatories.
- Confirm the independent-consultant / referral-partner relationship is accurately characterised and does not create unintended employment, agency, franchise, partnership or fiduciary obligations.
- Review each division's scope of work, prohibited representations, authority limits, marketing approval and customer-funds handling.
- Confirm whether any sector-specific rules apply to real estate marketing, travel services, agriculture/agribusiness, investment solicitation or financial promotions.
- Review referral attribution, qualifying events, lead ownership, duplicate referrals, self-referrals, disputes, reversals, clawbacks and record retention.
- Approve a separate written commission schedule for each division before any commission rate, eligibility or payout promise is communicated.
- Confirm treatment of tax, withholding, invoicing, statutory deductions and payment documentation.
- Review confidentiality, intellectual property, brand use, non-circumvention, customer protection and post-termination restrictions for enforceability and proportionality.
- Review suspension, investigation, notice, opportunity to respond, termination, earned commission treatment and appeal/escalation routes.
- Review liability allocation, indemnities, exclusions, insurance requirements and limitations under applicable law.
- Confirm governing law, escalation, mediation/arbitration choices, court jurisdiction and dispute notices.
- Confirm amendment, versioning, renewal, electronic acceptance, evidence, effective date and precedence between the agreement and division schedules.
- Confirm that no clause purports to exclude statutory rights or liability that cannot lawfully be excluded.

## 2. Data Protection Officer / privacy counsel — BMC Privacy Notice

- Confirm the controller(s), any joint-controller arrangements and the responsibilities of each division.
- Map the personal data collected for applicants, approved partners, referees, referred customers, staff reviewers and business representatives.
- Confirm the lawful basis for each purpose, including onboarding, identity verification, partner administration, referral attribution, commission administration, security, fraud prevention and marketing.
- Ensure optional marketing consent is separate, specific, withdrawable and not a condition of applying.
- Confirm whether a Data Protection Impact Assessment or other risk assessment is required for identity documents, financial information, profiling, referral monitoring or any high-risk processing.
- Verify processor/subprocessor contracts, access restrictions, confidentiality, security, breach notification, deletion and audit obligations.
- Verify international transfer mechanisms and safeguards for hosting, analytics, communications and other service providers.
- Define concrete retention periods for identity documents, consent records, referral attribution, commission records, support cases and audit logs.
- Confirm data-subject request intake, identity verification, response timelines, exemptions and escalation to the Nigeria Data Protection Commission where appropriate.
- Confirm privacy notices and consent records for referred customers whose information is captured through signups, travel bookings or orders.
- Confirm incident response, breach assessment, notification responsibilities and contact routes.
- Ensure public Leo responses cannot disclose staff-only application notes, KYC records, bank details or individual partner data.

## 3. Division heads — operating schedules

Each division must approve its own written operating and commission schedule before partner activation is treated as permission to conduct commercial activity. Use the companion template at `docs/bmc/BMC-DIVISION-SCHEDULE-APPROVAL-TEMPLATE.md`; do not fill in rates or payout promises until Finance and Management approve them.

- **Homes:** property lead qualification, inspection, subscription, reservation, payment, documentation, allocation, cancellation/refund, attribution and commission conditions.
- **Travels:** enquiry qualification, booking, payment, cancellation/refund, supplier fulfilment, chargebacks, attribution and commission conditions.
- **Agrovest:** product/operation eligibility, subscription/order, payment, fulfilment, cancellations/refunds, delivery/harvest conditions, attribution and commission conditions.
- Define what counts as a valid referral, how duplicate or existing customers are treated, how attribution windows work and how disputes are decided.
- Confirm that referral attribution alone is not a commission entitlement and that unpaid, refunded, cancelled or disputed transactions are handled consistently.
- Approve the partner conduct rules, marketing materials, customer escalation route and prohibited claims.

## 4. Management and Finance approval

- Approve the BMC programme owner and the delegated approvers for each division.
- Approve onboarding evidence requirements and identity/business verification procedures.
- Approve the commission schedules, payout frequency, minimum thresholds, tax handling and reconciliation controls.
- Approve bank-detail change verification and segregation of duties for payout processing.
- Approve the partner suspension, termination and appeal procedures.
- Confirm that the company can operationally support each division before opening applications.

## 5. Technology and security release gates

- Independently review migrations 20261120120000, 20261120130000, 20261120140000 and 20261120150000 against the actual production schema.
- Execute the migrations in an approved safe test database and verify rollback/recovery procedures before production release.
- Test signup acceptance capture, exact agreement/privacy versions, independent division approval, rejection reasons, suspension/reinstatement and audit history.
- Verify no BMC approval changes legacy profiles.is_pbo, current_package, is_active, paid membership purchases or historical sponsor relationships.
- Verify referral codes are generated only for approved divisions and deactivated on suspension/rejection/withdrawal.
- Test Homes signup attribution, Travels booking attribution and Agrovest-only order attribution, including invalid codes, inactive codes, self-referrals, anonymous travel enquiries and mixed carts.
- Confirm attribution records do not calculate commission or initiate payouts.
- Verify role permissions, RLS, function grants, direct table/column privileges and audit-log access.
- Confirm public Leo content and staff-only Leo content are published to their correct audiences only after approval.

## 6. Approval record

Record the review outcome in the Company's approved document-control process. Do not treat this repository checklist as evidence of approval.

| Review area | Reviewer | Decision | Date / reference |
|---|---|---|---|
| Nigerian legal counsel — Agreement | Pending | Pending | Pending |
| DPO / privacy counsel — Privacy Notice | Pending | Pending | Pending |
| Homes division schedule | Pending | Pending | Pending |
| Travels division schedule | Pending | Pending | Pending |
| Agrovest division schedule | Pending | Pending | Pending |
| Management / Finance | Pending | Pending | Pending |
| Technology / security release | Pending | Pending | Pending |

**Release rule:** keep BMC documents in draft and keep the implementation unmerged until the required legal, privacy, division, database and security approvals are evidenced.
