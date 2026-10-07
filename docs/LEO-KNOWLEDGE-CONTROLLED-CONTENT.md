# Leo Knowledge Base — Controlled Content Pack

**Bridgefort Homes Development Ltd.**  
**Last reviewed:** 7 October 2026

## Access model

- **public:** approved information that may be used for website visitors, customers and Realtors.
- **staff:** internal operational guidance. Leo may retrieve it only for an authorized admin/staff context.
- **restricted:** internal guidance limited to the roles listed on the document. Server-side retrieval must enforce this before the model receives the content.

Do not store passwords, API keys, webhook secrets, access tokens, private client records, unrestricted CRM exports or other credentials in this knowledge base.

## Current published public knowledge

The live knowledge base currently contains these approved public documents:

1. Bridgefort Homes — Home
2. About Bridgefort Homes Development Ltd
3. Properties — Estate Lands
4. ₦5K Daily Promo
5. Services
6. Blog
7. Careers
8. Contact
9. Training
10. Agrovest
11. Bridgefort Travels
12. BHRealtors
13. Leo Public Knowledge & Response Guardrails

Dynamic property prices, availability and promotions must be treated as changing information. Leo should rely on the current published property context and approved knowledge rather than memorizing old figures.

## Internal staff guidance added on 7 October 2026

### Payment Notification Safety & Reconciliation

An outstanding-payment communication must only be based on a payment/account state that has been confirmed and approved according to Bridgefort Homes payment workflow. A payment that is still awaiting confirmation or approval must not be treated as an outstanding unpaid amount merely because a payment request or submission exists.

If an automated message is sent prematurely:
- stop or correct the affected automation;
- notify Customer Retention and Relationship;
- identify affected clients;
- issue a clear correction where necessary;
- escalate disputed balances for account reconciliation.

Leo must never promise that a payment is approved unless the authoritative system confirms it.

The 7 October 2026 incident involved automated outstanding notices being sent before payment confirmation/approval. One client requested clarification and reconciliation. The matter was forwarded to Customer Retention and Relationship, and a corrective communication was sent to 14 affected clients.

### Inspection Booking and Email Automation

An inspection journey should remain linked across:
- inspection booking;
- CRM/service journey;
- client email;
- administrative notification.

The inspection booking ID is the authoritative link for inspection confirmation email automation. When an inspection booking is created, the booking ID must be passed into the email automation.

Leo must not claim that an inspection email was sent unless the system confirms delivery.

### Allocation and Client Documentation

Allocation-related communication must be tied to the correct client, property/estate record and allocation status.

Contract of Sale documents should be prepared from verified client and property information, sent through the approved company communication channel, and recorded as part of the client journey.

Allocation notices must not be treated as proof of payment approval or possession unless the authoritative system and responsible department confirm the status.

### Customer Retention and Relationship Escalation

Customer Retention and Relationship should receive matters involving:
- unclear client account balances;
- payment reconciliation;
- complaints about incorrect payment communications;
- client dissatisfaction requiring relationship management;
- cases requiring a verified account explanation.

Leo should provide only verified information and escalate disputed or unclear balances rather than attempting to reconcile accounts from conversational data.

## Restricted IT guidance

Leo knowledge must be maintained as approved business reference material, not as a storage location for secrets or unrestricted personal/client records.

Every knowledge item should have:
- a clear audience;
- source;
- review date;
- status;
- appropriate role restrictions where required.

When content becomes outdated, archive it or update it rather than leaving conflicting versions published.

API keys, passwords, webhook secrets, access tokens and private client records must never be entered into Leo's knowledge base.

## Leo retrieval rule

The model is not the authorization layer.

The server:
1. verifies the user's identity/session;
2. determines the verified application/admin roles;
3. determines the permitted audience;
4. retrieves only matching published knowledge;
5. passes that filtered knowledge to Leo;
6. allows GPT-OSS-120B to generate the response from the permitted context.

If no reliable approved knowledge is found, Leo should say that it cannot verify the information and escalate instead of inventing an answer.
