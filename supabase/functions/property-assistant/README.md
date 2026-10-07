# Leo — Bridgefort Homes assistant

The website and signed-in mobile app send authenticated messages to this
Supabase Edge Function. Leo uses a separately hosted Ollama-compatible model;
do not put its URL or API key in browser/Vite environment variables.

Configure these Edge Function secrets before deployment:

- `OLLAMA_BASE_URL`: HTTPS base URL reachable from Supabase, such as
  `https://ollama.example.com`. The function appends `/api/chat`.
- `OLLAMA_MODEL`: optional model name; defaults to `qwen2.5:7b`. Set this to an
  installed model, for example `llama3.3:70b` if that model is available.
- `OLLAMA_API_KEY`: optional bearer token for an authenticated Ollama gateway.
- `RESEND_API_KEY`: required only for requested customer follow-up emails.
- `LEO_FROM_EMAIL`: optional verified Resend sender; defaults to
  `Bridgefort Homes <info@bridgeforthomes.com>`.

Apply the `20261007130000_add_leo_assistant_conversations.sql` migration before
deploying. It stores chat history and tracking references until the user account
is deleted; foreign-key cascades remove the records with the account. The
conversation tables are not directly readable or writable by browser roles.

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
