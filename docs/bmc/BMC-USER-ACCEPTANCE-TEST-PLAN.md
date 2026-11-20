# BMC Partner Programme — User Acceptance Test Plan

**Release candidate:** PR #129  
**Status:** Draft — execute only in an approved test environment or after authorised production release  
**Audience:** Product owner, Admin/IT, BMC programme owner, division heads and QA

Do not create test partners, approve applications, submit travel enquiries or place orders in production until the BMC database migration and release have been explicitly authorised. Use controlled test accounts and non-settling test transactions.

## 1. Registration and consent

| Test | Expected result | Evidence |
|---|---|---|
| Register a new BMC applicant and select Homes only | One Homes application is created as pending review | Test user ID and application row |
| Register a BMC applicant and select all divisions | Three independent pending applications are created | Three application rows |
| Submit without accepting BMC Agreement | Signup is blocked | UI validation |
| Submit without acknowledging BMC Privacy Notice | Signup is blocked | UI validation |
| Decline optional marketing consent | Signup remains available; marketing consent is false | Consent record |
| Inspect general Terms and Privacy acceptance | General client acceptance remains separate from BMC agreement/privacy evidence | Separate records |
| Revisit Partner Hub before review | All requested divisions remain pending | Partner Hub screenshot |

## 2. Approval and RBAC

| Test | Expected result | Evidence |
|---|---|---|
| User with admin:view_approvals opens BMC queue | Can view application and consent evidence | Read-only queue |
| View-only user attempts approval RPC | Server denies the decision | Permission-denied result |
| User with admin:manage_bmc_partners approves a consented application | Only selected division becomes approved | Audit event |
| Approve without valid BMC consent record | Server rejects approval | RPC error |
| Reject without a reason | Server rejects the decision | RPC error |
| Reject with a reason | Status and reviewer note are recorded | Audit history |
| Suspend an approved division | Division status changes and its referral code becomes inactive | Audit event and code status |
| Reinstate a suspended division | Approval restored and existing division code reactivated | Audit event and code status |
| Attempt direct table/column update | Authenticated direct update is denied | Permission-denied result |
| Attempt profile self-promotion with custom GUC set | profiles.is_pbo remains unchanged | Before/after profile values |

## 3. Division referral journeys

| Division | Test | Expected result |
|---|---|---|
| Homes | Open an approved Homes referral link and complete a new user signup | Signup attribution records the Homes referrer |
| Homes | Use a disabled or invalid Homes code | No attribution is created |
| Travels | Open a Travels referral link, navigate to a destination and submit an enquiry | Referral code persists and booking attribution is recorded |
| Travels | Submit with an inactive or wrong-division code | Enquiry is rejected with a clear message |
| Agrovest | Open an Agrovest referral link, browse a category and add to cart | Referral code persists into the cart and checkout |
| Agrovest | Submit an Agrovest-only order with an approved code | Order attribution is recorded |
| Agrovest | Mix Agrovest and Homes items with one division code | Checkout is rejected before order creation |
| All | Use own referral code | Self-referral is not attributed |
| All | Suspend the division after code creation | Link stops working for new transactions |

## 4. Legacy BH-Realtors compatibility

- Confirm an existing paid BH-Realtors partner can still sign in and use the existing dashboard.
- Confirm legacy pbo_referral_code, sponsor relationships, paid package, activity and historical referral records are unchanged.
- Confirm BMC Homes approval does not set profiles.is_pbo, current_package or is_active.
- Confirm BMC division codes are distinct from legacy BH-Realtors codes.
- Confirm a Homes BMC referral does not silently enrol a client in paid BH-Realtors membership.

## 5. Legal, privacy and Leo controls

- Confirm BMC Agreement and BMC Privacy Notice remain separate from general client Terms of Service and Privacy Policy.
- Confirm current document versions and acceptance timestamps are displayed to authorised reviewers.
- Confirm optional marketing consent can be declined independently.
- Confirm public Leo content contains no staff-only process notes, KYC data or internal review details.
- Confirm staff-only Leo content is unavailable to public users.
- Confirm no commission rates, earnings or payout promises appear until the relevant division schedule is approved.

## 6. Release evidence

Record each result with tester, date, environment, test account reference, pass/fail, screenshot or log reference, and defect ID. Any failed security, consent, referral, privacy or legacy-compatibility test blocks release.

**Sign-off:** Product owner, Technology/Security, BMC programme owner, each division head, Finance and Legal/Privacy reviewers must record their approvals in the Company's controlled document process.
