-- CRITICAL FIX — applied live directly against production on 2026-08-08
-- after diagnosing via Postgres logs (Supabase:get_logs), not from a
-- support report alone. This migration documents that fix for the repo's
-- history; the grants themselves were already applied to the live
-- database before this file was written.
--
-- Root cause: is_super_admin(), is_account_locked(), clear_failed_logins(),
-- and record_failed_login() were created without EXECUTE granted to the
-- `authenticated` (and, for the pre-auth login-lockout functions, `anon`)
-- role. Postgres's error for this is literally "permission denied for
-- function X" — a hard query-killing error, not a benign RLS "no rows"
-- result.
--
-- is_super_admin() alone is referenced in permissive SELECT/INSERT/UPDATE/
-- DELETE policies on 80 of this schema's 86 public tables. In Postgres,
-- multiple permissive policies on the same table are combined with OR —
-- but if evaluating ANY one of them throws an error, the whole query
-- fails, even if a different policy on the same table would have allowed
-- it. That meant every authenticated user's own-row access to `profiles`,
-- `posts`, `orders`, `inspection_bookings`, `notifications`, and dozens of
-- other tables was failing with a blanket 403 — not just admins, everyone,
-- site-wide — for as long as this gap existed.
--
-- This also explains why earlier direct database checks (calling
-- has_role()/user_has_permission()/is_super_admin() via a superuser/
-- service-role SQL connection) all returned correct results with no
-- error: that connection bypasses grant checks entirely, so the exact bug
-- a real browser session hits was invisible from that vantage point.

grant execute on function public.is_super_admin() to authenticated, anon;
grant execute on function public.is_account_locked(text, integer, integer) to authenticated, anon;
grant execute on function public.clear_failed_logins(text) to authenticated, anon;
grant execute on function public.record_failed_login(text, text) to authenticated, anon;
