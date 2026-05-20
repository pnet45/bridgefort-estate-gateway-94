
-- 1) Listings: hide owner contact PII from anonymous visitors
REVOKE SELECT (owner_email, owner_phone, owner_name) ON public.listings FROM anon;
REVOKE SELECT (owner_email, owner_phone, owner_name) ON public.listings FROM PUBLIC;

-- 2) password_reset_otps: remove permissive INSERT policy (creation happens in service-role edge functions only)
DROP POLICY IF EXISTS "Anyone can create OTPs" ON public.password_reset_otps;

-- 3) pending_admin_requests: drop unused password_hash column (credentials live in auth.users)
ALTER TABLE public.pending_admin_requests DROP COLUMN IF EXISTS password_hash;

-- 4) Admin operational tables: remove from realtime publication to prevent any-authenticated-user subscription leaks
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_chat_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_presence;
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_activity_logs;
