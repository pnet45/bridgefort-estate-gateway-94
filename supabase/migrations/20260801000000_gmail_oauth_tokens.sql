-- Storage for direct Gmail OAuth tokens (replaces the Lovable connector
-- gateway, which only ever had metadata-scope access and can no longer be
-- reconnected since Lovable access was lost). This table is intentionally
-- NOT readable/writable by any client role — only edge functions, using the
-- service role key, ever touch it. Tokens are sensitive; there's no reason
-- for them to be reachable from the browser at all, so RLS is enabled with
-- zero policies for authenticated/anon rather than trying to write a "only
-- admins" policy that the client could still query against.

CREATE TABLE IF NOT EXISTS public.gmail_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE, -- the Gmail address this token is for
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  connected_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gmail_oauth_tokens ENABLE ROW LEVEL SECURITY;
-- No policies added deliberately — this table is edge-function-only.

DROP TRIGGER IF EXISTS trg_gmail_oauth_tokens_updated_at ON public.gmail_oauth_tokens;
CREATE TRIGGER trg_gmail_oauth_tokens_updated_at
BEFORE UPDATE ON public.gmail_oauth_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- gmail-oauth-callback is necessarily a public endpoint (Google redirects
-- the browser there directly — it can't attach a Supabase Authorization
-- header). Without something tying that callback back to a specific,
-- recently-initiated request from an authenticated admin, anyone could hit
-- the callback URL with a code from their own Google account and have your
-- database store OAuth tokens for THEIR Gmail instead of yours. This table
-- is that tie: gmail-oauth-start creates a one-time, short-lived state
-- value scoped to the admin who requested it; the callback consumes it
-- exactly once and rejects anything else.
CREATE TABLE IF NOT EXISTS public.gmail_oauth_state (
  state text PRIMARY KEY,
  requested_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  used boolean NOT NULL DEFAULT false
);
ALTER TABLE public.gmail_oauth_state ENABLE ROW LEVEL SECURITY;
-- No client policies here either — edge-function-only, same reasoning as gmail_oauth_tokens.
