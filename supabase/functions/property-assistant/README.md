# Leo — Bridgefort Homes assistant

The website and signed-in mobile app send authenticated messages to this
Supabase Edge Function. Leo uses GroqCloud for hosted inference; do not put the
Groq API key in browser/Vite or mobile-app configuration.

Configure these Edge Function secrets in the Supabase Dashboard under
**Project Settings → Edge Functions → Secrets**, or with the Supabase CLI:

- `GROQ_API_KEY`: required. Create a key in the [Groq Console](https://console.groq.com/keys)
  and set it privately with
  `supabase secrets set --project-ref xyvspvtdaacqfmfocvhw GROQ_API_KEY=your-key`.
- `GROQ_MODEL`: optional; defaults to `openai/gpt-oss-120b`. Choose a
  currently available Groq production model that supports JSON mode. Avoid
  deprecated model IDs such as `llama-3.3-70b-versatile`.
- `RESEND_API_KEY`: required only for requested customer follow-up emails.
- `LEO_FROM_EMAIL`: optional verified Resend sender; defaults to
  `Bridgefort Homes <info@bridgeforthomes.com>`.

Deploy the function after configuring `GROQ_API_KEY`. The
`20261007130000_add_leo_assistant_conversations.sql` migration stores chat
history and tracking references until the user account is deleted; foreign-key
cascades remove the records with the account. The migration is already applied
to the linked Bridgefort Supabase project. The conversation tables are not
directly readable or writable by browser roles.

Leo's server-side boundary is intentionally limited:

- Every chat and transcript restore requires a verified Supabase user session.
- Public context is restricted to published listing fields; unpublished listing
  data, owner contact details, credentials, staff records, CRM, and inbox content
  are not sent to the model.
- When a customer or Realtor asks about their own account, the function queries
  only their own payment plans, orders, and documentation payments through their
  authenticated session and existing row-level security. It does not change
  those records.
- Admin navigation links are filtered by the existing canonical admin
  permissions. Admins may paste an email for a suggested reply; Leo does not
  fetch inboxes. Sending an admin email requires confirmation and the existing
  `send-email` function's mailbox authorization.
- A customer follow-up is sent only when the chat explicitly asks for email,
  or Leo determines email is needed to document a resolution/next step. It
  goes only to that account's verified email address, with a limit of three
  automated follow-ups per user in 24 hours. The email is tracked through the
  existing email-delivery system.
- Admins with `admin:view_crm` can list and open tracked inquiry transcripts.
  The endpoint checks this permission on every request; browser roles cannot
  query the transcript tables directly.

Leo's model context is curated from public listings and the signed-in user's
permitted data; the full source repository and unrestricted database are never
loaded into a prompt. Apply request rate limits at the model gateway before
opening this service to substantial public traffic.
